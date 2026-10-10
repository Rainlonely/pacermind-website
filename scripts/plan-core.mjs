/* Browser-local PacerMind editor domain. External contract is the checked-in iOS schema. */
export const TYPES = ['easy', 'aerobic', 'steady', 'long_run', 'tempo', 'threshold', 'intervals', 'race_like', 'recovery'];
export const PHASES = ['base', 'build', 'peak', 'taper', 'race', 'free'];
export const ROLES = ['establish', 'maintain', 'develop', 'consolidate', 'cutback', 'taper', 'race', 'return'];
export const RACES = ['5k', '10k', 'hm', 'fm', '100k', 'custom'];
export const RACE_KM = {
  '5k': 5,
  '10k': 10,
  hm: 21.0975,
  fm: 42.195,
  '100k': 100
};
export const MILE_KM = 1.609344;
export const TEMPLATES = [{
  id: 'easy-distance',
  type: 'easy',
  metric: 'distance',
  name: ['Easy · distance', '轻松跑 · 距离'],
  hint: ['A single distance segment. Set your own distance and pace.', '单段距离结构，距离与配速由你设定。']
}, {
  id: 'easy-time',
  type: 'easy',
  metric: 'time',
  name: ['Easy · duration', '轻松跑 · 时长'],
  hint: ['A single time segment. Distance remains unknown without pace.', '单段时长结构，无配速时距离保持未知。']
}, {
  id: 'long',
  type: 'long_run',
  metric: 'distance',
  name: ['Long run', '长距离'],
  hint: ['Distance structure, with optional warmup and cooldown.', '距离结构，可自行加入热身与放松。']
}, {
  id: 'tempo',
  type: 'tempo',
  metric: 'time',
  name: ['Tempo / threshold', '节奏与阈值'],
  hint: ['Choose the type and set your own effort target.', '自行选择课型、时长与强度目标。']
}, {
  id: 'intervals',
  type: 'intervals',
  metric: 'distance',
  name: ['Work + recovery', '间歇与恢复'],
  hint: ['Repeating work and recovery segments; choose every value.', '重复工作段与恢复段，各项数值由你填写。']
}, {
  id: 'recovery',
  type: 'recovery',
  metric: 'time',
  name: ['Recovery run', '恢复跑'],
  hint: ['A duration structure without an assumed intensity.', '时长结构，不预设恢复强度。']
}];
export const PHASE_TEMPLATES = {
  base: {
    role: 'establish',
    templates: ['easy-distance', 'easy-time', 'long']
  },
  build: {
    role: 'develop',
    templates: ['easy-distance', 'long', 'tempo']
  },
  peak: {
    role: 'consolidate',
    templates: ['long', 'tempo', 'intervals']
  },
  taper: {
    role: 'taper',
    templates: ['easy-time', 'recovery']
  },
  race: {
    role: 'race',
    templates: ['easy-time', 'recovery']
  },
  free: {
    role: 'return',
    templates: ['recovery', 'easy-time']
  }
};
export const clone = value => JSON.parse(JSON.stringify(value));
const uid = () => globalThis.crypto?.randomUUID?.() || `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function newDraft() {
  return {
    version: 1,
    title: '',
    goal: '',
    notes: '',
    weekStart: 'monday',
    startDate: '',
    mode: 'week',
    reference: 10,
    race: {
      name: '',
      date: '',
      distance: '',
      goalTimeSec: ''
    },
    stages: [],
    days: {},
    fromWeek: 1,
    toWeek: 1,
    program: {
      id: uid(),
      revision: 1,
      lastSignature: ''
    }
  };
}
export function segmentDraft(metric = 'distance', kind = 'work') {
  return {
    kind,
    metric,
    value: '',
    unit: metric === 'time' ? 'min' : 'km',
    paceMin: '',
    paceMax: '',
    paceUnit: 'km',
    rpe: '',
    hrZone: ''
  };
}
export function workoutFromTemplate(id, lang = 'en') {
  const t = TEMPLATES.find(x => x.id === id);
  if (!t) throw new Error('Unknown template');
  return {
    type: t.type,
    title: t.name[lang === 'zh' ? 1 : 0],
    description: '',
    environment: '',
    startTime: '',
    warmup: null,
    cooldown: null,
    blocks: [{
      repeat: t.id === 'intervals' ? '' : '1',
      label: '',
      segments: t.id === 'intervals' ? [segmentDraft('distance'), segmentDraft('time', 'rest')] : [segmentDraft(t.metric)]
    }]
  };
}
export function validDate(text) {
  if (typeof text !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const d = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === text;
}
export function addDays(date, n) {
  if (!validDate(date) || !Number.isInteger(n)) return '';
  return new Date(+new Date(`${date}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}
