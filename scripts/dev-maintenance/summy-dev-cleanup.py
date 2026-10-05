#!/usr/bin/env python3
import argparse
import fcntl
import json
import os
import re
import socket
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

HOST = "summy-test"
ROOT = Path("/opt/summy-test")
RELEASES = ROOT / "releases"
LOCK = Path("/var/lock/summy-test-deploy.lock")
LOG_DIR = Path("/var/log/summy-dev-cleanup")
LOG_KEEP = 30
SENTINEL_CONTAINER = "summy-stand-postgres-1"
FAMILIES = [
    re.compile(r"^summy-[a-z0-9-]+-backend$"),
    re.compile(r"^summy-[a-z0-9-]+-api$"),
    re.compile(r"^summy-stand-api$"),
    re.compile(r"^summy-[a-z0-9-]+-client$"),
    re.compile(r"^summy-client$"),
    re.compile(r"^adminapp$"),
    re.compile(r"^bff-bff$"),
    re.compile(r"^summy-[a-z0-9-]+-ci$"),
]
PRODUCTS = {
    "backend": lambda tag, sha, rel: ["summy-%s-backend:%s" % (tag, sha)],
    "crm": lambda tag, sha, rel: ["adminapp:crm-%s" % sha, "adminapp:pre-%s" % rel],
    "master": lambda tag, sha, rel: ["bff-bff:master-%s" % sha, "bff-bff:pre-%s" % rel],
    "client": lambda tag, sha, rel: ["summy-%s-client:%s" % (tag, sha), "summy-client:pre-%s" % rel],
}
SHA_ID = re.compile(r"sha256:[0-9a-f]{64}")
EX_LOCKED = 75


class InventoryError(Exception):
    pass


