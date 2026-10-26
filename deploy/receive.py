#!/usr/bin/env python3
"""Root-owned forced SSH command; runs as an unprivileged website-only user.

No shell commands from the SSH caller are executed. The only accepted input is
a bounded, validated static-site archive. Nginx and other services are untouched.
"""

from contextlib import ExitStack
import fcntl
import gzip
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import signal
import subprocess
import sys
import tarfile
import tempfile
import time


BASE = Path('/var/www/pacermind-website/auto')
BRANCH = 'codex/pacermind-3-atlas-editor-review-20261008'
MAX_ARCHIVE = 64 * 1024 * 1024
MAX_CONTENT = 100 * 1024 * 1024
MAX_FILES = 1200
PAGES = {'index.html', 'planner.html', 'notes.html', 'privacy.html', 'support.html'}
REQUIRED = PAGES | {
    'deployment.json', 'robots.txt', 'sitemap.xml', 'favicon.ico',
    'scripts/site.js', 'scripts/planner.mjs', 'scripts/notes.mjs',
    'assets/styles/main.css', 'assets/styles/website.css', 'assets/styles/atlas.css',
}


class BoundedReader:
    """Bound decompression too, including tar metadata and extended headers."""

    def __init__(self, source):
        self.source = source
        self.remaining = MAX_CONTENT + 4 * 1024 * 1024

    def read(self, size=-1):
        amount = self.remaining + 1 if size < 0 else min(size, self.remaining + 1)
        data = self.source.read(amount)
        self.remaining -= len(data)
        if self.remaining < 0:
            raise ValueError('Decompressed archive exceeds size limit')
        return data


def public_path(name):
    path = PurePosixPath(name)
    if (not name or str(path) != name or path.is_absolute()
            or any(part.startswith('.') for part in path.parts)
            or any(ord(c) < 32 for c in name) or '\\' in name):
        return False
    if len(path.parts) == 1:
        return name in PAGES | {'deployment.json', 'robots.txt', 'sitemap.xml', 'favicon.ico'} or bool(
            re.fullmatch(r'baidu_verify_[A-Za-z0-9_-]+\.html', name))
    if path.parts[0] == 'scripts':
        return len(path.parts) == 2 and path.suffix in {'.js', '.mjs'}
    if path.parts[0] == 'assets':
        return path.suffix.lower() in {
            '.css', '.json', '.geojson', '.png', '.jpg', '.jpeg', '.webp',
            '.svg', '.ico', '.woff', '.woff2', '.ttf', '.txt',
        } or path.name == 'LICENSE'
    return False


def unpack(archive, destination):
    """Copy regular files only; never call tar's general-purpose extraction."""
    total = 0
    names = set()
    manifest = None
    hashes = {}
    with ExitStack() as stack:
        raw = archive if hasattr(archive, 'read') else stack.enter_context(open(archive, 'rb'))
        uncompressed = stack.enter_context(gzip.GzipFile(fileobj=raw))
        bundle = stack.enter_context(tarfile.open(fileobj=BoundedReader(uncompressed), mode='r|'))
        for member in bundle:
            if not member.isfile() or member.name in names or len(names) >= MAX_FILES:
                raise ValueError('Non-regular, duplicate or excessive archive members')
            names.add(member.name)
            total += member.size
            if member.size < 0 or total > MAX_CONTENT:
                raise ValueError('Archive exceeds expanded size limit')
            if member.name == 'manifest.json':
                if member.size > 256 * 1024:
                    raise ValueError('Manifest too large')
                manifest = json.load(bundle.extractfile(member))
                continue
            if not member.name.startswith('site/') or not public_path(member.name[5:]):
                raise ValueError('Path is outside the public-file allowlist')
            name = member.name[5:]
            target = destination / name
            target.parent.mkdir(parents=True, exist_ok=True)
            with bundle.extractfile(member) as source, target.open('xb') as output:
                digest = hashlib.sha256()
                while chunk := source.read(65536):
                    output.write(chunk)
                    digest.update(chunk)
            hashes[name] = digest.hexdigest()
            target.chmod(0o644)
    if not isinstance(manifest, dict) or manifest.get('version') != 1:
        raise ValueError('Missing or invalid manifest')
    revision = manifest.get('revision', '')
    number = manifest.get('run_number')
    if (not isinstance(revision, str) or not re.fullmatch(r'[a-f0-9]{40}', revision)
            or manifest.get('branch') != BRANCH
            or type(number) is not int or not 1 <= number <= 10**12
            or manifest.get('files') != hashes or not REQUIRED <= hashes.keys()):
        raise ValueError('Manifest identity, branch or file hashes do not match')
    marker = json.loads((destination / 'deployment.json').read_text())
    if marker != {key: manifest[key] for key in ('revision', 'branch', 'run_number')}:
        raise ValueError('Public deployment marker does not match manifest')
    for name in PAGES:
        if '沪ICP备2025147756号-3' not in (destination / name).read_text():
            raise ValueError('Website filing number is missing')
    # One timestamp per immutable revision makes HTTP validators change on deploy.
    timestamp = int(time.time())
    for name in hashes:
        os.utime(destination / name, (timestamp, timestamp))
    return manifest


