#!/usr/bin/env python3
"""Build a reproducible allowlisted release from committed Git objects."""

import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

from receive import public_path


def build(output, branch, run_number):
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    timestamp = int(subprocess.check_output(['git', 'show', '-s', '--format=%ct', revision], text=True))
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', revision], text=True).splitlines()
    marker = {'revision': revision, 'branch': branch, 'run_number': run_number}
    files = {}
    with tarfile.open(output, 'w:gz') as archive:
        for name in sorted([p for p in paths if public_path(p)] + ['deployment.json']):
            if name == 'deployment.json':
                data = (json.dumps(marker, indent=2) + '\n').encode()
            else:
                data = subprocess.check_output(['git', 'show', f'{revision}:{name}'])
            member = tarfile.TarInfo('site/' + name)
            member.size = len(data)
            member.mode = 0o644
            member.mtime = timestamp
            archive.addfile(member, io.BytesIO(data))
            files[name] = hashlib.sha256(data).hexdigest()
        manifest = {'version': 1, **marker, 'files': files}
        data = json.dumps(manifest, sort_keys=True).encode()
        member = tarfile.TarInfo('manifest.json')
        member.size = len(data)
        member.mode = 0o600
        member.mtime = timestamp
        archive.addfile(member, io.BytesIO(data))
    print(f'Packaged {len(files)} public files from {revision}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--branch', required=True)
    parser.add_argument('--run-number', required=True, type=int)
    args = parser.parse_args()
    build(args.output, args.branch, args.run_number)
