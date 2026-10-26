"""Safety and rollback contracts for the static-only SSH receiver."""

import hashlib
import io
import json
import os
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

import receive


def archive(number=1, revision='a' * 40, extra=None, mismatch=False, branch=receive.BRANCH):
    marker = {'revision': revision, 'branch': branch, 'run_number': number}
    files = {name: b'synthetic file' for name in receive.REQUIRED}
    for name in receive.PAGES:
        files[name] = '<html><footer>沪ICP备2025147756号-3</footer></html>'.encode()
    files['deployment.json'] = json.dumps(marker).encode()
    hashes = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    if mismatch:
        hashes['index.html'] = '0' * 64
    manifest = {'version': 1, **marker, 'files': hashes}
    data = io.BytesIO()
    with tarfile.open(fileobj=data, mode='w:gz') as bundle:
        for name, content in files.items():
            member = tarfile.TarInfo('site/' + name)
            member.size = len(content)
            bundle.addfile(member, io.BytesIO(content))
        if extra:
            bundle.addfile(extra, io.BytesIO(b'x' * extra.size))
        content = json.dumps(manifest).encode()
        member = tarfile.TarInfo('manifest.json')
        member.size = len(content)
        bundle.addfile(member, io.BytesIO(content))
    data.seek(0)
    return data


class ReceiverTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.base = Path(self.temporary.name)
        (self.base / 'original').mkdir()
        (self.base / 'current').symlink_to('original')

    def tearDown(self):
        self.temporary.cleanup()

    def test_only_public_files_are_allowed(self):
        for name in ('index.html', 'assets/styles/atlas.css', 'assets/fonts/OFL.txt',
                     'assets/images/easy 1.png', 'scripts/notes.mjs'):
            self.assertTrue(receive.public_path(name), name)
        for name in ('../nginx.conf', 'assets/../../etc/passwd', '/etc/passwd',
                     'assets/.env', 'assets/a/../../../x', 'assets/x.py',
                     'scripts/tests/test.js', 'scripts/publish-journey-update.sh',
                     '.github/workflows/deploy.yml', 'README.md', 'assets//file.json'):
            self.assertFalse(receive.public_path(name), name)

    def test_valid_release_switches_atomically_and_records_state(self):
        seen = []
        receive.apply_archive(archive(), self.base, lambda manifest: seen.append(
            ((self.base / 'current' / 'index.html').read_text(), manifest['revision'])))
        self.assertEqual(os.readlink(self.base / 'current'), 'releases/1-aaaaaaaaaaaa')
        self.assertEqual(json.loads((self.base / 'state.json').read_text())['previous'], 'original')
        self.assertIn('沪ICP备2025147756号-3', seen[0][0])
        self.assertEqual((self.base / 'current').resolve().stat().st_mode & 0o777, 0o755)

    def test_failed_probe_restores_previous_release_and_state(self):
        receive.apply_archive(archive(), self.base, lambda _: None)
        state = (self.base / 'state.json').read_bytes()
        def fail(_):
            raise RuntimeError('synthetic health failure')
        with self.assertRaises(RuntimeError):
            receive.apply_archive(archive(2, 'b' * 40), self.base, fail)
        self.assertEqual(os.readlink(self.base / 'current'), 'releases/1-aaaaaaaaaaaa')
        self.assertEqual((self.base / 'state.json').read_bytes(), state)
        self.assertFalse((self.base / 'releases/2-bbbbbbbbbbbb').exists())

    def test_bad_hash_and_wrong_branch_never_activate(self):
        for data in (archive(mismatch=True), archive(branch='main')):
            with self.assertRaises(ValueError):
                receive.apply_archive(data, self.base, lambda _: self.fail('Probe must not run'))
            self.assertEqual(os.readlink(self.base / 'current'), 'original')

    def test_links_traversal_and_duplicate_entries_are_rejected(self):
        traversal = tarfile.TarInfo('site/assets/../../outside')
        traversal.size = 1
        symlink = tarfile.TarInfo('site/assets/link.png')
        symlink.type = tarfile.SYMTYPE
        symlink.linkname = '/etc/passwd'
        hardlink = tarfile.TarInfo('site/assets/hardlink.png')
        hardlink.type = tarfile.LNKTYPE
        hardlink.linkname = '/etc/passwd'
        duplicate = tarfile.TarInfo('site/index.html')
        duplicate.size = 1
        for member in (traversal, symlink, hardlink, duplicate):
            with self.assertRaises(ValueError):
                receive.apply_archive(archive(extra=member), self.base, lambda _: None)
            self.assertEqual(os.readlink(self.base / 'current'), 'original')

    def test_stale_run_is_rejected_but_same_run_retry_is_safe(self):
        receive.apply_archive(archive(5), self.base, lambda _: None)
        receive.apply_archive(archive(5), self.base, lambda _: None)
        for data in (archive(4, 'b' * 40), archive(5, 'c' * 40)):
            with self.assertRaises(ValueError):
                receive.apply_archive(data, self.base, lambda _: None)
        self.assertEqual(os.readlink(self.base / 'current'), 'releases/5-aaaaaaaaaaaa')

    def test_retention_preserves_previous_release(self):
        for number in range(1, 8):
            receive.apply_archive(archive(number), self.base, lambda _: None)
        self.assertEqual(len(list((self.base / 'releases').iterdir())), 5)
        self.assertTrue((self.base / 'releases/6-aaaaaaaaaaaa').is_dir())
        self.assertTrue((self.base / 'original').is_dir())

    def test_expanded_size_limit_rejects_input_without_activation(self):
        with patch.object(receive, 'MAX_CONTENT', 32):
            with self.assertRaises(ValueError):
                receive.apply_archive(archive(), self.base, lambda _: self.fail('Must not activate'))
        self.assertEqual(os.readlink(self.base / 'current'), 'original')


if __name__ == '__main__':
    unittest.main()
