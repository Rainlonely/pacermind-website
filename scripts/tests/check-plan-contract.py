#!/usr/bin/env python3
"""Independent Draft7 checks. Optional read-only comparison with the iOS source."""
import argparse, json, hashlib
from pathlib import Path
from datetime import date, timedelta
from jsonschema import Draft7Validator
ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--ios-root', type=Path)
args = parser.parse_args()
schema_path = ROOT / 'assets/data/schema/plan-v2.json'
schema = json.loads(schema_path.read_text())
Draft7Validator.check_schema(schema)
paths = [ROOT / 'scripts/tests/fixtures/synthetic-plan-v2.json']
if args.ios_root:
    assert schema_path.read_bytes() == (args.ios_root / 'SPEC/PacerMind_Plan_JSON_v2_Schema_Draft.json').read_bytes()
    paths.append(args.ios_root / 'PacerMindTests/Fixtures/coach-race-initial-v4.json')
for path in paths:
    plan = json.loads(path.read_text())
    errors = list(Draft7Validator(schema).iter_errors(plan))
    assert not errors, [str(x) for x in errors]
    start, end = date.fromisoformat(plan['start_date']), date.fromisoformat(plan['end_date'])
    dates = [date.fromisoformat(d['date']) for d in plan['days']]
    assert len(dates) == len(set(dates))
    assert dates == [start + timedelta(days=i) for i in range((end-start).days+1)]
    route = plan.get('coachProgram')
    if route:
        first = date.fromisoformat(route['startDate'])
        first -= timedelta(days=(first.weekday() - (0 if route['weekStart']=='monday' else 6)) % 7)
        block = 1
        for i, week in enumerate(route['weeks']):
            assert week['id'] == f"{route['id']}:w{i+1}" and week['index'] == i+1
            assert week['blockIndex'] in [block, block+1]
            if i == 0: assert week['blockIndex'] == 1
            block = week['blockIndex']
            assert date.fromisoformat(week['startDate']) == first + timedelta(weeks=i)
            assert date.fromisoformat(week['endDate']) == first + timedelta(weeks=i, days=6)
        if route['intent']=='racePreparation':
            race = date.fromisoformat(route['raceDate'])
            assert race >= date.fromisoformat(route['startDate'])
            assert any(date.fromisoformat(w['startDate']) <= race <= date.fromisoformat(w['endDate']) and w['role']=='race' for w in route['weeks'])
    print(f'PASS: independent schema, date coverage and weekly metadata checks: {path.name}')
print('Schema SHA256:',hashlib.sha256(schema_path.read_bytes()).hexdigest())
print('These are contract checks; no App runtime/import was executed.')
