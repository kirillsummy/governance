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
IMAGE_REF = re.compile(r"^[a-z0-9][a-z0-9._/-]*(:[A-Za-z0-9_][A-Za-z0-9._-]{0,127})?(@sha256:[0-9a-f]{64})?$")
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
    "crm": lambda tag, sha, rel: ["adminapp:crm-%s" % sha],
    "master": lambda tag, sha, rel: ["bff-bff:master-%s" % sha],
    "client": lambda tag, sha, rel: ["summy-%s-client:%s" % (tag, sha)],
}
PRODUCT_FAMILY = {
    "backend": re.compile(r"^(summy-[a-z0-9-]+-backend|summy-[a-z0-9-]+-api|summy-stand-api)$"),
    "crm": re.compile(r"^adminapp$"),
    "master": re.compile(r"^bff-bff$"),
    "client": re.compile(r"^(summy-[a-z0-9-]+-client|summy-client)$"),
}
PREVIOUS = {
    "crm": "adminapp:pre-%s",
    "master": "bff-bff:pre-%s",
    "client": "summy-client:pre-%s",
}
COMPOSE_JSON = re.compile(r"^(backend-[a-z-]+|client-[a-z-]+)\.json$")
NON_COMPOSE_JSON = {"config.json", "manifest.json", "state.json", "preserved.sha256.json", "backup.json"}
SHA40 = re.compile(r"^[0-9a-f]{40}$")
IMAGE_ID = re.compile(r"sha256:[0-9a-f]{64}")
EX_OK, EX_REFUSED, EX_INVENTORY, EX_BLOCKED, EX_PARTIAL, EX_ERROR, EX_LOCKED = 0, 2, 3, 4, 5, 6, 75


class InventoryError(Exception):
    pass


def run(args):
    return subprocess.run(args, capture_output=True, text=True)


def checked(args):
    r = run(args)
    if r.returncode != 0:
        raise InventoryError("%s: exit %s %s" % (" ".join(args[:3]), r.returncode, (r.stderr or "").strip()[:300]))
    return r.stdout


def free_bytes():
    st = os.statvfs("/")
    return st.f_bavail * st.f_frsize


def load_json(path):
    try:
        return json.loads(Path(path).read_text())
    except FileNotFoundError:
        return FileNotFoundError
    except (OSError, ValueError):
        return ValueError


def compose_refs(path):
    p = Path(path)
    if p.suffix == ".json":
        conf = load_json(p)
        if conf is FileNotFoundError:
            return None, "missing"
        if conf is ValueError or not isinstance(conf, dict) or not isinstance(conf.get("services"), dict):
            return None, "unreadable or not a compose document"
        refs = set()
        for name, s in conf["services"].items():
            if not isinstance(s, dict):
                return None, "service %s is not an object" % name
            if "image" in s:
                if not isinstance(s["image"], str) or not s["image"] or "$" in s["image"]:
                    return None, "service %s has unresolved image" % name
                refs.add(s["image"])
        if not refs:
            return None, "compose document without images"
        return sorted(refs), "json"
    return None, "unsupported format"


def images():
    res = {}
    for line in checked(["docker", "images", "--no-trunc", "--format", "{{json .}}"]).splitlines():
        try:
            j = json.loads(line)
            created = datetime.strptime(j["CreatedAt"][:25].strip(), "%Y-%m-%d %H:%M:%S %z")
        except (ValueError, KeyError) as e:
            raise InventoryError("image listing not understood: %s" % e)
        if not IMAGE_ID.fullmatch(j["ID"]):
            raise InventoryError("unexpected image id format")
        res.setdefault(j["ID"], {"refs": [], "created": created, "size": j.get("Size")})
        if j["Repository"] != "<none>" and j["Tag"] != "<none>":
            res[j["ID"]]["refs"].append("%s:%s" % (j["Repository"], j["Tag"]))
    if not res:
        raise InventoryError("no images listed")
    return res


def containers():
    ids = checked(["docker", "ps", "-a", "-q", "--no-trunc"]).split()
    if not ids:
        raise InventoryError("no containers listed")
    try:
        data = json.loads(checked(["docker", "inspect", *ids]))
        res = []
        for c in data:
            labels = c["Config"].get("Labels") or {}
            res.append({"name": c["Name"].lstrip("/"), "image": c["Image"], "ref": c["Config"]["Image"],
                        "compose": labels.get("com.docker.compose.project.config_files") or "",
                        "project": labels.get("com.docker.compose.project") or "",
                        "workdir": labels.get("com.docker.compose.project.working_dir") or "",
                        "envfile": labels.get("com.docker.compose.project.environment_file") or ""})
        return res
    except (ValueError, KeyError, TypeError) as e:
        raise InventoryError("container inspect not understood: %s" % e)