def switch_link(base, target):
    temporary = base / 'current.next'
    temporary.unlink(missing_ok=True)
    temporary.symlink_to(target)
    os.replace(temporary, base / 'current')


def smoke(manifest):
    # Loopback connection, production Host/SNI, normal certificate validation.
    for name in sorted(PAGES | {'deployment.json', 'scripts/planner.mjs', 'scripts/notes.mjs'}):
        result = subprocess.run([
            '/usr/bin/curl', '--noproxy', '*', '--fail', '--silent', '--show-error',
            '--connect-timeout', '3', '--max-time', '10',
            '--resolve', 'pacermind.xyz:443:127.0.0.1',
            'https://pacermind.xyz/' + name,
        ], capture_output=True, check=True)
        if hashlib.sha256(result.stdout).hexdigest() != manifest['files'][name]:
            raise ValueError('Served content does not match release: ' + name)


def apply_archive(archive, base=BASE, probe=smoke):
    """Caller holds the deploy lock. Roll back the symlink if health fails."""
    releases = base / 'releases'
    releases.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='staging-', dir=releases) as temporary:
        staged = Path(temporary)
        manifest = unpack(archive, staged)
        state_file = base / 'state.json'
        state = json.loads(state_file.read_text()) if state_file.exists() else None
        if state and manifest['run_number'] <= state['run_number']:
            if (manifest['run_number'] == state['run_number']
                    and manifest['revision'] == state['revision']):
                probe(manifest)
                return manifest  # A successful run can be retried safely.
            raise ValueError('Refusing an older workflow run')
        name = f"{manifest['run_number']}-{manifest['revision'][:12]}"
        release = releases / name
        if release.exists():
            raise ValueError('Release already exists; inspect the previous attempt')
        # Preserve the previous release before any activation.
        previous = os.readlink(base / 'current')
        staged.chmod(0o755)  # TemporaryDirectory starts private; Nginx must traverse it.
        os.rename(staged, release)
        try:
            switch_link(base, 'releases/' + name)
            probe(manifest)
            new_state = {key: manifest[key] for key in ('revision', 'branch', 'run_number')}
            new_state['previous'] = previous
            temporary_state = base / 'state.next'
            temporary_state.write_text(json.dumps(new_state, indent=2) + '\n')
            os.replace(temporary_state, state_file)
        except BaseException:
            switch_link(base, previous)
            shutil.rmtree(release)
            raise
        # The directory was moved; recreate it for TemporaryDirectory cleanup.
        staged.mkdir()
    # Retain five automatic releases, always including the previous target.
    protected = {name, Path(previous).name}
    candidates = sorted(
        (p for p in releases.iterdir() if p.is_dir() and re.fullmatch(r'\d+-[a-f0-9]{12}', p.name)),
        key=lambda p: int(p.name.split('-')[0]), reverse=True,
    )
    for old in candidates[5:]:
        if old.name not in protected:
            shutil.rmtree(old)
    return manifest


def main():
    if os.environ.get('SSH_ORIGINAL_COMMAND') != 'deploy':
        raise ValueError('This key only accepts the deploy command')
    os.umask(0o022)
    BASE.mkdir(exist_ok=True)
    with (BASE / 'deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        with tempfile.TemporaryFile(dir=BASE) as archive:
            size = 0
            while chunk := sys.stdin.buffer.read(65536):
                size += len(chunk)
                if size > MAX_ARCHIVE:
                    raise ValueError('Compressed archive exceeds size limit')
                archive.write(chunk)
            archive.seek(0)
            manifest = apply_archive(archive)
        print(json.dumps({'status': 'deployed', 'revision': manifest['revision'],
                          'run_number': manifest['run_number']}), flush=True)


def interrupted(signum, _frame):
    raise RuntimeError('Deployment interrupted by signal ' + str(signum))


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, interrupted)
    signal.signal(signal.SIGHUP, interrupted)
    try:
        main()
    except Exception as error:
        print('Deployment rejected: ' + str(error), file=sys.stderr)
        sys.exit(1)
