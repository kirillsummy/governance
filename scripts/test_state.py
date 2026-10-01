#!/usr/bin/env python3
from __future__ import annotations

import datetime
import os
import subprocess
import sys

HOST = os.environ.get("SUMMY_TEST_HOST", "root@201.51.9.79")
PRODUCTS = ("backend", "crm", "master-app", "client-app", "website")

REMOTE = r"""
set -u
for d in %(products)s; do
  printf 'VERSION %%s %%s\n' "$d" "$(head -c 200 /opt/summy-test/$d/VERSION 2>/dev/null | tr -d '\n' || echo missing)"
done
printf 'DB %%s\n' "$(docker exec summy-stand-postgres-1 psql -U summy_data_owner -d summy_data -tAc 'select version_num from alembic_version' 2>/dev/null | tr -d '[:space:]')"
docker ps --format 'CONTAINER {{.Names}} {{.Image}} {{.Status}}'
latest=$(ls -1t /opt/summy-test/releases 2>/dev/null | head -1)
printf 'RELEASE %%s %%s\n' "$latest" "$(tail -n 1 /opt/summy-test/releases/$latest/progress.log 2>/dev/null)"
if flock -n /var/lock/summy-test-deploy.lock true; then echo 'LOCK free'; else echo 'LOCK busy'; fi
""" % {"products": " ".join(PRODUCTS)}


def main() -> int:
    key = os.environ.get("SUMMY_TEST_SSH_KEY")
    known = os.environ.get("SUMMY_TEST_KNOWN_HOSTS")
    if not key or not known:
        print("Set SUMMY_TEST_SSH_KEY and SUMMY_TEST_KNOWN_HOSTS", file=sys.stderr)
        return 2
    command = [
        "ssh", "-F", "none", "-i", key, "-o", "IdentitiesOnly=yes", "-o", "BatchMode=yes",
        "-o", f"UserKnownHostsFile={known}", "-o", "StrictHostKeyChecking=yes",
        HOST, "bash -s",
    ]
    result = subprocess.run(command, input=REMOTE.encode("utf-8"), capture_output=True,
                            timeout=120)
    if result.returncode != 0:
        print(result.stderr.decode("utf-8", "replace").strip(), file=sys.stderr)
        return result.returncode
    versions, containers, other = [], [], []
    for line in result.stdout.decode("utf-8", "replace").splitlines():
        kind, _, rest = line.partition(" ")
        if kind == "VERSION":
            versions.append(rest.split(" ", 1))
        elif kind == "CONTAINER":
            containers.append(rest)
        elif kind in ("DB", "RELEASE", "LOCK"):
            other.append((kind, rest))
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    print(f"TEST snapshot {stamp} ({HOST.split('@')[-1]})\n")
    print("| Product | VERSION |\n|---|---|")
    for name, value in versions:
        print(f"| {name} | `{value}` |")
    print()
    for kind, rest in other:
        print(f"- {kind}: `{rest}`")
    print("\nContainers:")
    for line in containers:
        print(f"- `{line}`")
    return 0


if __name__ == "__main__":
    sys.exit(main())
