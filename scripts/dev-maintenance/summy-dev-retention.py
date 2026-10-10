#!/usr/bin/env python3
import argparse
import fcntl
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HOST = "summy-test"
ROOT = Path("/opt/summy-test")
RELEASES = ROOT / "releases"
BACKUPS = ROOT / "backups"
LIVE_WEB = ROOT / "website"
LOCK = Path("/var/lock/summy-test-deploy.lock")
LOG_DIR = Path("/var/log/summy-dev-cleanup")
LOG_KEEP = 30
MARKER = re.compile(r"^([a-z0-9]+)-active$")
RELEASE_PATH = re.compile(r"/opt/summy-test/releases/([^/\"'\s]+)")
EX_OK, EX_REFUSED, EX_INVENTORY, EX_PARTIAL, EX_ERROR, EX_LOCKED = 0, 2, 3, 5, 6, 75


class InventoryError(Exception):
    pass


def size_of(path):
    total = 0
    for top, _, files in os.walk(path, onerror=None):
        for name in files:
            try:
                total += os.lstat(os.path.join(top, name)).st_size
            except OSError:
                pass
    if path.is_file():
        total = path.stat().st_size
    return total


def free_bytes():
    st = os.statvfs("/")
    return st.f_bavail * st.f_frsize


def container_refs():
    ids = subprocess.run(["docker", "ps", "-aq"], capture_output=True, text=True)
    if ids.returncode != 0:
        raise InventoryError("docker ps: exit %s" % ids.returncode)
    names = set()
    paths = []
    for cid in ids.stdout.split():
        r = subprocess.run(["docker", "inspect", cid], capture_output=True, text=True)
        if r.returncode != 0:
            raise InventoryError("docker inspect %s: exit %s" % (cid, r.returncode))
        labels = json.loads(r.stdout)[0]["Config"].get("Labels") or {}
        for key in ("com.docker.compose.project.working_dir", "com.docker.compose.project.config_files",
                    "com.docker.compose.project.environment_file"):
            for item in (labels.get(key) or "").split(","):
                if item.strip():
                    paths.append(item.strip())
    for item in paths:
        names.update(RELEASE_PATH.findall(item + "/"))
    return names, paths


def referenced_closure(seed):
    keep = set(seed)
    queue = list(seed)
    while queue:
        name = queue.pop()
        base = RELEASES / name
        if not base.is_dir():
            continue
        for path in base.rglob("*.json"):
            try:
                if path.stat().st_size > 5 * 1024 * 1024:
                    continue
                text = path.read_text(errors="replace")
            except OSError:
                continue
            for found in RELEASE_PATH.findall(text):
                if found not in keep:
                    keep.add(found)
                    queue.append(found)
    return keep


def release_plan(keep_per_product, grace_hours, now):
    by_product = {}
    entries = sorted(p for p in RELEASES.iterdir() if p.is_dir())
    for path in entries:
        for marker in path.iterdir():
            m = MARKER.match(marker.name)
            if m and marker.is_file():
                by_product.setdefault(m.group(1), []).append((marker.stat().st_mtime, path.name))
    keep = {}
    for product, rows in by_product.items():
        for _, name in sorted(rows, reverse=True)[:keep_per_product]:
            keep.setdefault(name, []).append("%s release (newest %d)" % (product, keep_per_product))
    seed, _ = container_refs()
    for name in referenced_closure(seed):
        keep.setdefault(name, []).append("referenced by a container")
    for path in entries:
        age = (now - path.stat().st_mtime) / 3600
        if age < grace_hours:
            keep.setdefault(path.name, []).append("younger than %d h" % grace_hours)
    remove = [path for path in entries if path.name not in keep]
    return keep, remove


def backup_entries():
    rows = []
    for path in BACKUPS.iterdir():
        if path.is_dir() or path.suffix == ".dump":
            rows.append(path)
    return sorted(rows, key=lambda p: p.stat().st_mtime, reverse=True)


def backup_plan(keep_backups):
    rows = backup_entries()
    keep, remove = rows[:keep_backups], rows[keep_backups:]
    return keep, remove


def pointer_plan(removed):
    gone = {str(p) for p in removed}
    rows = []
    for path in BACKUPS.iterdir():
        if path.is_file() and path.name.endswith("-LATEST"):
            target = path.read_text().strip()
            if target in gone or not Path(target).exists():
                rows.append(path)
    return rows