def normalize_ref(ref):
    if "@" in ref:
        return ref
    name = ref.rsplit("/", 1)[-1]
    return ref if ":" in name else ref + ":latest"


def live_compose_images(project, workdir, envfile, files):
    if not project or not workdir or not files:
        return None, "compose labels incomplete"
    args = ["docker", "compose", "-p", project, "--project-directory", workdir]
    if envfile:
        args += ["--env-file", envfile]
    for f in files.split(","):
        args += ["-f", f]
    r = run(args + ["config", "--images"])
    if r.returncode != 0:
        return None, "docker compose config failed (exit %s, %d stderr lines)" % (r.returncode, len((r.stderr or "").splitlines()))
    refs = [x.strip() for x in (r.stdout or "").splitlines() if x.strip()]
    if not refs:
        return None, "docker compose config returned no images"
    bad = [x for x in refs if not IMAGE_REF.match(x)]
    if bad:
        return None, "docker compose config returned unrecognised image names"
    return sorted(set(refs)), "docker compose config --images"


def activated(d, k):
    try:
        return (d / (k + "-active")).stat().st_mtime
    except FileNotFoundError:
        return None


def release_meta(d, products, blockers):
    cfg = load_json(d / "config.json")
    man = load_json(d / "manifest.json")
    meta = {"name": d.name, "refs": set(), "ids": set(), "absent": [], "main": {}}
    if not isinstance(cfg, dict):
        blockers.append("%s: config.json missing or unreadable" % d.name)
        return None
    if not isinstance(man, dict) or not isinstance(man.get("targets"), dict):
        blockers.append("%s: manifest.json missing or unreadable" % d.name)
        return None
    for k in products:
        t = man["targets"].get(k)
        sha = t.get("sha") if isinstance(t, dict) else None
        if not isinstance(sha, str) or not SHA40.match(sha):
            blockers.append("%s: manifest target %s has no full sha" % (d.name, k))
            return None
        if k in ("backend", "client") and not (isinstance(cfg.get("tag"), str) and cfg["tag"]):
            blockers.append("%s: config.json has no tag" % d.name)
            return None
        meta["main"][k] = PRODUCTS[k](cfg.get("tag"), sha[:7], d.name)
        meta["refs"].update(meta["main"][k])
        if k in PREVIOUS:
            meta["refs"].add(PREVIOUS[k] % d.name)
    if "backend" in products:
        old = cfg.get("old_backend_image")
        if not isinstance(old, str) or not old:
            blockers.append("%s: config.json has no old_backend_image" % d.name)
            return None
        meta["refs"].add(old)
    for f in sorted(d.glob("*.json")):
        if f.name in NON_COMPOSE_JSON or f.name.endswith("-target.json"):
            continue
        if not COMPOSE_JSON.match(f.name):
            meta["absent"].append("unrecognised json kept out of scope: " + f.name)
            continue
        refs, how = compose_refs(f)
        if refs is None:
            blockers.append("%s/%s: %s" % (d.name, f.name, how))
            return None
        meta["refs"].update(refs)
    state = load_json(d / "state.json")
    if state is FileNotFoundError:
        if (d / "prepared").exists():
            blockers.append("%s: prepared release without state.json" % d.name)
            return None
    elif not isinstance(state, dict):
        blockers.append("%s: state.json unreadable" % d.name)
        return None
    else:
        meta["ids"].update(IMAGE_ID.findall(json.dumps(state)))
    try:
        meta["ids"].update(IMAGE_ID.findall((d / "progress.log").read_text()))
    except FileNotFoundError:
        pass
    except OSError:
        blockers.append("%s: progress.log unreadable" % d.name)
        return None
    return meta