export function dayDiff(a, b) {
  return validDate(a) && validDate(b) ? Math.round((+new Date(`${b}T00:00:00Z`) - +new Date(`${a}T00:00:00Z`)) / 86400000) : null;
}
export function alignedStart(date, weekStart) {
  if (!validDate(date)) return '';
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, -((dow - (weekStart === 'sunday' ? 0 : 1) + 7) % 7));
}
export function horizon(d) {
  return d.mode === 'week' ? 1 : d.stages.reduce((n, s) => n + (Number.isInteger(Number(s.weeks)) && Number(s.weeks) > 0 ? Number(s.weeks) : 0), 0);
}
export function dateAt(d, slot) {
  return addDays(d.startDate, Number(slot));
}
export function stageAt(d, week) {
  let cursor = 0;
  for (let i = 0; i < d.stages.length; i++) {
    cursor += Number(d.stages[i].weeks) || 0;
    if (week < cursor) return {
      ...d.stages[i],
      blockIndex: i + 1
    };
  }
  return null;
}
export function parsePace(raw) {
  const text = String(raw).trim();
  if (text === '') return null;
  if (/^\d+:\d{2}$/.test(text)) {
    const [m, s] = text.split(':').map(Number);
    return s < 60 && m + s / 60 > 0 ? m + s / 60 : NaN;
  }
  return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) && Number(text) > 0 ? Number(text) : NaN;
}
function positive(raw) {
  const s = String(raw).trim();
  return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) && Number(s) > 0 && Number.isFinite(Number(s)) ? Number(s) : NaN;
}
function integer(raw, min, max) {
  const s = String(raw).trim();
  const v = Number(s);
  return /^\d+$/.test(s) && Number.isInteger(v) && v >= min && v <= max ? v : NaN;
}
const issue = (issues, code, path) => issues.push({
  code,
  path
});
export function convertSegment(s, path, issues, stage = false) {
  const value = positive(s.value);
  if (!Number.isFinite(value)) issue(issues, 'amount', `${path}.value`);
  const units = s.metric === 'distance' ? {
    km: 1,
    m: 0.001,
    mi: MILE_KM
  } : {
    min: 1,
    s: 1 / 60,
    h: 60
  };
  if (!['distance', 'time'].includes(s.metric) || !Object.hasOwn(units, s.unit)) issue(issues, 'unit', `${path}.unit`);
  const result = {
    metric: s.metric,
    value: value * (units[s.unit] ?? NaN)
  };
  if (!stage) {
    result.kind = s.kind;
    if (!['work', 'rest'].includes(s.kind)) issue(issues, 'kind', path);
  }
  const target = {};
  const min = parsePace(s.paceMin),
    max = parsePace(s.paceMax);
  if (min !== null || max !== null) {
    if (min !== null && !Number.isFinite(min) || max !== null && !Number.isFinite(max)) issue(issues, 'pace', path);
    if (!['km', 'mi'].includes(s.paceUnit)) issue(issues, 'unit', `${path}.paceUnit`);
    if (min !== null && max !== null && min > max) issue(issues, 'paceOrder', `${path}.paceMax`);
    const scale = s.paceUnit === 'mi' ? MILE_KM : 1;
    target.pace = {};
    if (min !== null) target.pace.min = min / scale;
    if (max !== null) target.pace.max = max / scale;
  }
  if (String(s.rpe).trim() !== '') {
    const rpe = integer(s.rpe, 1, 10);
    if (!Number.isFinite(rpe)) issue(issues, 'rpe', `${path}.rpe`);
    target.rpe = rpe;
  }
  if (s.hrZone) {
    if (!/^Z[1-5](?:-Z[1-5])?$/.test(s.hrZone)) issue(issues, 'zone', `${path}.hrZone`);
    target.hr_zone = s.hrZone;
  }
  if (Object.keys(target).length) result.target = target;
  return result;
}
export function convertWorkout(w, path, issues) {
  if (!TYPES.includes(w.type)) issue(issues, 'type', path);
  const r = {
    type: w.type,
    title: String(w.title).trim(),
    blocks: []
  };
  if (!r.title || r.title.length > 120) issue(issues, 'workoutTitle', path);
  if (w.description) r.description = w.description;
  if (w.environment) r.environment = w.environment;
  if (w.startTime) r.start_time = w.startTime;
  for (const key of ['warmup', 'cooldown']) if (w[key]) r[key] = convertSegment(w[key], `${path}.${key}`, issues, true);
  if (!Array.isArray(w.blocks) || !w.blocks.length) {
    issue(issues, 'blocks', path);
    return r;
  }
  w.blocks.forEach((b, i) => {
    const bp = `${path}.blocks[${i}]`;
    const repeat = integer(b.repeat, 1, 30);
    if (!Number.isFinite(repeat)) issue(issues, 'repeat', `${bp}.repeat`);
    if (!Array.isArray(b.segments) || !b.segments.length) issue(issues, 'segments', bp);
    const block = {
      repeat,
      segments: (b.segments || []).map((s, j) => convertSegment(s, `${bp}.segments[${j}]`, issues))
    };
    if (b.label) block.label = b.label;
    r.blocks.push(block);
  });
  return r;
}
/* Small draft-07 interpreter for the exact checked-in schema, used by browser and tests. */
export function schemaErrors(value, schema) {
  const errors = [];
  function check(v, s, path, collect = true) {
    if (s.$ref) s = schema.definitions[s.$ref.split('/').at(-1)];
    const local = [];
    const fail = what => local.push({
      code: 'schema',
      path: `${path}: ${what}`
    });
    const type = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
    if (s.type && !(s.type === type || s.type === 'integer' && Number.isInteger(v))) fail(s.type);
    if (s.const !== undefined && v !== s.const) fail('const');
    if (s.enum && !s.enum.includes(v)) fail('enum');
    if (type === 'number') {
      if (!Number.isFinite(v)) fail('finite');
      if (s.minimum !== undefined && v < s.minimum) fail('minimum');
      if (s.maximum !== undefined && v > s.maximum) fail('maximum');
      if (s.exclusiveMinimum !== undefined && v <= s.exclusiveMinimum) fail('exclusiveMinimum');
    }
    if (type === 'string') {
      if (s.minLength !== undefined && [...v].length < s.minLength) fail('minLength');
      if (s.maxLength !== undefined && [...v].length > s.maxLength) fail('maxLength');
      if (s.pattern && !new RegExp(s.pattern).test(v)) fail('pattern');
    }
    if (type === 'object') {
      if (s.required) for (const k of s.required) if (!Object.hasOwn(v, k)) fail(`required ${k}`);
      if (s.minProperties !== undefined && Object.keys(v).length < s.minProperties) fail('minProperties');
      for (const [k, x] of Object.entries(v)) {
        if (s.properties?.[k]) local.push(...check(x, s.properties[k], `${path}.${k}`, false));else if (s.additionalProperties === false) fail(`extra ${k}`);
      }
    }
    if (type === 'array') {
      if (s.minItems !== undefined && v.length < s.minItems) fail('minItems');
      if (s.maxItems !== undefined && v.length > s.maxItems) fail('maxItems');
      if (s.items) v.forEach((x, i) => local.push(...check(x, s.items, `${path}[${i}]`, false)));
    }
    if (s.allOf) s.allOf.forEach(x => local.push(...check(v, x, path, false)));
    if (s.anyOf && !s.anyOf.some(x => check(v, x, path, false).length === 0)) fail('anyOf');
    if (s.not && check(v, s.not, path, false).length === 0) fail('not');
    if (s.if) {
      const branch = check(v, s.if, path, false).length === 0 ? s.then : s.else;
      if (branch) local.push(...check(v, branch, path, false));
    }
    if (collect) errors.push(...local);
    return local;
  }
  check(value, schema, '$');
  return errors;
}
export function programFor(d) {
  const weeks = [];
  for (let i = 0; i < horizon(d); i++) {
    const s = stageAt(d, i);
    if (!s) continue;
    weeks.push({
      id: `${d.program.id}:w${i + 1}`,
      index: i + 1,
      blockIndex: s.blockIndex,
      startDate: dateAt(d, i * 7),
      endDate: dateAt(d, i * 7 + 6),
      phase: s.phase,
      role: s.role,
      focus: s.focus.trim(),
      reviewRequired: true
    });
  }
  const signature = JSON.stringify({
    startDate: d.startDate,
    weekStart: d.weekStart,
    raceDate: d.race.date,
    weeks
  });
  const revision = d.program.lastSignature && d.program.lastSignature !== signature ? d.program.revision + 1 : d.program.revision;
  return {
    program: {
      schemaVersion: 'coach-program-1',
      id: d.program.id,
      revision,
      intent: 'racePreparation',
      startDate: d.startDate,
      weekStart: d.weekStart,
      raceDate: d.race.date,
      weeks
    },
    signature
  };
}
export function buildPlan(d, schema) {
  const issues = [];
  const count = horizon(d);
  const from = integer(d.fromWeek, 1, 160),
    to = integer(d.toWeek, 1, 160);
  if (!validDate(d.startDate)) issue(issues, 'startDate', 'startDate');
  if (!['monday', 'sunday'].includes(d.weekStart) || alignedStart(d.startDate, d.weekStart) !== d.startDate) issue(issues, 'weekStart', 'weekStart');
  if (!d.title.trim() || d.title.length > 120) issue(issues, 'title', 'title');
  if (!d.goal.trim() || d.goal.length > 500) issue(issues, 'goal', 'goal');
  if (!Number.isInteger(count) || count < 1 || count > 160) issue(issues, 'horizon', 'stages');
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to || to > count) issue(issues, 'window', 'fromWeek/toWeek');
  for (const key of Object.keys(d.days)) {
    if (!/^\d+$/.test(key) || Number(key) >= count * 7) issue(issues, 'outside', 'days');
  }
  let route = null;
  if (d.mode === 'race') {
    if (!validDate(d.race.date) || d.race.date < d.startDate || d.race.date > dateAt(d, count * 7 - 1)) issue(issues, 'raceDate', 'race.date');
    if (!d.race.name.trim() || d.race.name.length > 120 || !RACES.includes(d.race.distance)) issue(issues, 'race', 'race');
    d.stages.forEach((s, i) => {
      if (!Number.isFinite(integer(s.weeks, 1, 160))) issue(issues, 'stageLength', `stages[${i}]`);
      if (!s.focus.trim() || s.focus.length > 500) issue(issues, 'focus', `stages[${i}]`);
      if (!PHASES.includes(s.phase) || !ROLES.includes(s.role)) issue(issues, 'stage', 'stages');
    });
    if (!d.program.id || !Number.isInteger(d.program.revision) || d.program.revision < 1) issue(issues, 'revision', 'program');
    route = programFor(d);
    if (!route.program.weeks.some(w => w.startDate <= d.race.date && w.endDate >= d.race.date && w.role === 'race')) issue(issues, 'raceWeek', 'stages');
  }
  const plan = {
    schema_version: '2.0',
    title: d.title.trim(),
    goal: d.goal.trim(),
    start_date: dateAt(d, (from - 1) * 7),
    end_date: dateAt(d, to * 7 - 1),
    days: []
  };
  if (d.notes) plan.notes = d.notes;
  if (route) plan.coachProgram = route.program;
  if (Number.isFinite(from) && Number.isFinite(to) && from <= to && to - from < 160) for (let slot = (from - 1) * 7; slot < to * 7; slot++) {
    const day = d.days[slot];
    const path = dateAt(d, slot) || `day ${slot + 1}`;
    if (!day || !day.rest && !day.workout && !day.event) {
      issue(issues, 'pending', path);
      continue;
    }
    if (day.rest && (day.workout || day.event)) issue(issues, 'restConflict', path);
    const out = {
      date: dateAt(d, slot)
    };
    if (day.rest) out.rest = true;
    if (day.notes) out.notes = day.notes;
    if (day.workout) out.workout = convertWorkout(day.workout, path, issues);
    if (day.event) {
      const e = day.event;
      out.event = {
        type: 'race',
        name: e.name.trim(),
        distance: e.distance
      };
      if (e.goalTimeSec !== '') {
        const secs = integer(e.goalTimeSec, 1, Number.MAX_SAFE_INTEGER);
        if (!Number.isFinite(secs)) issue(issues, 'raceTime', path);
        out.event.goal_time_sec = secs;
      }
      if (!e.name.trim() || !RACES.includes(e.distance)) issue(issues, 'race', path);
    }
    plan.days.push(out);
  }
  if (schema) issues.push(...schemaErrors(plan, schema));else issue(issues, 'schemaUnavailable', 'schema');
  return {
    plan,
    issues,
    route,
    valid: issues.length === 0
  };
}
export function commitExport(d, result) {
  if (result.valid && result.route) {
    d.program.revision = result.route.program.revision;
    d.program.lastSignature = result.route.signature;
  }
}
export function putWorkout(d, slot, w) {
  if (d.days[slot]?.workout || d.days[slot]?.rest) return false;
  d.days[slot] = {
    ...d.days[slot],
    workout: clone(w)
  };
  return true;
}
export function transferWorkout(d, source, target, copy = false) {
  if (source === target || !d.days[source]?.workout || d.days[target]?.workout || d.days[target]?.rest) return false;
  if (!putWorkout(d, target, d.days[source].workout)) return false;
  if (!copy) delete d.days[source].workout;
  return true;
}
export function markRest(d, slot) {
  if (d.days[slot]?.workout || d.days[slot]?.event) return false;
  d.days[slot] = {
    ...d.days[slot],
    rest: true
  };
  return true;
}
/* Exact component totals and pace-derived ranges. Unknown components remain unknown. */
export function workoutTotals(w) {
  const issues = [];
  const x = convertWorkout(w, 'workout', issues);
  const r = {
    distance: [0, 0],
    duration: [0, 0],
    distanceUnknown: 0,
    durationUnknown: 0,
    distanceDerived: 0,
    durationDerived: 0,
    recoveryKm: 0
  };
  const consume = (s, n) => {
    const value = s.value * n;
    if (!(value > 0 && Number.isFinite(value))) {
      r.distanceUnknown++;
      r.durationUnknown++;
      return;
    }
    const p = s.target?.pace;
    const bounded = p?.min > 0 && p?.max >= p.min && Number.isFinite(p.max);
    if (s.metric === 'distance') {
      r.distance[0] += value;
      r.distance[1] += value;
      if (s.kind === 'rest') r.recoveryKm += value;
      if (bounded) {
        r.duration[0] += value * p.min;
        r.duration[1] += value * p.max;
        r.durationDerived++;
      } else r.durationUnknown++;
    } else if (s.metric === 'time') {
      r.duration[0] += value;
      r.duration[1] += value;
      if (bounded) {
        r.distance[0] += value / p.max;
        r.distance[1] += value / p.min;
        r.distanceDerived++;
      } else r.distanceUnknown++;
    } else {
      r.distanceUnknown++;
      r.durationUnknown++;
    }
  };
  if (x.warmup) consume(x.warmup, 1);
  x.blocks.forEach(b => b.segments.forEach(s => consume(s, b.repeat)));
  if (x.cooldown) consume(x.cooldown, 1);
  return r;
}
export function analyze(d, reference = d.reference ?? 10) {
  const weeks = [];
  const qualitySlots = [];
  for (let w = 0; w < Math.min(horizon(d), 160); w++) {
    const total = {
      index: w + 1,
      start: dateAt(d, w * 7),
      end: dateAt(d, w * 7 + 6),
      phase: stageAt(d, w)?.phase || '',
      distance: [0, 0],
      duration: [0, 0],
      distanceUnknown: 0,
      durationUnknown: 0,
      distanceDerived: 0,
      durationDerived: 0,
      recoveryKm: 0,
      pendingDays: 0,
      raceKm: 0,
      raceUnknown: 0,
      qualityCount: 0
    };
    for (let slot = w * 7; slot < w * 7 + 7; slot++) {
      const day = d.days[slot];
      if (!day || !day.rest && !day.workout && !day.event) {
        total.pendingDays++;
        continue;
      }
      if (day.workout) {
        const t = workoutTotals(day.workout);
        for (const key of ['distanceUnknown', 'durationUnknown', 'distanceDerived', 'durationDerived', 'recoveryKm']) total[key] += t[key];
        for (const key of ['distance', 'duration']) total[key] = total[key].map((v, i) => v + t[key][i]);
        if (['tempo', 'threshold', 'intervals', 'race_like'].includes(day.workout.type)) {
          total.qualityCount++;
          qualitySlots.push(slot);
        }
      }
      if (day.event) {
        if (RACE_KM[day.event.distance]) total.raceKm += RACE_KM[day.event.distance];else total.raceUnknown++;
      }
    }
    const prev = weeks.at(-1);
    const exact = t => t && t.pendingDays === 0 && t.distanceUnknown === 0 && t.distanceDerived === 0;
    total.change = exact(total) && exact(prev) && prev.distance[0] > 0 ? (total.distance[0] - prev.distance[0]) / prev.distance[0] * 100 : null;
    total.overReference = total.change !== null && total.change > Number(reference);
    weeks.push(total);
  }
  return {
    weeks,
    qualityGaps: qualitySlots.slice(1).map((slot, i) => ({
      from: dateAt(d, qualitySlots[i]),
      to: dateAt(d, slot),
      days: slot - qualitySlots[i]
    })),
    reference
  };
}
export function safeRestore(raw) {
  const keysOK = (o, keys) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every(k => keys.includes(k));
  try {
    if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 1500000) return null;
    const d = JSON.parse(raw);
    if (d.version !== 1 || !['week', 'race'].includes(d.mode) || !['monday', 'sunday'].includes(d.weekStart) || typeof d.startDate !== 'string' || typeof d.title !== 'string' || typeof d.goal !== 'string' || typeof d.notes !== 'string' || !d.race || typeof d.race.date !== 'string' || typeof d.race.name !== 'string' || ![...RACES, ''].includes(d.race.distance) || typeof d.race.goalTimeSec !== 'string' || !d.program || typeof d.program.id !== 'string' || !Number.isInteger(d.program.revision) || d.program.revision < 1 || typeof d.program.lastSignature !== 'string' || !Array.isArray(d.stages) || d.stages.length > 160 || !d.days || Array.isArray(d.days) || typeof d.days !== 'object' || !Number.isInteger(d.fromWeek) || !Number.isInteger(d.toWeek)) return null;
    if (!keysOK(d, ['version', 'title', 'goal', 'notes', 'weekStart', 'startDate', 'mode', 'reference', 'race', 'stages', 'days', 'fromWeek', 'toWeek', 'program']) || !keysOK(d.race, ['name', 'date', 'distance', 'goalTimeSec']) || !keysOK(d.program, ['id', 'revision', 'lastSignature'])) return null;
    if (d.reference !== undefined && (!Number.isFinite(d.reference) || d.reference < 0 || d.reference > 1000)) return null;
    if (d.stages.some(s => !keysOK(s, ['phase', 'role', 'weeks', 'focus']) || typeof s.focus !== 'string' || !PHASES.includes(s.phase) || !ROLES.includes(s.role) || !Number.isFinite(integer(s.weeks, 1, 160)))) return null;
    let segments = 0;
    const segmentOK = s => keysOK(s, ['kind', 'metric', 'value', 'unit', 'paceMin', 'paceMax', 'paceUnit', 'rpe', 'hrZone']) && ['work', 'rest'].includes(s.kind) && ['distance', 'time'].includes(s.metric) && ['value', 'unit', 'paceMin', 'paceMax', 'paceUnit', 'rpe', 'hrZone'].every(k => typeof s[k] === 'string');
    for (const [slot, day] of Object.entries(d.days)) {
      if (!/^(0|[1-9]\d*)$/.test(slot) || Number(slot) > 1119 || !keysOK(day, ['rest', 'workout', 'event', 'notes'])) return null;
      if (day.rest !== undefined && typeof day.rest !== 'boolean') return null;
      if (day.notes !== undefined && typeof day.notes !== 'string') return null;
      if (day.event && (!keysOK(day.event, ['name', 'distance', 'goalTimeSec']) || typeof day.event.name !== 'string' || !RACES.includes(day.event.distance) || typeof day.event.goalTimeSec !== 'string')) return null;
      if (day.workout) {
        const w = day.workout;
        if (!keysOK(w, ['type', 'title', 'description', 'environment', 'startTime', 'warmup', 'cooldown', 'blocks']) || typeof w.title !== 'string' || !TYPES.includes(w.type) || !Array.isArray(w.blocks) || w.blocks.length > 100 || !['description', 'environment', 'startTime'].every(k => typeof w[k] === 'string')) return null;
        for (const b of w.blocks) {
          if (!keysOK(b, ['repeat', 'label', 'segments']) || typeof b.repeat !== 'string' || typeof b.label !== 'string' || !Array.isArray(b.segments) || b.segments.length > 100) return null;
          segments += b.segments.length;
          if (segments > 20000 || b.segments.some(s => !segmentOK(s))) return null;
        }
        for (const key of ['warmup', 'cooldown']) if (w[key] && !segmentOK(w[key])) return null;
      }
    }
    return d;
  } catch {
    return null;
  }
}
