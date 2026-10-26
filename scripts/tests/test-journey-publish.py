"""Exercise Git isolation/no-op publishing using a synthetic local remote.

Device and asset generation are stubs: this test never reads a real phone,
publishes health data, or contacts GitHub.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


SOURCE = Path(__file__).resolve().parents[1] / 'publish-journey-update.sh'
BRANCH = 'codex/pacermind-3-atlas-editor-review-20261008'


def git(folder, *args):
    return subprocess.check_output(['git', '-C', str(folder), *args], text=True, stderr=subprocess.DEVNULL).strip()


class PublisherTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Publisher uses Node for public JSON checks')
    def test_isolated_publish_preserves_edits_and_skips_unchanged_data(self):
        with tempfile.TemporaryDirectory(prefix='synthetic-journey-test-') as temporary:
            root = Path(temporary)
            seed = root / 'seed'
            seed.mkdir()
            git(seed, 'init', '-b', BRANCH)
            for name in ('scripts', 'assets/data', 'assets/images/web'):
                (seed / name).mkdir(parents=True, exist_ok=True)
            shutil.copy2(SOURCE, seed / 'scripts/publish-journey-update.sh')
            (seed / 'index.html').write_text('Synthetic published homepage\n')
            (seed / 'scripts/site.js').write_text('// synthetic website\n')
            initial = {'updatedAt': 'old', 'stats': {}, 'runs': [
                {'date': '2026-10-01', 'title': 'Synthetic run', 'distanceKm': 5, 'note': 'old'}]}
            (seed / 'assets/data/journey.json').write_text(json.dumps(initial))
            (seed / 'scripts/sync-journey-from-device.py').write_text(
                "import json,time\nfrom pathlib import Path\n"
                "p=Path('assets/data/journey.json');d=json.loads(p.read_text())\n"
                "d['updatedAt']=str(time.time_ns());d['runs'][0]['note']='synthetic update'\n"
                "p.write_text(json.dumps(d))\n")
            (seed / 'scripts/build-web-assets.py').write_text(
                "from pathlib import Path\n"
                "for name in ['assets/data/journey-summary.json','assets/data/journey-routes.json',"
                "'assets/data/journal-index.json','assets/data/journal/2026-10.json',"
                "'assets/images/web/city-light.webp','assets/images/web/city-dark.webp']:\n"
                " Path(name).parent.mkdir(parents=True,exist_ok=True)\n"
                " Path(name).write_text('synthetic derived asset')\n")
            (seed / 'scripts/tests').mkdir()
            (seed / 'scripts/tests/check-site.py').write_text("print('synthetic asset check')\n")
            git(seed, 'add', '.')
            git(seed, '-c', 'user.name=Synthetic', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'seed')
            remote = root / 'origin.git'
            git(root, 'init', '--bare', str(remote))
            git(seed, 'remote', 'add', 'origin', str(remote))
            git(seed, 'push', 'origin', BRANCH)
            caller = root / 'caller'
            git(root, 'clone', '--branch', BRANCH, str(remote), str(caller))
            git(caller, 'config', 'user.name', 'Synthetic')
            git(caller, 'config', 'user.email', 'test@example.invalid')
            git(caller, 'switch', '-c', 'unrelated-feature')
            (caller / 'unrelated.txt').write_text('Unpublished unrelated work\n')
            git(caller, 'add', 'unrelated.txt')
            git(caller, 'commit', '-m', 'unrelated local commit')
            (caller / 'index.html').write_text('Unfinished user layout\n')
            original_head, original_status = git(caller, 'rev-parse', 'HEAD'), git(caller, 'status', '--porcelain')
            binary = root / 'bin'
            binary.mkdir()
            (binary / 'xcrun').write_text('#!/bin/sh\necho synthetic-device\nexit 0\n')
            (binary / 'xcrun').chmod(0o755)
            modules = root / 'modules/PIL'
            modules.mkdir(parents=True)
            (modules / '__init__.py').write_text('Image = object()\n')
            env = dict(os.environ, PATH=str(binary) + os.pathsep + os.environ['PATH'],
                       PYTHONPATH=str(root / 'modules'), PACERMIND_JOURNEY_PYTHON=sys.executable)
            env.pop('PACERMIND_JOURNEY_ISOLATED', None)
            env.pop('PACERMIND_JOURNEY_BRANCH', None)
            env.pop('PACERMIND_JOURNEY_REMOTE', None)
            command = ['bash', str(caller / 'scripts/publish-journey-update.sh'), '--year', '2026']
            result = subprocess.run(command, cwd=caller, env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            published = git(remote, 'rev-parse', BRANCH)
            self.assertEqual(json.loads(git(remote, 'show', BRANCH + ':assets/data/journey.json'))['runs'][0]['note'], 'synthetic update')
            self.assertEqual(git(remote, 'show', BRANCH + ':index.html'), 'Synthetic published homepage')
            self.assertEqual(git(caller, 'rev-parse', 'HEAD'), original_head)
            self.assertEqual(git(caller, 'status', '--porcelain'), original_status)
            result = subprocess.run(command, cwd=caller, env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn('nothing to publish', result.stdout)
            self.assertEqual(git(remote, 'rev-parse', BRANCH), published)
            self.assertEqual(git(caller, 'status', '--porcelain'), original_status)
            self.assertEqual(git(caller, 'worktree', 'list', '--porcelain').count('worktree '), 1)


if __name__ == '__main__':
    unittest.main()
