/* A calendar drives route memories. Original writing stays pinned until a click. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PMJourneyCalendar = api;
})(typeof window === 'undefined' ? globalThis : window, () => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function monthCells(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw Error('Invalid calendar month');
    const [year, number] = month.split('-').map(Number);
    const offset = (new Date(Date.UTC(year, number - 1, 1)).getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
    return Array.from({ length: Math.max(35, Math.ceil((offset + count) / 7) * 7) }, (_, i) =>
      i >= offset && i < offset + count ? `${month}-${String(i - offset + 1).padStart(2, '0')}` : null);
  }
  function groupDays(runs) {
    const result = new Map();
    for (const run of runs) if (validDate(run.date)) {
      if (!result.has(run.date)) result.set(run.date, []);
      result.get(run.date).push(run);
    }
    return result;
  }
  function coordinates(run) {
    return (run.coordinates || []).filter(p => Array.isArray(p) && p.length >= 2
      && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 85 && Math.abs(p[1]) <= 180);
  }
  function projectRoutes(runs, width, height) {
    const mercator = ([lat, lon]) => [lon * Math.PI / 180,
      -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
    const paths = runs.map(run => coordinates(run).map(mercator)).filter(path => path.length > 1);
    if (!paths.length) return [];
    const points = paths.flat();
    const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
    const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
    const scale = Math.min((width - 80) / Math.max(maxX - minX, 1e-6),
      (height - 100) / Math.max(maxY - minY, 1e-6));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    return paths.map(path => path.map(([x, y]) => [
      width / 2 + (x - cx) * scale, height / 2 + 15 + (y - cy) * scale,
    ]));
  }
  function mount({ loadJson, createMap, language }) {
    const section = document.querySelector('#journey');
    const panel = section?.querySelector('.journey-map-panel');
    const host = section?.querySelector('[data-journey-calendar]');
    if (!panel || !host) return null;
    const journal = section.querySelector('[data-run-list]');
    const storyPanel = section.querySelector('.journal-panel');
    const selection = section.querySelector('[data-journal-selection]');
    const mapNode = panel.querySelector('#journey-map');
    const bubble = panel.querySelector('[data-memory-bubble]');
    const svg = panel.querySelector('[data-memory-route]');
    const mapButton = panel.querySelector('[data-explore-map]');
    const mapStatus = panel.querySelector('.journey-map-status');
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const state = { index: null, months: new Map(), month: '', days: new Map(),
      selected: '', preview: '', playing: false, loading: false, visible: false, ready: false };
    let loadVersion = 0, mapVersion = 0, map = null, mapPromise = null;
    let playTimer = 0, hoverTimer = 0, drawFrame = 0, animations = [], autoStarted = false;
    const t = (en, cn) => language() === 'zh' ? cn : en;
    mapButton.textContent = t('Show street map ↗', '查看街道地图 ↗');
    const locale = () => language() === 'zh' ? 'zh-CN' : 'en-US';
    const dayText = value => new Intl.DateTimeFormat(locale(), {
      month: 'long', day: 'numeric', timeZone: 'UTC',
    }).format(new Date(value + 'T12:00:00Z'));
    const monthText = value => new Intl.DateTimeFormat(locale(), {
      year: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(value + '-01T12:00:00Z'));
    const distance = runs => runs.reduce((sum, run) => sum + Number(run.distanceKm || 0), 0).toFixed(1);
    const currentDay = () => state.preview || state.selected;

    function cancelDrawing() {
      cancelAnimationFrame(drawFrame);
      animations.forEach(animation => animation.cancel());
      animations = [];
    }
    function stop() {
      clearTimeout(playTimer);
      state.playing = false;
      updatePlayButton();
    }
    function updatePlayButton() {
      const button = host.querySelector('[data-memory-play]');
      if (!button) return;
      button.textContent = state.playing ? t('Pause memories', '暂停回忆') : t('Play memories', '播放回忆');
      button.setAttribute('aria-pressed', String(state.playing));
    }
    function renderCalendar() {
      if (!state.index) return;
      const months = state.index.months, position = months.findIndex(m => m.month === state.month);
      const week = language() === 'zh' ? ['一', '二', '三', '四', '五', '六', '日']
        : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      host.innerHTML = `<div class="memory-calendar-heading"><div><span class="eyebrow">${t('A month of running', '把日子，跑成回忆')}</span><h3>${esc(monthText(state.month))}</h3></div><div class="memory-month-nav"><button type="button" data-month-step="1" aria-label="${t('Previous month', '上个月')}" ${position === months.length - 1 ? 'disabled' : ''}>←</button><button type="button" data-month-step="-1" aria-label="${t('Next month', '下个月')}" ${position === 0 ? 'disabled' : ''}>→</button></div></div><div class="memory-weekdays" aria-hidden="true">${week.map(w => `<span>${w}</span>`).join('')}</div><div class="memory-days" role="group" aria-label="${esc(monthText(state.month))}">${monthCells(state.month).map(date => {
        if (!date) return '<span class="memory-empty" aria-hidden="true"></span>';
        const runs = state.days.get(date), day = Number(date.slice(8));
        const label = runs ? `${dayText(date)}, ${runs.length} ${t('running records', '条跑步记录')}, ${distance(runs)} km` : `${dayText(date)}, ${t('no running record', '没有跑步记录')}`;
        return `<button type="button" data-memory-day="${date}" aria-label="${esc(label)}" aria-pressed="${date === state.selected}" ${runs ? '' : 'disabled'}><span>${day}</span>${runs ? '<span class="memory-day-dot" aria-hidden="true"></span>' : ''}</button>`;
      }).join('')}</div><div class="memory-calendar-footer"><p>${t('Hover to preview. Select a day to read.', '悬停预览路线，点击日期阅读原文。')}</p><button type="button" data-memory-play aria-pressed="false"></button></div>`;
      host.setAttribute('aria-busy', 'false');
      host.querySelector('[data-memory-play]').disabled = state.days.size === 0;
      updatePlayButton();
      highlight();
    }
    function highlight() {
      host.querySelectorAll('[data-memory-day]').forEach(button => {
        button.classList.toggle('is-previewing', button.dataset.memoryDay === currentDay());
        button.setAttribute('aria-pressed', String(button.dataset.memoryDay === state.selected));
      });
    }
    function renderStory() {
      const runs = state.days.get(state.selected) || [];
      selection.innerHTML = `<h3>${esc(dayText(state.selected))}</h3><span>${runs.length} ${t('running records', '条跑步记录')} · ${distance(runs)} km</span>`;
      const label = section.querySelector('[data-i18n="journey.recent"]');
      if (label) label.textContent = t('THE DAY, IN YOUR WORDS', '当天的跑步日记');
      journal.innerHTML = runs.map(run => `<article class="run-item memory-story" id="memory-${esc(run.id)}"><div><h3>${esc(run.title || t('Run', '跑步'))}</h3><div class="run-meta"><span>${esc(run.duration)}</span><span>${esc(run.avgPace)} /km</span></div></div><strong class="run-distance">${Number(run.distanceKm || 0).toFixed(1)} <small>km</small></strong><p class="memory-original">${esc(run.note?.trim() || t('No note for this run.', '这次跑步没有留下笔记。'))}</p></article>`).join('');
      section.querySelector('[data-more-runs]').hidden = true;
    }
    function positionBubble(paths) {
      const runs = state.days.get(currentDay()) || [], route = runs.find(run => coordinates(run).length > 1);
      let point;
      if (map && route) {
        const points = coordinates(route), anchor = points[Math.floor(points.length * .58)];
        point = map.project([anchor[1], anchor[0]]);
      } else if (paths?.[0]?.length) {
        const p = paths[0][Math.floor(paths[0].length * .58)];
        point = { x: p[0], y: p[1] };
      }
      if (!point) return;
      bubble.style.left = `${Math.max(12, Math.min(panel.clientWidth - bubble.offsetWidth - 12, point.x + 14))}px`;
      bubble.style.top = `${Math.max(58, Math.min(panel.clientHeight - bubble.offsetHeight - 28, point.y - bubble.offsetHeight - 18))}px`;
    }
    function draw(animate = false) {
      cancelDrawing();
      const runs = state.days.get(currentDay()) || [];
      const width = panel.clientWidth || 500, height = panel.clientHeight || 340;
      const paths = projectRoutes(runs, width, height);
      const moving = animate && !media.matches && state.visible && !document.hidden;
      const chosen = runs.find(run => run.note?.trim()) || runs[0];
      if (!chosen) return;
      panel.classList.add('has-memory-route');
      bubble.hidden = false;
      const note = String(chosen.note?.trim() || t('A run worth remembering.', '每一步，都值得留下。'));
      const limit = /[\u3400-\u9fff]/.test(note) ? 52 : 100;
      bubble.innerHTML = `<span>${esc(dayText(currentDay()))} · ${distance(runs)} km</span><p>${esc(note.length > limit ? note.slice(0, limit) + '…' : note)}</p><button type="button" data-read-memory>${t('Read this day', '阅读当天日记')} ↓</button>`;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('aria-label', `${dayText(currentDay())} · ${t('recorded running route', '真实跑步路线')}`);
      const pieces = [];
      const lines = paths.map(path => {
        const points = path.map(p => p.map(n => n.toFixed(2)).join(',')).join(' ');
        const stride = Math.max(1, Math.ceil((path.length - 1) / 24));
        for (let i = 0; i < path.length - 1; i += stride) {
          pieces.push(path.slice(i, Math.min(path.length, i + stride + 1)));
        }
        return `<polyline class="memory-route-base" points="${points}"/>`;
      }).join('');
      svg.innerHTML = lines + pieces.map(piece => `<polyline class="memory-route-trace" points="${piece.map(p => p.map(n => n.toFixed(2)).join(',')).join(' ')}"/>`).join('');
      if (moving) {
        const traces = svg.querySelectorAll('.memory-route-trace');
        traces.forEach((trace, i) => animations.push(trace.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 140, delay: i / Math.max(1, traces.length) * 1800, fill: 'both', easing: 'linear',
        })));
      }
      positionBubble(paths);
      if (map) {
        const features = runs.filter(run => coordinates(run).length > 1).map(run => ({
          type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coordinates(run).map(([lat, lon]) => [lon, lat]) },
        }));
        const points = features.flatMap(f => f.geometry.coordinates);
        if (points.length) map.fitBounds([
          [Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1]))],
          [Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1]))],
        ], { padding: { top: 70, bottom: 42, left: 44, right: 44 }, maxZoom: 15, duration: 0 });
        const complete = { type: 'FeatureCollection', features };
        if (!moving) map.getSource('memory-active').setData(complete);
        else {
          let previousCount = -1, started;
          const frame = now => {
            started ??= now;
            const fraction = Math.min(1, (now - started) / 1800), count = Math.floor(fraction * 140);
            if (count !== previousCount) {
              map.getSource('memory-active').setData({ type: 'FeatureCollection', features: features.map(f => ({
                ...f, geometry: { ...f.geometry, coordinates: f.geometry.coordinates.slice(0, Math.max(2, Math.ceil(fraction * f.geometry.coordinates.length))) },
              })) });
              previousCount = count;
            }
            if (fraction < 1) drawFrame = requestAnimationFrame(frame);
          };
          drawFrame = requestAnimationFrame(frame);
        }
        positionBubble();
      }
      highlight();
    }
    function choose(date, { preview = false, animate = false, scroll = false } = {}) {
      if (!state.days.has(date)) return;
      if (preview) state.preview = date;
      else {
        state.selected = date;
        state.preview = '';
        renderStory();
        section.querySelector('[data-memory-announcement]').textContent = `${dayText(date)} · ${t('Journal selected', '已显示当天日记')}`;
      }
      draw(animate);
      if (scroll) storyPanel.scrollIntoView({ behavior: animate && !media.matches ? 'smooth' : 'auto', block: 'start' });
    }
    function play(limit) {
      stop();
      const days = [...state.days.keys()].sort();
      const sequence = limit ? days.slice(-limit) : days;
      if (!sequence.length) return;
      state.playing = true;
      updatePlayButton();
      let index = 0;
      const next = () => {
        if (!state.playing || !state.visible || document.hidden) { stop(); return; }
        if (index === sequence.length) {
          stop(); state.preview = ''; draw(); return;
        }
        choose(sequence[index++], { preview: true, animate: true });
        playTimer = setTimeout(next, 5200);
      };
      next();
    }
    function maybeAutoplay() {
      if (!autoStarted && state.ready && state.visible && !media.matches && !navigator.connection?.saveData) {
        autoStarted = true;
        play(3);
        if (location.hostname === 'pacermind.xyz') openMap();
      }
    }
    async function loadMonth(month) {
      const version = ++loadVersion;
      stop();
      host.setAttribute('aria-busy', 'true');
      try {
        const item = state.index.months.find(m => m.month === month);
        if (!item || !/^assets\/data\/journal\/\d{4}-(0[1-9]|1[0-2])\.json(?:\?v=[a-f0-9]+)?$/.test(item.url)) throw Error('Month unavailable');
        let data = state.months.get(month);
        if (!data) { data = await loadJson(item.url); state.months.set(month, data); }
        if (version !== loadVersion) return;
        if (data.version !== 1 || data.month !== month || !Array.isArray(data.runs)) throw Error('Invalid journal');
        state.month = month;
        state.days = groupDays(data.runs.filter(run => validDate(run.date) && run.date.startsWith(month + '-')));
        state.selected = [...state.days.keys()].sort().at(-1) || '';
        state.preview = '';
        state.ready = state.days.size > 0;
        renderCalendar();
        if (state.ready) { renderStory(); draw(); maybeAutoplay(); }
      } catch {
        host.setAttribute('aria-busy', 'false');
        host.innerHTML = `<p>${t('The running calendar could not load.', '暂时无法读取跑步月历。')}</p><button type="button" data-memory-retry>${t('Try again', '重新加载')}</button>`;
      }
    }
    async function openMap() {
      if (map || mapPromise) return mapPromise;
      const version = ++mapVersion;
      mapButton.disabled = true;
      mapStatus.textContent = t('Opening street map…', '正在打开街道地图…');
      mapPromise = (async () => {
        try {
          const readyMap = await createMap();
          if (version !== mapVersion) { readyMap.remove(); return; }
          map = readyMap;
          map.scrollZoom.disable();
          map.dragPan.disable();
          map.dragRotate.disable();
          const accent = getComputedStyle(section).getPropertyValue('--color-route').trim();
          map.addSource('memory-active', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'memory-glow', type: 'line', source: 'memory-active',
            paint: { 'line-color': accent, 'line-width': 11, 'line-opacity': .18, 'line-blur': 4 } });
          map.addLayer({ id: 'memory-line', type: 'line', source: 'memory-active',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': accent, 'line-width': 3.5, 'line-opacity': .95 } });
          map.on('move', () => positionBubble());
          panel.classList.add('memory-street-ready');
          mapNode.classList.add('is-ready');
          mapButton.hidden = true;
          mapStatus.textContent = '';
          draw(!media.matches);
        } catch (error) {
          const reason = error.message === 'Map timeout' ? 'timeout' : error.message === 'WebGL unavailable' ? 'webgl' : error.message.startsWith('Map access rejected') ? 'access' : error.message === 'Map library download failed' ? 'download' : 'unavailable';
          console.warn('[Journey map]', reason, String(error.message || '').replace(/https?:\/\/\S+/g, '[map resource]').slice(0, 180));
          map?.remove(); map = null;
          panel.classList.remove('memory-street-ready');
          mapNode.classList.remove('is-ready');
          mapButton.disabled = false;
          mapButton.hidden = false;
          mapStatus.textContent = reason === 'timeout'
            ? t('Street map took too long to load. Recorded route shown; retry to open the map.', '街道地图加载超时，已显示真实路线轮廓，可点击重试。')
            : reason === 'download'
              ? t('Street map component could not download. Recorded route shown; retry to load the map.', '街道地图组件下载失败，已显示真实路线轮廓，可点击重试。')
            : reason === 'access'
              ? t('Street map access was rejected for this browser address. Recorded route shown.', '地图服务拒绝了当前浏览器地址的访问，已显示真实路线轮廓。')
            : reason === 'webgl'
              ? t('This browser cannot render the street map. Recorded route shown.', '当前浏览器无法绘制街道地图，已显示真实路线轮廓。')
              : t('Recorded route shown. Street map unavailable; retry to open the map.', '已显示真实路线轮廓，街道地图暂不可用，可点击重试。');
        } finally { mapPromise = null; }
      })();
      return mapPromise;
    }
    host.addEventListener('click', event => {
      clearTimeout(hoverTimer);
      const day = event.target.closest('[data-memory-day]');
      const step = event.target.closest('[data-month-step]');
      if (day && !day.disabled) { stop(); autoStarted = true; choose(day.dataset.memoryDay, { animate: event.detail !== 0 }); }
      else if (step) {
        autoStarted = true;
        const index = state.index.months.findIndex(m => m.month === state.month) + Number(step.dataset.monthStep);
        if (state.index.months[index]) loadMonth(state.index.months[index].month).then(() => {
          if (event.detail === 0) {
            const target = host.querySelector(`[data-month-step="${step.dataset.monthStep}"]:not(:disabled)`)
              || host.querySelector('[data-memory-day]:not(:disabled)');
            target?.focus({ preventScroll: true });
          }
        });
      } else if (event.target.closest('[data-memory-play]')) {
        autoStarted = true;
        if (state.playing) { stop(); state.preview = ''; draw(); } else play();
      } else if (event.target.closest('[data-memory-retry]')) loadMonth(state.month || state.index.months[0].month);
    });
    host.addEventListener('pointerover', event => {
      if (!fine.matches || event.pointerType !== 'mouse') return;
      clearTimeout(hoverTimer);
      const day = event.target.closest('[data-memory-day]:not(:disabled)');
      if (!day || day.contains(event.relatedTarget)) return;
      stop(); autoStarted = true; clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => choose(day.dataset.memoryDay, { preview: true, animate: true }), 120);
    });
    host.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(hoverTimer);
      if (!state.playing && state.preview) { state.preview = ''; draw(); }
    });
    host.addEventListener('focusin', event => {
      const day = event.target.closest('[data-memory-day]:not(:disabled)');
      if (day) { stop(); autoStarted = true; choose(day.dataset.memoryDay, { preview: true }); }
    });
    bubble.addEventListener('click', event => {
      if (event.target.closest('[data-read-memory]')) {
        stop(); autoStarted = true;
        choose(currentDay(), { scroll: true, animate: event.detail !== 0 });
      }
    });
    mapButton.addEventListener('click', openMap);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { stop(); cancelDrawing(); }
      else if (state.ready) draw();
    });
    media.addEventListener('change', () => { stop(); if (state.ready) draw(); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      ++mapVersion; map?.remove(); map = null;
      panel.classList.remove('memory-street-ready');
      mapNode.classList.remove('is-ready');
      mapButton.hidden = false; mapButton.disabled = false;
      if (state.ready) draw();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { stop(); state.preview = ''; if (state.ready) draw(); }
    });
    new ResizeObserver(() => { if (state.ready) draw(); }).observe(panel);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      state.visible = entries[0].isIntersecting;
      if (!state.visible) { stop(); if (state.ready) draw(); else cancelDrawing(); }
      else maybeAutoplay();
    }, { threshold: .15 }).observe(panel);
    else state.visible = true;
    return {
      get hasData() { return state.ready; },
      refreshLanguage() {
        mapButton.textContent = t('Show street map ↗', '查看街道地图 ↗');
        if (state.ready) { renderCalendar(); renderStory(); draw(); }
      },
      async setSummary() {
        if (state.index || state.loading) return;
        state.loading = true;
        try {
          state.index = await loadJson('assets/data/journal-index.json');
          if (state.index.version !== 1 || !Array.isArray(state.index.months) || !state.index.months.length) throw Error('No published months');
          await loadMonth(state.index.months[0].month);
        } catch {
          state.index = null;
          host.setAttribute('aria-busy', 'false');
          host.innerHTML = `<p>${t('Recent notes remain available. The calendar could not load.', '最近的跑步仍可阅读，月历暂时无法加载。')}</p>`;
        } finally { state.loading = false; }
      },
    };
  }
  return { mount, monthCells, groupDays, projectRoutes, coordinates };
});