def website_plan(now, grace_hours):
    rows = sorted(p for p in ROOT.iterdir() if p.is_dir() and p.name.startswith("website-") and p != LIVE_WEB)
    prev = [p for p in rows if p.name.startswith("website-prev-")]
    keep = set()
    if prev:
        keep.add(max(prev, key=lambda p: p.stat().st_mtime))
    for path in rows:
        if (now - path.stat().st_mtime) / 3600 < grace_hours and path.name.startswith("website-next-"):
            keep.add(path)
    return sorted(keep), [p for p in rows if p not in keep]


def write_receipt(receipt):
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    path = LOG_DIR / ("retention-%s.json" % receipt["started"].replace(":", "").replace("-", "")[:15])
    path.write_text(json.dumps(receipt, indent=1, ensure_ascii=False))
    old = sorted(LOG_DIR.glob("retention-*.json"))
    for item in old[:-LOG_KEEP]:
        item.unlink()
    return path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--keep-backups", type=int, default=2)
    parser.add_argument("--keep-releases", type=int, default=3)
    parser.add_argument("--grace-hours", type=int, default=24)
    args = parser.parse_args()
    if socket.gethostname() != HOST:
        print("refused: host is not " + HOST)
        return EX_REFUSED
    if not 2 <= args.keep_backups <= 20 or not 3 <= args.keep_releases <= 20 or not 6 <= args.grace_hours <= 2160:
        print("refused: parameters out of range")
        return EX_REFUSED
    lock = open(LOCK, "a")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("lock busy, skipped")
        return EX_LOCKED
    now = time.time()
    receipt = dict(started=datetime.now(timezone.utc).isoformat(timespec="seconds"), apply=args.apply,
                   params=vars(args), free_before=free_bytes(), removed=[], failed=[])
    try:
        keep_rel, remove_rel = release_plan(args.keep_releases, args.grace_hours, now)
        keep_bak, remove_bak = backup_plan(args.keep_backups)
        pointers = pointer_plan(remove_bak)
        keep_web, remove_web = website_plan(now, args.grace_hours)
    except (InventoryError, OSError, ValueError) as exc:
        receipt["error"] = "inventory: %s" % exc
        write_receipt(receipt)
        print(receipt["error"])
        return EX_INVENTORY
    receipt["keep"] = dict(releases={k: v for k, v in sorted(keep_rel.items())},
                           backups=[p.name for p in keep_bak], website=[p.name for p in keep_web])
    plan = [("release", p) for p in remove_rel] + [("backup", p) for p in remove_bak] + \
           [("pointer", p) for p in pointers] + [("website", p) for p in remove_web]
    receipt["plan"] = [dict(kind=k, path=str(p)) for k, p in plan]
    print("keep releases: %d, remove releases: %d" % (len(keep_rel), len(remove_rel)))
    print("keep backups: %s" % ", ".join(p.name for p in keep_bak))
    print("remove backups: %d, pointers: %d, website dirs: %d" % (len(remove_bak), len(pointers), len(remove_web)))
    if not args.apply:
        for kind, path in plan:
            print("plan %s %s" % (kind, path))
        receipt["finished"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        print("receipt " + str(write_receipt(receipt)))
        return EX_OK
    code = EX_OK
    try:
        for kind, path in plan:
            size = size_of(path)
            try:
                if path.is_dir() and not path.is_symlink():
                    shutil.rmtree(path)
                else:
                    path.unlink()
                receipt["removed"].append(dict(kind=kind, path=str(path), bytes=size))
            except OSError as exc:
                receipt["failed"].append(dict(kind=kind, path=str(path), error=str(exc)))
                code = EX_PARTIAL
    except Exception as exc:
        receipt["error"] = repr(exc)
        code = EX_ERROR
    finally:
        receipt["free_after"] = free_bytes()
        receipt["finished"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        path = write_receipt(receipt)
    print("removed %d, failed %d, freed %.1f GB, receipt %s" % (
        len(receipt["removed"]), len(receipt["failed"]),
        (receipt["free_after"] - receipt["free_before"]) / 1024 ** 3, path))
    return code


if __name__ == "__main__":
    sys.exit(main())