def plan(grace_hours, keep):
    imgs = images()
    conts = containers()
    if not any(c["name"] == SENTINEL_CONTAINER for c in conts):
        raise InventoryError("sentinel container missing")
    if not RELEASES.is_dir():
        raise InventoryError("release directory missing")
    by_ref = {r: iid for iid, v in imgs.items() for r in v["refs"]}
    lookup = lambda r: by_ref.get(normalize_ref(r)) if r else None
    protected, blockers, notes = {}, [], []

    def protect(iid, why):
        if iid in imgs:
            protected.setdefault(iid, set()).add(why)
            return True
        return False

    groups = {}
    for c in conts:
        if not protect(c["image"], "container:" + c["name"]):
            blockers.append("container %s image %s not in image listing" % (c["name"], c["image"]))
        protect(lookup(c["ref"]), "container-tag:" + c["name"])
        if c["compose"]:
            groups.setdefault((c["project"], c["workdir"], c["envfile"], c["compose"]), []).append(c["name"])
    live = []
    for (project, workdir, envfile, files), names in sorted(groups.items()):
        refs, how = live_compose_images(project, workdir, envfile, files)
        if refs is None:
            blockers.append("live compose %s (%s): %s" % (files, ",".join(names), how))
            continue
        live.append({"project": project, "files": files, "containers": names, "images": refs})
        for r in refs:
            if not protect(lookup(r), "live-compose:" + project):
                notes.append("live compose %s references absent image %s" % (files, r))
    dirs = [d for d in RELEASES.iterdir() if d.is_dir()]
    now = time.time()
    grace_s = grace_hours * 3600
    selected = {}
    for k in PRODUCTS:
        done = sorted((d for d in dirs if activated(d, k) is not None), key=lambda d: activated(d, k), reverse=True)
        chosen, present = [], 0
        if not done:
            family = [r for v in imgs.values() for r in v["refs"] if PRODUCT_FAMILY[k].match(r.rsplit(":", 1)[0])]
            if family:
                blockers.append("%s: images exist but no successful release history, rollback retention cannot be proven" % k)
            else:
                notes.append("%s: no release history and no images of its family" % k)
        for d in done:
            meta = release_meta(d, [k], blockers)
            if meta is None:
                chosen.append({"release": d.name, "status": "metadata invalid"})
                break
            ids = {lookup(r) for r in meta["refs"] if lookup(r)} | {i for i in meta["ids"] if i in imgs}
            main_ref = meta["main"][k]
            has_main = any(lookup(r) for r in main_ref)
            if not chosen and not has_main:
                blockers.append("%s: current %s image %s absent" % (d.name, k, ",".join(sorted(main_ref))))
            for i in ids:
                protect(i, "rollback:%s:%s" % (k, d.name))
            chosen.append({"release": d.name, "status": "image present" if has_main else "image absent",
                           "protectedIds": len(ids)})
            if has_main:
                present += 1
            if present >= keep:
                break
        invalid = any(c["status"] == "metadata invalid" for c in chosen)
        if done and not invalid:
            if len(done) >= keep and present < keep:
                blockers.append("%s: only %d of required %d successful deployments (current + %d rollbacks) have their images"
                                % (k, present, keep, keep - 1))
            elif len(done) < keep and present < len(done):
                blockers.append("%s: short history (%d releases) and not every release image is present" % (k, len(done)))
            elif len(done) < keep:
                notes.append("%s: short history, all %d successful releases retained" % (k, len(done)))
        selected[k] = chosen
    for d in dirs:
        try:
            fresh = now - d.stat().st_mtime < max(grace_s, 86400)
        except OSError:
            blockers.append("%s: stat failed" % d.name)
            continue
        if not fresh:
            continue
        man = load_json(d / "manifest.json")
        if man is FileNotFoundError or (d / "config.json").exists() is False:
            notes.append("%s: fresh directory without manifest/config — its images are covered by image grace" % d.name)
            continue
        products = [k for k in ((man or {}).get("targets") or {}) if k in PRODUCTS] if isinstance(man, dict) else None
        if products is None:
            blockers.append("%s: fresh release manifest unreadable" % d.name)
            continue
        meta = release_meta(d, products, blockers)
        if meta is None:
            continue
        for r in meta["refs"]:
            protect(lookup(r), "fresh-release:" + d.name)
        for i in meta["ids"]:
            protect(i, "fresh-release:" + d.name)
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
    return {"protected": {k: sorted(v) for k, v in protected.items()}, "selectedReleases": selected,
            "liveCompose": live, "blockers": blockers, "notes": notes, "candidates": sorted(candidates, key=lambda c: c["created"]),
            "keptOther": kept_other, "images": len(imgs), "containers": len(conts)}


class Receipt:
    def __init__(self, rec):
        self.rec = rec
        LOG_DIR.mkdir(mode=0o750, exist_ok=True)
        self.path = LOG_DIR / ("cleanup-%s-%d.json" % (time.strftime("%Y%m%dT%H%M%S"), os.getpid()))
        rec["log"] = str(self.path)
        self.save()

    def save(self):
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.rec, ensure_ascii=False, indent=1, default=str))
        tmp.replace(self.path)

    def rotate(self):
        logs = sorted(LOG_DIR.glob("cleanup-*.json"))
        for old in logs[:-LOG_KEEP]:
            old.unlink()