def run(args, check=True):
    r = subprocess.run(args, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise InventoryError("%s: exit %s %s" % (" ".join(args[:3]), r.returncode, r.stderr.strip()[:300]))
    return r


def free_bytes():
    st = os.statvfs("/")
    return st.f_bavail * st.f_frsize


def compose_images(path):
    try:
        conf = json.loads(Path(path).read_text())
    except (OSError, ValueError):
        return []
    services = conf.get("services") if isinstance(conf, dict) else None
    if not isinstance(services, dict):
        return []
    return sorted({s["image"] for s in services.values() if isinstance(s, dict) and isinstance(s.get("image"), str)})


def read_json(path):
    try:
        return json.loads(Path(path).read_text())
    except (OSError, ValueError):
        return None


def images():
    res = {}
    out = run(["docker", "images", "--no-trunc", "--format", "{{json .}}"]).stdout
    for line in out.splitlines():
        j = json.loads(line)
        created = datetime.strptime(j["CreatedAt"][:25].strip(), "%Y-%m-%d %H:%M:%S %z")
        res.setdefault(j["ID"], {"refs": [], "created": created, "size": j["Size"]})
        if j["Repository"] != "<none>" and j["Tag"] != "<none>":
            res[j["ID"]]["refs"].append("%s:%s" % (j["Repository"], j["Tag"]))
    if not res:
        raise InventoryError("no images listed")
    return res


def containers():
    ids = run(["docker", "ps", "-a", "-q", "--no-trunc"]).stdout.split()
    if not ids:
        raise InventoryError("no containers listed")
    data = json.loads(run(["docker", "inspect", *ids]).stdout)
    return [{"name": c["Name"].lstrip("/"), "image": c["Image"], "ref": c["Config"]["Image"],
             "compose": c["Config"]["Labels"].get("com.docker.compose.project.config_files") or ""} for c in data]


def plan(grace_hours, keep):
    imgs = images()
    conts = containers()
    if not any(c["name"] == SENTINEL_CONTAINER for c in conts):
        raise InventoryError("sentinel container missing")
    by_ref = {r: iid for iid, v in imgs.items() for r in v["refs"]}
    protected = {}

    def protect(iid, why):
        if iid in imgs:
            protected.setdefault(iid, []).append(why)

    for c in conts:
        protect(c["image"], "container:" + c["name"])
        for f in c["compose"].split(","):
            for r in compose_images(f) if f.endswith(".json") else []:
                protect(by_ref.get(r), "live-compose:" + c["name"])
    now = time.time()
    rels = sorted((d for d in RELEASES.iterdir() if d.is_dir()), key=lambda d: d.stat().st_mtime, reverse=True)
    if not rels:
        raise InventoryError("no release dirs")
    kept = {k: [] for k in PRODUCTS}
    for d in rels:
        cfg = read_json(d / "config.json") or {}
        man = read_json(d / "manifest.json") or {}
        targets = {k: (v.get("sha") or "")[:7] for k, v in (man.get("targets") or {}).items() if isinstance(v, dict)}
        fresh = now - d.stat().st_mtime < max(grace_hours, 24) * 3600
        roles = []
        for k, refs in PRODUCTS.items():
            if k in targets and (d / (k + "-active")).exists() and len(kept[k]) < keep:
                kept[k].append(d.name)
                roles.append(k)
        if not roles and not fresh:
            continue
        why = "release:" + d.name + (":fresh" if fresh else ":" + ",".join(roles))
        for k in (roles if not fresh else targets):
            if k in PRODUCTS:
                for r in PRODUCTS[k](cfg.get("tag"), targets.get(k, ""), d.name):
                    protect(by_ref.get(r), why)
        if cfg.get("old_backend_image"):
            protect(by_ref.get(cfg["old_backend_image"]), why)
        for f in d.glob("*.json"):
            for r in compose_images(f):
                protect(by_ref.get(r), why)
        for name in ("state.json", "progress.log"):
            try:
                for iid in SHA_ID.findall((d / name).read_text()):
                    protect(iid, why)
            except OSError:
                pass
    limit = datetime.now(timezone.utc) - timedelta(hours=grace_hours)
    candidates, kept_other = [], []
    for iid, v in imgs.items():
        if iid in protected:
            continue
        if v["created"] > limit:
            kept_other.append({"id": iid, "refs": v["refs"], "reason": "grace"})
            continue
        repos = [r.rsplit(":", 1)[0] for r in v["refs"]]
        if not repos or all(any(p.match(x) for p in FAMILIES) for x in repos):
            candidates.append({"id": iid, "refs": sorted(v["refs"]), "created": v["created"].isoformat(), "size": v["size"]})
        else:
            kept_other.append({"id": iid, "refs": v["refs"], "reason": "not a release image family"})
    return {"protected": {k: sorted(set(v)) for k, v in protected.items()}, "keptReleases": kept,
            "candidates": sorted(candidates, key=lambda c: c["created"]), "keptOther": kept_other,
            "images": len(imgs), "containers": len(conts)}


def remove(cands):
    done = []
    for c in cands:
        live = {x["image"] for x in containers()}
        current = images().get(c["id"])
        if current is None:
            done.append({**c, "result": "already gone"})
            continue
        if c["id"] in live or sorted(current["refs"]) != c["refs"]:
            done.append({**c, "result": "skipped: references changed"})
            continue
        results = []
        for ref in c["refs"] or [c["id"]]:
            r = run(["docker", "rmi", ref], check=False)
            results.append({"ref": ref, "exit": r.returncode, "err": r.stderr.strip()[:200]})
        done.append({**c, "result": "removed" if all(x["exit"] == 0 for x in results) else "partial", "rmi": results})
    return done


def write_log(rec):
    LOG_DIR.mkdir(mode=0o750, exist_ok=True)
    path = LOG_DIR / ("cleanup-%s.json" % time.strftime("%Y%m%dT%H%M%S"))
    path.write_text(json.dumps(rec, ensure_ascii=False, indent=1, default=str))
    logs = sorted(LOG_DIR.glob("cleanup-*.json"))
    for old in logs[:-LOG_KEEP]:
        old.unlink()
    return path


def main():
    ap = argparse.ArgumentParser(description="Weekly Dev cleanup of unused release images and caches (dry-run by default)")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--grace-hours", type=float, default=48)
    ap.add_argument("--keep-releases", type=int, default=3)
    ap.add_argument("--cache-hours", type=int, default=72)
    ap.add_argument("--journal-max", default="500M")
    a = ap.parse_args()
    if a.keep_releases < 3 or a.grace_hours < 6 or a.cache_hours < 24:
        print("refused: retention below safe minimum (keep>=3, grace>=6h, cache>=24h)")
        return 2
    rec = {"startedAt": datetime.now().astimezone().isoformat(timespec="seconds"), "mode": "apply" if a.apply else "dry-run",
           "args": vars(a), "freeBefore": free_bytes()}
    if socket.gethostname() != HOST or not RELEASES.is_dir():
        rec["exit"] = 2
        rec["error"] = "wrong host or workspace"
        print(json.dumps(rec, default=str))
        return 2
    fh = open(LOCK, "a")
    try:
        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        rec["exit"] = EX_LOCKED
        rec["result"] = "skipped: deploy lock busy"
        rec["log"] = str(write_log(rec))
        print(json.dumps({k: rec[k] for k in ("mode", "result", "exit", "log")}))
        return EX_LOCKED
    try:
        try:
            p = plan(a.grace_hours, a.keep_releases)
        except (InventoryError, ValueError, KeyError) as e:
            rec["exit"] = 3
            rec["error"] = "inventory failed, nothing removed: %s" % e
            rec["log"] = str(write_log(rec))
            print(json.dumps({k: rec[k] for k in ("mode", "error", "exit", "log")}))
            return 3
        rec["plan"] = p
        if a.apply:
            rec["removed"] = remove(p["candidates"])
            r = run(["docker", "builder", "prune", "-f", "--filter", "until=%dh" % a.cache_hours], check=False)
            rec["builderPrune"] = {"exit": r.returncode, "tail": r.stdout.strip().splitlines()[-1:] if r.stdout else []}
            r = run(["apt-get", "clean"], check=False)
            rec["aptClean"] = r.returncode
            r = run(["journalctl", "--vacuum-size=" + a.journal_max], check=False)
            rec["journalVacuum"] = r.returncode
        rec["freeAfter"] = free_bytes()
        rec["finishedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
        rec["exit"] = 0
        rec["log"] = str(write_log(rec))
        removed = [x for x in rec.get("removed", []) if x["result"] == "removed"]
        print(json.dumps({"mode": rec["mode"], "candidates": len(p["candidates"]), "removed": len(removed),
                          "protected": len(p["protected"]), "keptReleases": p["keptReleases"],
                          "freeBefore": rec["freeBefore"], "freeAfter": rec["freeAfter"], "log": rec["log"], "exit": 0},
                         ensure_ascii=False))
        return 0
    finally:
        fcntl.flock(fh, fcntl.LOCK_UN)
        fh.close()


if __name__ == "__main__":
    sys.exit(main())
