const { test } = require('node:test');
const assert = require('node:assert/strict');
const {monthCells, groupDays, projectRoutes, coordinates} = require('../journey-calendar.js');
test('calendar handles Monday-first offsets, leap days, and six-week months', () => {
  assert.equal(monthCells('2024-02').filter(Boolean).length, 29);
  assert.equal(monthCells('2026-02')[6], '2026-02-01');
  assert.equal(monthCells('2026-03').length, 42);
  assert.throws(() => monthCells('2026-13'));
});
test('multiple runs remain grouped and impossible dates are rejected', () => {
  const days = groupDays([{date:'2026-10-25',note:'one'}, {date:'2026-10-25',note:'two'}, {date:'2026-02-30'}, {date:null}]);
  assert.equal(days.size, 1);
  assert.deepEqual(days.get('2026-10-25').map(r=>r.note), ['one','two']);
});
test('route projection preserves north and east while filtering invalid coordinates', () => {
  const run = {coordinates:[[31,121],[32,122],[NaN,121],[91,0]]};
  assert.equal(coordinates(run).length, 2);
  const [points] = projectRoutes([run],600,340);
  assert.ok(points[1][0] > points[0][0]);
  assert.ok(points[1][1] < points[0][1]);
  assert.ok(points.flat().every(Number.isFinite));
  assert.deepEqual(projectRoutes([{coordinates:[]}],600,340),[]);
});
