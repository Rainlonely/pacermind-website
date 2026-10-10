import * as C from './plan-core.mjs';
import { COPY, LABELS, ERRORS } from './plan-copy.mjs';
const root = document.querySelector('#planner');
const dialog = document.querySelector('#editor-dialog');
const confirmDialog = document.querySelector('#change-dialog');
const storageKey = 'pacermind-plan-draft-v1';
const writer = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
let lang = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
let draft = C.newDraft(),
  history = [],
  viewWeek = 1,
  selectedTemplate = 'easy-distance',
  schema = null,
  preview = null;
let savedAt = '',
  status = '',
  pauseSave = false,
  foreign = null,
  storedRaw = '',
  lastToken = '',
  changeAction = null,
  editing = null,
  textEdit = null;
const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const t = k => (COPY[k] || [k, k])[lang === 'zh' ? 1 : 0];
const label = (kind, key) => (LABELS[kind]?.[key] || [key, key])[lang === 'zh' ? 1 : 0];
const button = (action, text, extra = '') => `<button type="button" data-action="${action}" ${extra}>${e(text)}</button>`;
const options = (values, value, kind) => (kind === 'race' && !values.includes(value) ? `<option value="" selected>${e(t('pending'))}</option>` : '') + values.map(v => `<option value="${e(v)}" ${v === value ? 'selected' : ''}>${e(kind ? label(kind, v) : t(v))}</option>`).join('');
function field(text, name, value, type = 'text', extra = '') {
  return `<label>${e(text)}<input name="${e(name)}" type="${type}" value="${e(value)}" ${extra}></label>`;
}
function select(text, name, values, value, kind) {
  return `<label>${e(text)}<select name="${e(name)}">${options(values, value, kind)}</select></label>`;
}
function area(text, name, value, extra = '') {
  return `<label>${e(text)}<textarea name="${e(name)}" ${extra}>${e(value)}</textarea></label>`;
}
function notice(message) {
  status = message;
  const node = document.querySelector('#editor-status');
  if (node) node.textContent = message;
}
function save() {
  if (pauseSave) return;
  try {
    const existing = localStorage.getItem(storageKey);
    const item = existing ? JSON.parse(existing) : null;
    if (!existing && lastToken) {
      foreign = {
        token: '',
        draft: C.newDraft()
      };
      pauseSave = true;
      render();
      return;
    }
    if (item && item.token !== lastToken && item.writer !== writer) {
      foreign = item;
      pauseSave = true;
      render();
      return;
    }
    savedAt = new Date().toISOString();
    lastToken = `${writer}:${savedAt}:${Math.random()}`;
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      writer,
      token: lastToken,
      savedAt,
      draft
    }));
    notice(`${t('saved')} · ${new Date(savedAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-GB')}`);
  } catch {
    notice(t('saveFailed'));
  }
}
function invalidate() {
  preview = null;
  const out = document.querySelector('#export-result');
  if (out) out.innerHTML = `<p class="muted">${e(t('stale'))}</p>`;
}
function mutate(fn) {
  history.push(C.clone(draft));
  if (history.length > 30) history.shift();
  fn(draft);
  invalidate();
  save();
  render();
}
function undo() {
  if (!history.length) return;
  const stamp = C.clone(draft.program);
  draft = history.pop();
  if (draft.program.id === stamp.id && stamp.revision >= draft.program.revision) draft.program = stamp;
  invalidate();
  save();
  render();
}
function parseStored(raw) {
  try {
    const item = JSON.parse(raw);
    if (item.version !== 1 || typeof item.savedAt !== 'string' || typeof item.token !== 'string' || !C.safeRestore(JSON.stringify(item.draft))) return null;
    return item;
  } catch {
    return null;
  }
}
try {
  storedRaw = localStorage.getItem(storageKey) || '';
  if (storedRaw) {
    const item = parseStored(storedRaw);
    if (item) {
      draft = item.draft;
      savedAt = item.savedAt;
      lastToken = item.token;
    } else {
      pauseSave = true;
      status = t('corrupt');
    }
  }
} catch {
  status = t('saveFailed');
}
function downloadJSON(value, name) {
  const blob = new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function ask(content, action) {
  changeAction = action;
  confirmDialog.querySelector('.dialog-body').innerHTML = `<h2>${e(t('previewChange'))}</h2>${content}<div class="toolbar">${button('confirm', t('confirm'), 'class="primary"')}${button('cancel-confirm', t('cancel'))}</div>`;
  confirmDialog.showModal();
}
function affected(next) {
  const keys = Object.keys(draft.days);
  const changes = keys.filter(s => C.dateAt(draft, s) !== C.dateAt(next, s));
  const outside = keys.filter(s => Number(s) >= C.horizon(next) * 7);
  return `<p>${e(t('datesChange'))}</p><p>${e(t('changedDates'))}: <strong>${changes.length}</strong> · ${e(t('outside'))}: <strong>${outside.length}</strong></p>${changes.length ? `<ul class="change-list">${changes.slice(0, 12).map(s => `<li>${e(C.dateAt(draft, s) || '—')} → ${e(C.dateAt(next, s) || '—')}</li>`).join('')}</ul>` : ''}${outside.length ? `<p class="warning">${e(t('outsideHint'))}</p>` : ''}<p>${e(draft.startDate || '—')} → ${e(next.startDate || '—')} · ${C.horizon(draft)} → ${C.horizon(next)} ${e(t('weeks'))}</p><p>${e(t('weekStart'))}: ${e(t(draft.weekStart))} → ${e(t(next.weekStart))}<br>${e(t('mode'))}: ${e(t(draft.mode === 'week' ? 'single' : 'long'))} → ${e(t(next.mode === 'week' ? 'single' : 'long'))}<br>${e(t('raceDate'))}: ${e(draft.race.date || '—')} → ${e(next.race.date || '—')}</p>${next.mode === 'race' ? `<ul class="change-list">${next.stages.map(s => `<li>${e(label('phase', s.phase))} / ${e(label('role', s.role))} · ${e(s.weeks)} ${e(t('weeks'))} · ${e(s.focus || t('pending'))}</li>`).join('')}</ul>` : ''}`;
}
function requestStructural(fn) {
  const next = C.clone(draft);
  fn(next);
  ask(affected(next), () => mutate(d => Object.assign(d, next)));
}
function summaryWorkout(w) {
  const a = C.workoutTotals(w);
  const range = (v, u) => `${fmt(v[0])}${Math.abs(v[1] - v[0]) > .00001 ? `–${fmt(v[1])}` : ''} ${u}`;
  const segments = [w.warmup, ...w.blocks.flatMap(b => b.segments), w.cooldown].filter(Boolean);
  const hasPace = segments.some(s => s.paceMin.trim() || s.paceMax.trim());
  return `${range(a.distance, 'km')}${a.distanceUnknown ? ' + ?' : ''} · ${range(a.duration, 'min')}${a.durationUnknown ? ' + ?' : ''}${hasPace ? '' : ' · ' + t('noPace')}`;
}
function fmt(n) {
  return Number(n).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    maximumFractionDigits: 2
  });
}
function render() {
  const nextLang = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  if (nextLang !== lang) {
    for (const pair of Object.values(COPY)) {
      const oldText = pair[lang === 'zh' ? 1 : 0];
      if (status.startsWith(oldText)) { status = pair[nextLang === 'zh' ? 1 : 0] + status.slice(oldText.length); break; }
    }
  }
  lang = nextLang;
  viewWeek = Math.max(1, Math.min(viewWeek, Math.max(1, Math.min(C.horizon(draft), 160))));
  const count = C.horizon(draft),
    phase = C.stageAt(draft, viewWeek - 1);
  let cursor = 0;
  const alerts = foreign ? `<div class="warning" role="alert"><p>${e(t('tabs'))}</p>${button('load-other', t('loadOther'))}${button('keep-this', t('keepThis'))}</div>` : pauseSave ? `<div class="warning" role="alert"><p>${e(t('corrupt'))}</p>${button('raw-backup', t('rawBackup'))}${button('fresh', t('fresh'))}</div>` : '';
  root.innerHTML = `<div class="editor-heading"><div><span class="eyebrow">${e(t('badge'))}</span><h1>${e(t('title'))}</h1><p class="editor-lead">${e(t('intro'))}</p></div><div class="local-note"><span class="small-label">PacerMind / 3.0</span><p>${e(t('local'))}</p></div></div>${alerts}<div class="draft-toolbar toolbar">${button('undo', t('undo'), history.length ? '' : 'disabled')}${button('backup', t('backup'))}<label class="file-button">${e(t('restore'))}<input type="file" id="restore-file" accept="application/json,.json"></label>${button('clear', t('clear'))}<span id="editor-status" role="status">${e(status || `${t('saved')}${savedAt ? ' · ' + new Date(savedAt).toLocaleTimeString() : ''}`)}</span></div>
 <section class="editor-panel" id="setup"><h2>${e(t('setup'))}</h2><div class="fields">${field(t('planTitle'), 'title', draft.title, 'text', 'maxlength="120"')}${field(t('start'), 'startDate', draft.startDate, 'date')}${select(t('weekStart'), 'weekStart', ['monday', 'sunday'], draft.weekStart)}${select(t('mode'), 'mode', ['single', 'long'], draft.mode === 'week' ? 'single' : 'long')}</div>${area(t('goal'), 'goal', draft.goal, 'maxlength="500" placeholder="' + e(lang === 'zh' ? '写下你的安排、偏好与尚未确定的内容。此文本不会自动转换。' : 'Write your schedule, preferences and unanswered questions. This text is not converted automatically.') + '"')}<p class="muted">${e(t('dateHint'))}</p><details><summary>${e(t('notes'))}</summary>${area(t('notes'), 'notes', draft.notes, 'maxlength="2000"')}</details>
 ${draft.mode === 'race' ? `<div class="race-fields fields">${field(t('raceName'), 'race.name', draft.race.name, 'text', 'maxlength="120"')}${field(t('raceDate'), 'race.date', draft.race.date, 'date')}${select(t('raceDistance'), 'race.distance', C.RACES, draft.race.distance, 'race')}${field(t('raceTime'), 'race.goalTimeSec', draft.race.goalTimeSec, 'text', 'inputmode="numeric"')}</div><h3>${e(t('phases'))} <span class="muted">${count} / 160 ${e(t('weeks'))}</span></h3><div class="phase-list">${draft.stages.map((s, i) => {
    const first = cursor;
    cursor += Number(s.weeks);
    return `<article class="phase-card"><div class="phase-number">${String(i + 1).padStart(2, '0')}</div><div class="fields">${select(t('phase'), `stages.${i}.phase`, C.PHASES, s.phase, 'phase')}${select(t('role'), `stages.${i}.role`, C.ROLES, s.role, 'role')}${field(t('weeks'), `stages.${i}.weeks`, s.weeks, 'number', 'min="1" max="160"')}${field(t('focus'), `stages.${i}.focus`, s.focus, 'text', 'maxlength="500"')}</div><p class="muted">W${first + 1}–W${cursor} · ${e(C.dateAt(draft, first * 7) || '—')} → ${e(C.dateAt(draft, cursor * 7 - 1) || '—')}</p>${button('remove-phase', t('remove'), `data-index="${i}"`)}</article>`;
  }).join('')}</div>${button('add-phase', t('addPhase'))}<p class="muted">${e(t('direction'))}</p>` : ''}</section>
 <section class="editor-panel" id="schedule"><div class="section-top"><h2>${e(t('schedule'))}</h2><div class="week-nav">${button('previous', '←', `aria-label="${e(t('previous'))}" ${viewWeek <= 1 ? 'disabled' : ''}`)}<label class="week-select">${e(t('week'))} <select id="view-week" aria-label="${e(t('week'))}">${Array.from({
    length: Math.max(1, Math.min(count, 160))
  }, (_, i) => `<option value="${i + 1}" ${viewWeek === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select> / ${count}</label>${button('next', '→', `aria-label="${e(t('next'))}" ${viewWeek >= count ? 'disabled' : ''}`)}</div></div>${phase ? `<p class="phase-caption">${e(label('phase', phase.phase))} / ${e(label('role', phase.role))} · ${e(phase.focus || t('pending'))}</p>` : ''}<div class="schedule-layout"><aside class="template-library"><h3>${e(t('templates'))}</h3><p class="muted">${e(t('templateHint'))}</p>${C.TEMPLATES.map(template => `<button type="button" class="template ${selectedTemplate === template.id ? 'selected' : ''}" data-action="template" data-template="${template.id}" aria-pressed="${selectedTemplate === template.id}"><strong>${e(template.name[lang === 'zh' ? 1 : 0])}</strong><span>${e(template.hint[lang === 'zh' ? 1 : 0])}</span>${phase && C.PHASE_TEMPLATES[phase.phase].templates.includes(template.id) ? `<small>${e(label('phase', phase.phase))} · ${e(lang === 'zh' ? '结构提示' : 'structure hint')}</small>` : ''}</button>`).join('')}</aside><div class="day-list">${Array.from({
    length: 7
  }, (_, i) => renderDay((viewWeek - 1) * 7 + i)).join('')}</div></div><p class="muted">${e(t('limit'))}</p>${Object.keys(draft.days).some(s => Number(s) >= count * 7) ? `<div class="warning"><p>${e(t('outsideHint'))}</p>${Object.keys(draft.days).filter(s => Number(s) >= count * 7).map(s => `<p>${e(C.dateAt(draft, s))} ${e(draft.days[s].workout?.title || t('rest'))} ${button('edit-day', t('edit'), `data-slot="${s}"`)} ${button('clear-day', t('resetDay'), `data-slot="${s}"`)}</p>`).join('')}</div>` : ''}</section>
 <section class="editor-panel" id="analysis"><h2>${e(t('review'))}</h2><p class="muted">${e(t('analysisHint'))}</p><label class="reference-label">${e(t('reference'))}<input id="reference" type="number" min="0" max="1000" value="${e(draft.reference ?? 10)}"></label><div id="analysis-result"></div><details><summary>${e(t('ruleTitle'))}</summary><p>${e(t('ruleDistance'))}</p><p>${e(t('ruleGrowth'))}</p><p>${e(t('qualityHint'))}</p><p>${e(t('taper'))}</p><p class="muted">${e(lang === 'zh' ? 'G1 参考来源：' : 'G1 references:')} <a href="https://pubmed.ncbi.nlm.nih.gov/17940147/" target="_blank" rel="noopener">PMID 17940147</a>; <a href="https://pubmed.ncbi.nlm.nih.gov/34478518/" target="_blank" rel="noopener">PMID 34478518</a>.</p></details></section>
 <section class="editor-panel" id="export"><h2>${e(t('export'))}</h2><p>${e(t('importSteps'))}</p><div class="fields export-fields">${field(t('from'), 'fromWeek', draft.fromWeek, 'number', 'min="1" max="160"')}${field(t('to'), 'toWeek', draft.toWeek, 'number', 'min="1" max="160"')}</div>${button('preview', t('preview'), 'class="primary"')}<div id="export-result">${preview ? '' : `<p class="muted">${e(t('stale'))}</p>`}</div><p class="muted">${e(t('backupOnly'))}</p></section>`;
  renderAnalysis();
  if (preview) renderPreview();
}
function renderDay(slot) {
  const day = draft.days[slot] || {};
  const date = C.dateAt(draft, slot);
  const weekday = date ? new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    weekday: 'short',
    timeZone: 'UTC'
  }) : `D${slot % 7 + 1}`;
  return `<article class="day-card ${day.rest ? 'is-rest' : ''}" data-slot="${slot}" ${day.workout ? 'draggable="true"' : ''}><div class="day-date"><strong>${e(weekday)}</strong><time>${e(date || '—')}</time></div><div class="day-detail">${day.workout ? `<span class="small-label">${e(label('type', day.workout.type))}</span><h3>${e(day.workout.title)}</h3><p>${e(summaryWorkout(day.workout))}</p>` : day.rest ? `<h3>${e(t('rest'))}</h3>` : !day.event ? `<p class="pending">○ ${e(t('pending'))}</p>` : ''}${day.event ? `<p class="race-tag">${e(t('race'))}: ${e(day.event.name)} · ${e(label('race', day.event.distance))}</p>` : ''}${day.notes ? `<p class="muted">${e(day.notes)}</p>` : ''}</div><div class="day-actions">${day.workout || day.event ? button('edit-day', t('edit'), `data-slot="${slot}"`) : !day.rest ? button('add-workout', t('add'), `data-slot="${slot}"`) : ''}${!day.workout && !day.event && !day.rest ? button('rest', t('markRest'), `data-slot="${slot}"`) : ''}${day.workout ? button('transfer', `${t('copy')} / ${t('move')}`, `data-slot="${slot}"`) : ''}${day.rest || day.workout || day.event ? button('clear-day', t('resetDay'), `data-slot="${slot}"`) : ''}${draft.mode === 'race' && date === draft.race.date && !day.event && !day.rest ? button('race', t('addRace'), `data-slot="${slot}"`) : ''}${!day.workout && !day.rest && !day.event ? button('edit-day', t('race'), `data-slot="${slot}"`) : ''}</div></article>`;
}
function renderAnalysis() {
  const input = document.querySelector('#reference');
  const reference = Number(input?.value || 10);
  const data = C.analyze(draft, reference);
  const range = x => `${fmt(x[0])}${Math.abs(x[1] - x[0]) > .00001 ? '–' + fmt(x[1]) : ''}`;
  document.querySelector('#analysis-result').innerHTML = `<div class="analysis-weeks">${data.weeks.map(w => `<article class="analysis-card"><div class="small-label">W${w.index} · ${e(w.start || '—')} ${w.phase ? ' / ' + e(label('phase', w.phase)) : ''}</div><div class="analysis-number">${range(w.distance)} <small>km</small></div><p>${e(t('known'))}${w.distanceDerived ? ' · ' + e(t('derived')) : ''}</p><dl><div><dt>${e(t('duration'))}</dt><dd>${range(w.duration)} min${w.durationUnknown ? ' + ?' : ''}</dd></div><div><dt>${e(t('unknown'))} (km / min)</dt><dd>${w.distanceUnknown} / ${w.durationUnknown}</dd></div><div><dt>${e(t('pendingDays'))}</dt><dd>${w.pendingDays}</dd></div><div><dt>${e(t('quality'))}</dt><dd>${w.qualityCount}</dd></div><div><dt>${e(t('recoveryLoad'))}</dt><dd>${fmt(w.recoveryKm)} km</dd></div><div><dt>${e(t('raceLoad'))}</dt><dd>${fmt(w.raceKm)} km${w.raceUnknown ? ' + ?' : ''}</dd></div><div><dt>${e(t('growth'))}</dt><dd>${w.change === null ? e(t('incomparable')) : `${fmt(w.change)}%${w.overReference ? ' · ' + e(t('over')) : ''}`}</dd></div></dl></article>`).join('')}</div><details><summary>${e(t('gaps'))}</summary><p>${e(t('gapHint'))}</p>${data.qualityGaps.map(g => `<p>${e(g.from)} → ${e(g.to)}: ${g.days} ${e(lang === 'zh' ? '天' : 'days')}</p>`).join('') || `<p>—</p>`}</details>`;
}
function renderPreview() {
  const out = document.querySelector('#export-result');
  if (!preview) return;
  out.innerHTML = `<div class="${preview.valid ? 'snapshot-note' : 'warning'}"><p>${e(t(preview.valid ? 'ready' : 'blocked'))}</p>${preview.valid ? `<p>${e(preview.plan.start_date)} → ${e(preview.plan.end_date)} · ${preview.plan.days.length} ${e(lang === 'zh' ? '个已确认日期' : 'confirmed days')}${preview.route ? ` · ${preview.route.program.weeks.length} ${e(t('weeks'))} / r${preview.route.program.revision}` : ''}</p>` : `<ul class="issue-list">${preview.issues.slice(0, 250).map(issue => `<li>${button('issue', `${issue.code}: ${(ERRORS[issue.code] || ERRORS.schema)[lang === 'zh' ? 1 : 0]} · ${issue.path}`, `data-path="${e(issue.path)}"`)}</li>`).join('')}</ul>`}</div>${preview.valid ? `<div class="toolbar">${button('copy-json', t('copyJSON'), 'class="primary"')}${button('download-json', t('download'))}</div><label>App JSON · schema 2.0<textarea id="json-output" readonly spellcheck="false">${e(JSON.stringify(preview.plan, null, 2))}</textarea></label>` : ''}`;
}
function segmentForm(s, path, stage = false) {
  return `<div class="segment-card"><div class="fields">${stage ? '' : select(t('segment'), `${path}.kind`, ['work', 'recovery'], s.kind === 'rest' ? 'recovery' : 'work')}${select(t('metric'), `${path}.metric`, ['distance', 'duration'], s.metric === 'time' ? 'duration' : 'distance')}${field(t('amount'), `${path}.value`, s.value, 'text', 'inputmode="decimal"')}${select(t('unit'), `${path}.unit`, s.metric === 'time' ? ['min', 's', 'h'] : ['km', 'm', 'mi'], s.unit)}</div><div class="fields pace-fields">${field(t('paceFast'), `${path}.paceMin`, s.paceMin, 'text', 'placeholder="5:30"')}${field(t('paceSlow'), `${path}.paceMax`, s.paceMax, 'text', 'placeholder="6:00"')}${select(t('paceUnit'), `${path}.paceUnit`, ['km', 'mi'], s.paceUnit)}${field(t('rpe'), `${path}.rpe`, s.rpe, 'text', 'inputmode="numeric"')}${field(t('zone'), `${path}.hrZone`, s.hrZone)}</div>${stage ? button('remove-stage', t('remove'), `data-path="${path}"`) : button('remove-segment', t('remove'), `data-path="${path}"`)}</div>`;
}
function openDay(slot, add = false) {
  const day = C.clone(draft.days[slot] || {});
  if (add) {
    if (day.workout || day.rest) {
      notice(t('conflict'));
      return;
    }
    day.workout = C.workoutFromTemplate(selectedTemplate, lang);
  }
  editing = {
    slot,
    day
  };
  renderDialog();
  dialog.showModal();
}
function renderDialog() {
  const {
      slot,
      day
    } = editing,
    w = day.workout;
  dialog.querySelector('.dialog-body').innerHTML = `<h2>${e(C.dateAt(draft, slot) || t('pending'))}</h2><p class="muted">${e(t('limit'))}</p><div id="day-form">${w ? `${field(t('workoutTitle'), 'workout.title', w.title, 'text', 'maxlength="120"')}<div class="fields">${select(t('type'), 'workout.type', C.TYPES, w.type, 'type')}${select(t('environment'), 'workout.environment', ['unspecified', 'outdoor', 'indoor'], w.environment || 'unspecified')}${field(t('startTime'), 'workout.startTime', w.startTime, 'time')}</div>${area(t('description'), 'workout.description', w.description, 'maxlength="1000"')}<h3>${e(t('warmup'))}</h3>${w.warmup ? segmentForm(w.warmup, 'workout.warmup', true) : button('warmup', t('addWarmup'))}${w.blocks.map((b, i) => `<section class="block-card"><h3>${e(t('block'))} ${i + 1}</h3><div class="fields">${field(t('repeat'), `workout.blocks.${i}.repeat`, b.repeat, 'text', 'inputmode="numeric"')}${field(t('label'), `workout.blocks.${i}.label`, b.label, 'text', 'maxlength="80"')}</div>${b.segments.map((s, j) => segmentForm(s, `workout.blocks.${i}.segments.${j}`)).join('')}<div class="toolbar">${button('add-work', t('addWork'), `data-block="${i}"`)}${button('add-recovery', t('addRecovery'), `data-block="${i}"`)}${button('remove-block', t('remove'), `data-block="${i}"`)}</div></section>`).join('')}${button('add-block', t('addBlock'))}<h3>${e(t('cooldown'))}</h3>${w.cooldown ? segmentForm(w.cooldown, 'workout.cooldown', true) : button('cooldown', t('addCooldown'))}<p class="muted">${e(t('segmentHint'))}</p><p class="workout-summary">${e(summaryWorkout(w))}</p>` : button('dialog-workout', t('add'))}<label class="checkbox"><input type="checkbox" id="event-enabled" ${day.event ? 'checked' : ''}> ${e(t('enableEvent'))}</label>${day.event ? `<div class="fields">${field(t('eventName'), 'event.name', day.event.name, 'text', 'maxlength="120"')}${select(t('eventDistance'), 'event.distance', C.RACES, day.event.distance, 'race')}${field(t('eventTime'), 'event.goalTimeSec', day.event.goalTimeSec, 'text', 'inputmode="numeric"')}</div>` : ''}${area(t('dayNotes'), 'notes', day.notes || '', 'maxlength="1000"')}</div><div id="day-issues" class="warning" hidden></div><div class="toolbar dialog-actions">${button('save-day', t('save'), 'class="primary"')}${button('cancel-day', t('cancel'))}</div>`;
}
function setAt(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys.slice(0, -1)) current = current[key];
  current[keys.at(-1)] = value;
}
function getAt(obj, path) {
  return path.split('.').reduce((v, k) => v?.[k], obj);
}
root.addEventListener('input', ev => {
  const el = ev.target;
  if (!el.name || !['text', 'textarea'].includes(el.type)) return;
  if (textEdit !== el.name) {
    history.push(C.clone(draft));
    if (history.length > 30) history.shift();
    textEdit = el.name;
  }
  setAt(draft, el.name, el.value);
  invalidate();
  save();
  root.querySelector('[data-action="undo"]')?.removeAttribute('disabled');
});
root.addEventListener('change', ev => {
  const el = ev.target;
  if (el.id === 'view-week') {
    viewWeek = Number(el.value);
    render();
    return;
  }
  if (el.id === 'reference') {
    const value = Number(el.value);
    if (el.value && Number.isFinite(value) && value >= 0 && value <= 1000) mutate(d => d.reference = value);
    return;
  }
  if (el.id === 'restore-file') {
    const file = el.files[0];
    if (!file) return;
    if (file.size > 1500000) {
      notice(t('badBackup'));
      return;
    }
    file.text().then(raw => {
      const next = C.safeRestore(raw);
      if (!next) {
        notice(t('badBackup'));
        return;
      }
      ask(`<p>${e(t('restoreHint'))}</p><p>${e(next.title || t('pending'))} · ${e(next.startDate || '—')} · ${C.horizon(next)} ${e(t('weeks'))}</p>${affected(next)}`, () => {
        mutate(d => Object.assign(d, next));
        notice(t('invalid'));
      });
    });
    return;
  }
  if (!el.name) return;
  const path = el.name;
  let value = el.value;
  if (path === 'mode') value = value === 'long' ? 'race' : 'week';
  if (['fromWeek', 'toWeek'].includes(path)) value = Number(value);
  if (['startDate', 'weekStart', 'mode', 'race.date'].includes(path) || /^stages\.\d+\.(weeks|phase|role)$/.test(path)) {
    requestStructural(next => {
      setAt(next, path, value);
      if (path === 'mode' && value === 'race' && !next.stages.length) next.stages = [{
        phase: 'base',
        role: 'establish',
        weeks: 1,
        focus: ''
      }];
    });
    el.value = path === 'mode' ? draft.mode === 'race' ? 'long' : 'single' : getAt(draft, path);
    return;
  }
  if (textEdit === path) {
    textEdit = null;
    save();
  } else {
    history.push(C.clone(draft));
    if (history.length > 30) history.shift();
    setAt(draft, path, value);
    invalidate();
    save();
    root.querySelector('[data-action="undo"]')?.removeAttribute('disabled');
  }
});
root.addEventListener('click', ev => {
  const b = ev.target.closest('[data-action]');
  if (!b) return;
  const a = b.dataset.action,
    slot = Number(b.dataset.slot);
  if (a === 'template') {
    selectedTemplate = b.dataset.template;
    render();
  }
  if (a === 'previous' || a === 'next') {
    viewWeek += a === 'next' ? 1 : -1;
    render();
  }
  if (a === 'undo') undo();
  if (a === 'backup') downloadJSON(draft, 'pacermind-draft-v1.json');
  if (a === 'raw-backup') downloadJSON(storedRaw, 'pacermind-unreadable-storage.json');
  if (a === 'fresh') ask(`<p>${e(t('clearHint'))}</p>`, () => {
    pauseSave = false;
    storedRaw = '';
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    lastToken = '';
    mutate(d => Object.assign(d, C.newDraft()));
  });
  if (a === 'clear') ask(`<p>${e(t('clearHint'))}</p>${button('backup', t('backup'))}`, () => mutate(d => Object.assign(d, C.newDraft())));
  if (a === 'rest') mutate(d => C.markRest(d, slot));
  if (a === 'clear-day') ask(`<p>${e(C.dateAt(draft, slot))}: ${e(t('resetDay'))}</p>`, () => mutate(d => delete d.days[slot]));
  if (a === 'add-workout') openDay(slot, true);
  if (a === 'edit-day') openDay(slot);
  if (a === 'race') mutate(d => {
    d.days[slot] = {
      ...d.days[slot],
      event: {
        name: d.race.name,
        distance: d.race.distance,
        goalTimeSec: d.race.goalTimeSec
      }
    };
  });
  if (a === 'add-phase') requestStructural(d => d.stages.push({
    phase: 'base',
    role: 'establish',
    weeks: 1,
    focus: ''
  }));
  if (a === 'remove-phase') requestStructural(d => d.stages.splice(Number(b.dataset.index), 1));
  if (a === 'transfer') {
    ask(`<h3>${e(t('destination'))}</h3><label>${e(t('week'))} / ${e(t('destination'))}<select id="destination">${Array.from({
      length: Math.min(C.horizon(draft) * 7, 1120)
    }, (_, i) => `<option value="${i}">${e(C.dateAt(draft, i) || `D${i + 1}`)}${draft.days[i]?.workout || draft.days[i]?.rest ? ' · ' + e(t('conflict')) : ''}</option>`).join('')}</select></label><label class="checkbox"><input type="checkbox" id="copy-workout" checked> ${e(t('copy'))} (${e(t('move'))}: ${e(lang === 'zh' ? '取消勾选' : 'uncheck')})</label>`, () => {
      const target = Number(confirmDialog.querySelector('#destination').value),
        copy = confirmDialog.querySelector('#copy-workout').checked;
      if (target === slot || draft.days[target]?.workout || draft.days[target]?.rest) {
        notice(t('conflict'));
        return;
      }
      mutate(d => C.transferWorkout(d, slot, target, copy));
    });
  }
  if (a === 'preview') {
    preview = C.buildPlan(draft, schema);
    renderPreview();
    document.querySelector('#export-result').scrollIntoView({
      block: 'nearest'
    });
  }
  if (a === 'issue') focusIssue(b.dataset.path);
  if (a === 'copy-json' && preview?.valid) {
    const exported = preview;
    const text = JSON.stringify(exported.plan, null, 2);
    const finish = () => {
      if (!exported.route || exported.route.program.id === draft.program.id) C.commitExport(draft, exported);
      save();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => {
      finish();
      notice(t('copied'));
    }).catch(() => {
      document.querySelector('#json-output').select();
      finish();
      notice(t('clipboard'));
    });else {
      document.querySelector('#json-output').select();
      finish();
      notice(t('clipboard'));
    }
  }
  if (a === 'download-json' && preview?.valid) {
    downloadJSON(preview.plan, 'pacermind-plan-v2.json');
    C.commitExport(draft, preview);
    save();
  }
  if (a === 'load-other' && foreign) {
    const next = C.safeRestore(JSON.stringify(foreign.draft));
    if (!next) {
      notice(t('badBackup'));
      return;
    }
    ask(`<p>${e(t('restoreHint'))}</p>${affected(next)}`, () => {
      lastToken = foreign.token;
      pauseSave = false;
      foreign = null;
      mutate(d => Object.assign(d, next));
    });
  }
  if (a === 'keep-this' && foreign) ask(`<p>${e(t('tabs'))} ${e(t('keepThis'))}</p>`, () => {
    lastToken = foreign.token;
    pauseSave = false;
    foreign = null;
    save();
    render();
  });
});
confirmDialog.addEventListener('click', ev => {
  const a = ev.target.closest('[data-action]')?.dataset.action;
  if (a === 'backup') downloadJSON(draft, 'pacermind-draft-v1.json');
  if (a === 'cancel-confirm') {
    confirmDialog.close();
    changeAction = null;
  }
  if (a === 'confirm') {
    const fn = changeAction;
    changeAction = null;
    if (fn) fn();
    confirmDialog.close();
  }
});
dialog.addEventListener('input', ev => {
  const el = ev.target;
  if (el.name && editing) setAt(editing.day, el.name, el.value);
});
dialog.addEventListener('change', ev => {
  const el = ev.target;
  if (!editing) return;
  if (el.id === 'event-enabled') {
    if (el.checked) {
      delete editing.day.rest;
      editing.day.event = {
        name: '',
        distance: 'custom',
        goalTimeSec: ''
      };
    } else delete editing.day.event;
    renderDialog();
    return;
  }
  if (!el.name) return;
  let value = el.value;
  if (el.name.endsWith('.kind')) value = value === 'recovery' ? 'rest' : 'work';
  if (el.name.endsWith('.metric')) value = value === 'duration' ? 'time' : 'distance';
  if (el.name === 'workout.environment' && value === 'unspecified') value = '';
  setAt(editing.day, el.name, value);
  if (el.name.endsWith('.metric')) {
    const s = getAt(editing.day, el.name.replace(/\.metric$/, ''));
    s.unit = s.metric === 'time' ? 'min' : 'km';
    renderDialog();
  }
});
dialog.addEventListener('click', ev => {
  const b = ev.target.closest('[data-action]');
  if (!b || !editing) return;
  const a = b.dataset.action,
    w = editing.day.workout;
  if (a === 'cancel-day') {
    dialog.close();
    editing = null;
    return;
  }
  if (a === 'save-day') {
    const day = C.clone(editing.day);
    const issues = [];
    if (day.workout) C.convertWorkout(day.workout, 'workout', issues);
    const message = issues.length ? `${issues.length} ${t('pending')}` : '';
    const slot = editing.slot;
    mutate(d => d.days[slot] = day);
    dialog.close();
    editing = null;
    if (message) notice(message);
    return;
  }
  if (a === 'dialog-workout') {
    delete editing.day.rest;
    editing.day.workout = C.workoutFromTemplate(selectedTemplate, lang);
  }
  if (a === 'warmup' || a === 'cooldown') w[a] = C.segmentDraft('time');
  if (a === 'remove-stage') setAt(editing.day, b.dataset.path, null);
  if (a === 'add-block') w.blocks.push({
    repeat: '1',
    label: '',
    segments: [C.segmentDraft()]
  });
  if (a === 'remove-block') w.blocks.splice(Number(b.dataset.block), 1);
  if (a === 'add-work' || a === 'add-recovery') w.blocks[Number(b.dataset.block)].segments.push(C.segmentDraft(a === 'add-work' ? 'distance' : 'time', a === 'add-work' ? 'work' : 'rest'));
  if (a === 'remove-segment') {
    const keys = b.dataset.path.split('.');
    const index = Number(keys.pop());
    getAt(editing.day, keys.join('.')).splice(index, 1);
  }
  renderDialog();
});
function focusIssue(path) {
  const match = path.match(/\d{4}-\d{2}-\d{2}/),
    jsonDay = path.match(/^\$\.days\[(\d+)\]/);
  let slot = null,
    subpath = '';
  if (match && C.validDate(draft.startDate)) {
    slot = C.dayDiff(draft.startDate, match[0]);
    subpath = path.slice(path.indexOf(match[0]) + 10).replace(/^\./, '');
    if (subpath && !subpath.startsWith('workout') && !subpath.startsWith('event')) subpath = 'workout.' + subpath;
  }
  if (jsonDay && preview?.plan.days[Number(jsonDay[1])]) {
    slot = C.dayDiff(draft.startDate, preview.plan.days[Number(jsonDay[1])].date);
    subpath = path.slice(jsonDay[0].length).split(':')[0].replace(/^\./, '').replace(/start_time/g, 'startTime');
  }
  if (slot !== null && slot >= 0) {
    viewWeek = Math.floor(slot / 7) + 1;
    render();
    openDay(slot);
    const name = subpath.replace(/\[(\d+)\]/g, '.$1');
    const input = [...dialog.querySelectorAll('[name]')].find(el => el.name === name) || dialog.querySelector('[name]');
    input?.focus();
    input?.scrollIntoView({
      block: 'center'
    });
    return;
  }
  const stage = path.match(/^stages\[(\d+)\]/);
  const name = stage ? `stages.${stage[1]}.focus` : path === 'fromWeek/toWeek' ? 'fromWeek' : path === 'race' ? 'race.name' : path;
  const el = root.querySelector(`[name="${name.replace(/[^a-zA-Z0-9.]/g, '')}"]`);
  if (el) {
    el.focus();
    el.scrollIntoView({
      block: 'center'
    });
  } else document.querySelector('#setup').scrollIntoView();
}
let dragged = null;
root.addEventListener('dragstart', ev => {
  const card = ev.target.closest('.day-card');
  if (!card || !draft.days[card.dataset.slot]?.workout) return;
  dragged = Number(card.dataset.slot);
  ev.dataTransfer.setData('text/plain', String(dragged));
  ev.dataTransfer.effectAllowed = 'move';
});
root.addEventListener('dragover', ev => {
  if (ev.target.closest('.day-card')) ev.preventDefault();
});
root.addEventListener('drop', ev => {
  ev.preventDefault();
  const target = ev.target.closest('.day-card');
  if (dragged === null || !target) return;
  const source = dragged,
    slot = Number(target.dataset.slot);
  dragged = null;
  if (source === slot || draft.days[slot]?.workout || draft.days[slot]?.rest) {
    notice(t('conflict'));
    return;
  }
  ask(`<p>${e(t('move'))}: ${e(C.dateAt(draft, source))} → ${e(C.dateAt(draft, slot))}</p>`, () => mutate(d => C.transferWorkout(d, source, slot)));
});
window.addEventListener('storage', ev => {
  if (ev.key !== storageKey) return;
  const item = ev.newValue ? parseStored(ev.newValue) : null;
  if (item && item.writer !== writer) {
    foreign = item;
    pauseSave = true;
    render();
  } else if (!ev.newValue) {
    pauseSave = true;
    foreign = {
      token: '',
      draft: C.newDraft()
    };
    render();
  }
});
document.addEventListener('pm:language', () => {
  render();
  if (dialog.open && editing) renderDialog();
});
render();
fetch('assets/data/schema/plan-v2.json').then(r => {
  if (!r.ok) throw Error('schema');
  return r.json();
}).then(value => {
  schema = value;
}).catch(() => notice(t('unavailable')));
