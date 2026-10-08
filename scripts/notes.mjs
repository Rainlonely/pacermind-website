/* Uses the already-published summary only. Unpublished writing never belongs here. */
const root = document.querySelector('#notes');
let active = 'running',
  runs = [],
  entries = [],
  failed = false;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const zh = () => document.documentElement.lang.startsWith('zh');
const t = (en, cn) => zh() ? cn : en;
function render() {
  root.innerHTML = `<div class="notes-heading"><span class="eyebrow">PACERMIND / FIELD NOTES</span><h1>${t('A run. A thought.<br>A work in progress.', '一段路，一点念头。<br>慢慢做，慢慢跑。')}</h1><p>${t('Running notes already shared by Rain. Development notes will appear after publication.', 'Rain 已公开的跑步笔记。开发笔记将在正式发布后收录。')}</p></div><div class="notes-tabs" aria-label="${t('Note categories', '笔记分类')}"><button data-tab="running" aria-pressed="${active === 'running'}">${t('Running notes', '跑步笔记')}</button><button data-tab="development" aria-pressed="${active === 'development'}">${t('Development notes', '开发笔记')}</button></div><p class="muted">${t('Original notes keep the language and wording in which they were written.', '跑步笔记保留书写时的原文与语言。')}</p>${failed ? `<p role="alert">${t('Published notes could not be loaded. Try reloading.', '公开笔记加载失败，请刷新重试。')}</p>` : active === 'running' ? runs.filter(r => r.note?.trim()).map(r => `<article class="note-entry" id="run-${esc(r.id)}"><span class="small-label">${esc(r.date)} · ${esc(r.distanceKm)} km · ${esc(r.duration)} · ${t('Published / original', '已公开 / 原文')}</span><h2>${esc(r.title)}</h2><details><summary>${esc(r.note.trim().split('\n')[0])}</summary><p class="note-original" lang="zh-Hans">${esc(r.note)}</p></details></article>`).join('') || `<p class="notes-empty">${t('Loading published running notes…', '正在加载已公开跑步笔记…')}</p>` : entries.length ? entries.map(n => `<article class="note-entry"><span class="small-label">${esc(n.date)} · ${esc(n.language)}</span><h2><a href="${esc(n.href)}">${esc(n.title)}</a></h2><p>${esc(n.summary)}</p></article>`).join('') : `<div class="notes-empty"><h2>${t('Still in the making.', '还在慢慢打磨。')}</h2><p>${t('Development notes will appear here when published.', '开发笔记还在整理，发布后会出现在这里。')}</p></div>`}`;
}
root.addEventListener('click', ev => {
  const button = ev.target.closest('[data-tab]');
  if (button) {
    active = button.dataset.tab;
    render();
  }
});
document.addEventListener('pm:language', render);
render();
fetch('assets/data/notes-index.json').then(r => {
  if (!r.ok) throw Error('index');
  return r.json();
}).then(async index => {
  entries = index.development.filter(x => x.status === 'published' && typeof x.href === 'string' && /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(?:#[a-zA-Z0-9_-]+)?$/.test(x.href));
  if (index.running.source !== 'assets/data/journey-summary.json') throw Error('source');
  const response = await fetch(index.running.source);
  if (!response.ok) throw Error('summary');
  const data = await response.json();
  runs = data.runs.slice(0, 10);
  render();
}).catch(() => {
  failed = true;
  render();
});
