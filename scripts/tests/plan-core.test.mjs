import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../plan-core.mjs';
const schema = JSON.parse(fs.readFileSync(new URL('../../assets/data/schema/plan-v2.json', import.meta.url)));
const appFixture = JSON.parse(fs.readFileSync(new URL('./fixtures/synthetic-plan-v2.json', import.meta.url)));
function draft() {
  const d = C.newDraft();
  Object.assign(d, {
    title: 'Synthetic test plan',
    goal: 'User-specified test values only',
    startDate: '2026-10-05'
  });
  return d;
}
function restWeek(d, index = 0) {
  for (let i = 0; i < 7; i++) C.markRest(d, index * 7 + i);
  return d;
}
function workout(metric = 'distance', value = '5') {
  const w = C.workoutFromTemplate(metric === 'time' ? 'easy-time' : 'easy-distance');
  w.blocks[0].segments[0].value = value;
  return w;
}
function raceDraft(weeks = 8) {
  const d = restWeek(draft());
  d.mode = 'race';
  d.race = {
    name: 'Synthetic race',
    date: C.dateAt(d, weeks * 7 - 1),
    distance: 'fm',
    goalTimeSec: ''
  };
  d.stages = weeks === 1 ? [{
    phase: 'race',
    role: 'race',
    weeks: 1,
    focus: 'User race direction'
  }] : [{
    phase: 'base',
    role: 'establish',
    weeks: weeks - 1,
    focus: 'User base direction'
  }, {
    phase: 'race',
    role: 'race',
    weeks: 1,
    focus: 'User race direction'
  }];
  return d;
}
test('calendar is strict Gregorian UTC, with leap year and both week starts', () => {
  assert.equal(C.validDate('2024-02-29'), true);
  assert.equal(C.validDate('2025-02-29'), false);
  assert.equal(C.validDate('2026-02-30'), false);
  assert.equal(C.validDate('2026-1-01'), false);
  assert.equal(C.alignedStart('2026-01-01', 'monday'), '2025-12-29');
  assert.equal(C.alignedStart('2026-01-01', 'sunday'), '2025-12-28');
  assert.equal(C.addDays('2024-02-28', 1), '2024-02-29');
});
test('empty dates block export and are never filled as rest', () => {
  const d = draft(),
    r = C.buildPlan(d, schema);
  assert.equal(r.valid, false);
  assert.equal(r.plan.days.length, 0);
  assert.equal(r.issues.filter(x => x.code === 'pending').length, 7);
  assert.deepEqual(d.days, {});
});
test('aligned complete single week produces deterministic lean JSON', () => {
  const d = restWeek(draft());
  const before = JSON.stringify(d);
  const a = C.buildPlan(d, schema),
    b = C.buildPlan(d, schema);
  assert.equal(a.valid, true);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(d), before);
  assert.equal(a.plan.schema_version, '2.0');
  assert.equal(a.plan.start_date, '2026-10-05');
  assert.equal(a.plan.end_date, '2026-10-11');
  assert.equal(a.plan.days.length, 7);
  assert.ok(!('coachProgram' in a.plan));
});
test('week-start mismatch blocks App clipping ambiguity', () => {
  const d = restWeek(draft());
  d.weekStart = 'sunday';
  assert.ok(C.buildPlan(d, schema).issues.some(x => x.code === 'weekStart'));
  d.startDate = '2026-10-04';
  assert.equal(C.buildPlan(d, schema).valid, true);
});
test('km/metres/miles, minutes/seconds/hours and mile pace convert explicitly', () => {
  const checks = [['distance', '1000', 'm', 1], ['distance', '1', 'mi', 1.609344], ['time', '90', 's', 1.5], ['time', '1', 'h', 60]];
  for (const [metric, value, unit, n] of checks) {
    const s = {
      ...C.segmentDraft(metric),
      value,
      unit
    };
    const errors = [];
    assert.equal(C.convertSegment(s, 'test', errors).value, n);
    assert.equal(errors.length, 0);
  }
  const s = {
    ...C.segmentDraft(),
    value: '1',
    paceMin: '8:00',
    paceMax: '9:00',
    paceUnit: 'mi'
  };
  const out = C.convertSegment(s, 'test', []);
  assert.equal(out.target.pace.min, 8 / C.MILE_KM);
  assert.equal(C.parsePace('5:30'), 5.5);
  assert.ok(Number.isNaN(C.parsePace('5:60')));
});
test('unknown duration distance and one-bound pace never imply zero or full totals', () => {
  const w = workout('time', '30');
  assert.equal(C.workoutTotals(w).distanceUnknown, 1);
  assert.equal(C.workoutTotals(w).duration[0], 30);
  w.blocks[0].segments[0].paceMin = '5:00';
  assert.equal(C.workoutTotals(w).distanceUnknown, 1);
  w.blocks[0].segments[0].paceMax = '6:00';
  assert.deepEqual(C.workoutTotals(w).distance, [5, 6]);
  assert.equal(C.workoutTotals(w).distanceDerived, 1);
});
test('all interval recoveries repeat; warmup and cooldown occur once', () => {
  const w = C.workoutFromTemplate('intervals');
  w.blocks[0].repeat = '4';
  w.blocks[0].segments[0].value = '400';
  w.blocks[0].segments[0].unit = 'm';
  w.blocks[0].segments[1] = {
    ...C.segmentDraft('distance', 'rest'),
    value: '200',
    unit: 'm'
  };
  w.warmup = {
    ...C.segmentDraft(),
    value: '1'
  };
  w.cooldown = {
    ...C.segmentDraft(),
    value: '1'
  };
  const a = C.workoutTotals(w);
  assert.ok(Math.abs(a.distance[0] - 4.4) < 1e-10);
  assert.equal(a.recoveryKm, .8);
  assert.equal(a.durationUnknown, 4);
});
test('invalid, reversed pace, RPE, zone and repeat block export', () => {
  const d = restWeek(draft());
  delete d.days[0];
  const w = workout();
  Object.assign(w.blocks[0].segments[0], {
    paceMin: '6:00',
    paceMax: '5:00',
    rpe: '11',
    hrZone: 'Z9'
  });
  w.blocks[0].repeat = '31';
  C.putWorkout(d, 0, w);
  const codes = C.buildPlan(d, schema).issues.map(i => i.code);
  for (const code of ['paceOrder', 'rpe', 'zone', 'repeat']) assert.ok(codes.includes(code));
});
test('one workout/day permits an event but rejects workout/rest collisions', () => {
  const d = draft();
  assert.equal(C.putWorkout(d, 0, workout()), true);
  assert.equal(C.putWorkout(d, 0, workout()), false);
  assert.equal(C.markRest(d, 0), false);
  d.days[0].event = {
    name: 'Synthetic event',
    distance: '5k',
    goalTimeSec: ''
  };
  assert.equal(C.transferWorkout(d, 0, 1, true), true);
  assert.equal(C.transferWorkout(d, 0, 1), false);
  assert.equal(C.markRest(d, 2), true);
  assert.equal(C.transferWorkout(d, 0, 2), false);
  assert.equal(C.transferWorkout(d, 0, 3), true);
  assert.ok(d.days[0].event);
  assert.ok(!d.days[0].workout);
});
test('race metadata can extend beyond the concrete one-week window', () => {
  const d = raceDraft();
  const r = C.buildPlan(d, schema);
  assert.equal(r.valid, true, JSON.stringify(r.issues));
  assert.equal(r.plan.days.length, 7);
  assert.equal(r.plan.coachProgram.weeks.length, 8);
  assert.equal(r.plan.coachProgram.weeks[7].endDate, d.race.date);
  assert.equal(r.plan.coachProgram.weeks[0].blockIndex, 1);
  assert.equal(r.plan.coachProgram.weeks[7].blockIndex, 2);
});
test('metadata identity is stable and changed route increments revision only on export', () => {
  const d = raceDraft();
  const first = C.buildPlan(d, schema);
  C.commitExport(d, first);
  assert.equal(C.buildPlan(d, schema).route.program.revision, 1);
  d.stages[0].focus = 'Changed user focus';
  const changed = C.buildPlan(d, schema);
  assert.equal(changed.route.program.id, first.route.program.id);
  assert.equal(changed.route.program.revision, 2);
  assert.equal(d.program.revision, 1);
  C.commitExport(d, changed);
  assert.equal(C.buildPlan(d, schema).route.program.revision, 2);
  d.days[0].notes = 'Workout note only';
  assert.equal(C.buildPlan(d, schema).route.program.revision, 2);
});
test('1 and 160 metadata weeks pass; 161, outside days and absent race role block', () => {
  assert.equal(C.buildPlan(raceDraft(1), schema).valid, true);
  assert.equal(C.buildPlan(raceDraft(160), schema).valid, true);
  assert.ok(C.buildPlan(raceDraft(161), schema).issues.some(x => x.code === 'horizon'));
  const d = raceDraft();
  d.days[56] = {
    rest: true
  };
  assert.ok(C.buildPlan(d, schema).issues.some(x => x.code === 'outside'));
  delete d.days[56];
  d.stages[1].role = 'maintain';
  assert.ok(C.buildPlan(d, schema).issues.some(x => x.code === 'raceWeek'));
});
test('external window can select later concrete weeks without creating earlier days', () => {
  const d = raceDraft();
  d.days = {};
  restWeek(d, 3);
  d.fromWeek = 4;
  d.toWeek = 4;
  const r = C.buildPlan(d, schema);
  assert.equal(r.valid, true);
  assert.equal(r.plan.start_date, '2026-10-26');
  assert.equal(r.plan.days.length, 7);
  assert.equal(r.plan.coachProgram.startDate, '2026-10-05');
});
test('growth only uses complete exact weeks with nonzero previous distance', () => {
  const d = raceDraft(2);
  restWeek(d, 1);
  delete d.days[0];
  delete d.days[7];
  C.putWorkout(d, 0, workout('distance', '10'));
  C.putWorkout(d, 7, workout('distance', '12'));
  assert.ok(Math.abs(C.analyze(d).weeks[1].change - 20) < 1e-10);
  assert.equal(C.analyze(d).weeks[1].overReference, true);
  assert.equal(C.analyze(d, 25).weeks[1].overReference, false);
  delete d.days[8];
  assert.equal(C.analyze(d).weeks[1].change, null);
});
test('race distance is separate and custom race remains unknown', () => {
  const d = restWeek(draft());
  delete d.days[0];
  d.days[0] = {
    event: {
      name: 'Synthetic custom',
      distance: 'custom',
      goalTimeSec: ''
    }
  };
  let w = C.analyze(d).weeks[0];
  assert.equal(w.raceUnknown, 1);
  assert.equal(w.distance[0], 0);
  d.days[0].event.distance = 'fm';
  w = C.analyze(d).weeks[0];
  assert.equal(w.raceKm, 42.195);
  assert.equal(w.distance[0], 0);
});
test('quality gaps report dates, not presumed recovery hours', () => {
  const d = restWeek(draft());
  for (const i of [0, 2]) {
    delete d.days[i];
    const w = workout();
    w.type = 'threshold';
    C.putWorkout(d, i, w);
  }
  assert.deepEqual(C.analyze(d).qualityGaps, [{
    from: '2026-10-05',
    to: '2026-10-07',
    days: 2
  }]);
});
test('browser draft-07 validator agrees with the synthetic App-compatible fixture', () => {
  assert.deepEqual(C.schemaErrors(appFixture, schema), []);
  const r = C.buildPlan(restWeek(draft()), schema);
  r.plan.days[0].workout = {};
  assert.ok(C.schemaErrors(r.plan, schema).length);
  r.plan.extra = true;
  assert.ok(C.schemaErrors(r.plan, schema).some(x => x.path.includes('extra')));
});
test('draft roundtrip preserves typed units and original intent', () => {
  const d = restWeek(draft());
  d.goal = 'My own intention / 我自己的安排';
  delete d.days[0];
  const w = workout();
  w.blocks[0].segments[0].unit = 'mi';
  C.putWorkout(d, 0, w);
  assert.deepEqual(C.safeRestore(JSON.stringify(d)), d);
  assert.equal(C.safeRestore('{broken'), null);
  assert.equal(C.safeRestore(JSON.stringify({
    ...d,
    version: 2
  })), null);
  const bad = C.clone(d);
  bad.days[0].workout.blocks[0].segments[0].paceMin = null;
  assert.equal(C.safeRestore(JSON.stringify(bad)), null);
  assert.equal(C.safeRestore(' '.repeat(1500001)), null);
});
test('an unfinished draft roundtrips without guessing a race distance', () => {
  const d = C.newDraft();
  assert.equal(d.race.distance, '');
  assert.deepEqual(C.safeRestore(JSON.stringify(d)), d);
});
test('unrecognized keys and noncanonical day slots are rejected on restore', () => {
  const d = restWeek(draft());
  assert.equal(C.safeRestore(JSON.stringify({
    ...d,
    unknown: 'field'
  })), null);
  d.days['00'] = {
    rest: true
  };
  assert.equal(C.safeRestore(JSON.stringify(d)), null);
});
