"""Verify published calendar payloads without requiring image dependencies."""
import ast
import json
from pathlib import Path
import tempfile
import unittest

class CalendarAssets(unittest.TestCase):
    def test_months_preserve_notes_bound_geometry_and_stay_stable(self):
        source = Path(__file__).resolve().parents[1] / 'build-web-assets.py'
        tree = ast.parse(source.read_text())
        function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'prepare_calendar')
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            target = root / 'assets/data/journal'
            target.mkdir(parents=True)
            (target / '2025-12.json').write_text('{"version":1,"month":"2025-12","runs":[]}')
            scope = {'ROOT': root}
            exec('import json, math, hashlib', scope)
            exec(compile(ast.Module(body=[function], type_ignores=[]), str(source), 'exec'), scope)
            note = '原文\n<script>literal</script>'
            data = {'updatedAt':'first','hero':{'year':2026},'runs':[{'date':'2026-10-25','note':note,'coordinates':[[31+i/100000,121] for i in range(500)],'coordinatesGcj02':[[1,2]],'heartRate':150}]}
            scope['prepare_calendar'](data)
            raw = (target / '2026-10.json').read_bytes()
            run = json.loads(raw)['runs'][0]
            self.assertEqual(run['note'], note)
            self.assertLessEqual(len(run['coordinates']),141)
            self.assertEqual(run['coordinates'][-1], data['runs'][0]['coordinates'][-1])
            self.assertNotIn('coordinatesGcj02',run)
            self.assertNotIn('heartRate',run)
            data['updatedAt']='second'
            scope['prepare_calendar'](data)
            self.assertEqual(raw,(target/'2026-10.json').read_bytes())
            self.assertTrue((target/'2025-12.json').exists())

if __name__ == '__main__': unittest.main()