def remove(cands, receipt):
    ops = receipt.rec.setdefault("removals", [])
    for c in cands:
        live = {x["image"] for x in containers()}
        current = images().get(c["id"])
        if current is None:
            ops.append({**c, "result": "skipped: already gone"})
        elif c["id"] in live or sorted(current["refs"]) != c["refs"]:
            ops.append({**c, "result": "skipped: references changed"})
        else:
            results = []
            for ref in c["refs"] or [c["id"]]:
                r = run(["docker", "rmi", ref])
                results.append({"ref": ref, "exit": r.returncode, "err": (r.stderr or "").strip()[:200]})
                if r.returncode != 0:
                    break
            ok = all(x["exit"] == 0 for x in results) and len(results) == len(c["refs"] or [c["id"]])
            ops.append({**c, "result": "removed" if ok else "failed", "rmi": results})
        receipt.save()


def parse_args(argv):
    def bounded(lo, hi):
        def conv(v):
            try:
                n = int(v)
            except ValueError:
                raise argparse.ArgumentTypeError("integer expected")
            if n < lo or n > hi:
                raise argparse.ArgumentTypeError("allowed range %d..%d" % (lo, hi))
            return n
        return conv

    ap = argparse.ArgumentParser(description="Weekly Dev cleanup of unused release images and caches (dry-run by default)")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--grace-hours", type=bounded(6, 24 * 90), default=48)
    ap.add_argument("--keep-releases", type=bounded(3, 20), default=3)
    ap.add_argument("--cache-hours", type=bounded(24, 24 * 90), default=72)
    return ap.parse_args(argv)


def summary(rec):
    keys = ("mode", "exit", "result", "error", "candidates", "removed", "skipped", "failed", "blockers",
            "freeBefore", "freeAfter", "log")
    return json.dumps({k: rec[k] for k in keys if k in rec}, ensure_ascii=False, default=str)


def main(argv=None):
    try:
        a = parse_args(argv)
    except SystemExit:
        return EX_REFUSED
    rec = {"startedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
           "mode": "apply" if a.apply else "dry-run", "args": vars(a), "freeBefore": free_bytes(), "result": "running"}
    if socket.gethostname() != HOST or not RELEASES.is_dir():
        rec.update(exit=EX_REFUSED, result="refused", error="wrong host or workspace")
        print(summary(rec))
        return EX_REFUSED
    fh = open(LOCK, "a")
    try:
        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        fh.close()
        rec.update(exit=EX_LOCKED, result="skipped: deploy lock busy")
        Receipt(rec).rotate()
        print(summary(rec))
        return EX_LOCKED
    receipt = Receipt(rec)
    try:
        try:
            p = plan(a.grace_hours, a.keep_releases)
        except InventoryError as e:
            rec.update(exit=EX_INVENTORY, result="inventory failed, nothing removed", error=str(e))
            return EX_INVENTORY
        rec["plan"] = p
        rec["candidates"] = len(p["candidates"])
        rec["blockers"] = p["blockers"]
        receipt.save()
        if p["blockers"]:
            rec.update(exit=EX_BLOCKED, result="blocked by required metadata, nothing removed")
            return EX_BLOCKED
        if not a.apply:
            rec.update(exit=EX_OK, result="planned")
            return EX_OK
        remove(p["candidates"], receipt)
        ops = rec["removals"]
        rec["removed"] = sum(o["result"] == "removed" for o in ops)
        rec["skipped"] = sum(o["result"].startswith("skipped") for o in ops)
        rec["failed"] = sum(o["result"] == "failed" for o in ops)
        maint = rec.setdefault("maintenance", [])
        r = run(["docker", "builder", "prune", "-f", "--filter", "until=%dh" % a.cache_hours])
        maint.append({"op": "docker builder prune", "exit": r.returncode, "tail": (r.stdout or "").strip().splitlines()[-1:],
                      "err": (r.stderr or "").strip()[:200]})
        receipt.save()
        r = run(["apt-get", "clean"])
        maint.append({"op": "apt-get clean", "exit": r.returncode, "err": (r.stderr or "").strip()[:200]})
        failed_maint = [m["op"] for m in maint if m["exit"] != 0]
        if rec["failed"] or failed_maint:
            rec.update(exit=EX_PARTIAL, result="partial: failed removals or maintenance", failedMaintenance=failed_maint)
            return EX_PARTIAL
        rec.update(exit=EX_OK, result="applied")
        return EX_OK
    except Exception as e:
        rec.update(exit=EX_ERROR, result="error after start; see removals for completed steps", error=repr(e)[:300])
        return EX_ERROR
    finally:
        rec["freeAfter"] = free_bytes()
        rec["finishedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
        if "removals" in rec:
            rec["removed"] = sum(o["result"] == "removed" for o in rec["removals"])
            rec["failed"] = sum(o["result"] == "failed" for o in rec["removals"])
            rec["skipped"] = sum(o["result"].startswith("skipped") for o in rec["removals"])
        receipt.save()
        receipt.rotate()
        print(summary(rec))
        fcntl.flock(fh, fcntl.LOCK_UN)
        fh.close()


if __name__ == "__main__":
    sys.exit(main())
