# Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
# SPDX-License-Identifier: MIT OR GPL-2.0-only
"""Licence headers on the web sources (golden rule 1).

The org gate (swarm-routing/.github cmd/check-headers) reads only
.h/.hpp/.cc/.cpp/.go/.py/.sh, so this checks the tracked .ts/.tsx/.js/.mjs
files the same way: the org copyright line, then the SPDX line, in the first
five lines. Every web directory here is MIT OR GPL-2.0-only (LICENSING.md).

Usage: python3 tools/check-web-headers.py   (from the repository root)
"""
import subprocess
import sys

EXTS = (".ts", ".tsx", ".js", ".mjs")
ORG = "Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)"
SPDX = "SPDX-License-Identifier: MIT OR GPL-2.0-only"


def main():
    files = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"], capture_output=True, text=True,
                           check=True).stdout.split()
    files = [f for f in files if f.endswith(EXTS)]
    bad = []
    for f in files:
        with open(f, encoding="utf-8") as fh:
            head = [next(fh, "") for _ in range(5)]
        org = next((i for i, l in enumerate(head) if ORG in l), None)
        spdx = next((i for i, l in enumerate(head) if SPDX in l), None)
        if org is None or spdx is None or spdx < org:
            bad.append(f)
    for f in bad:
        print(f"{f}: missing the org copyright line and `{SPDX}`", file=sys.stderr)
    print(f"checked {len(files)} web source file(s); {len(bad)} problem(s)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
