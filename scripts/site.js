/* PacerMind website. No framework; content and download links work without JS. */
(() => {
  "use strict";
  const page = document.body.dataset.page;
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Private browsing still works. */
      }
    },
  };
  const zh = {
    "screens.title": "把城市，跑成自己的样子。",
    "screens.body": "从 Today、Plan、Journey 到 Me，串起训练状态、计划结构、跑步路线与回忆，也看见个人指标和比赛成绩。横向滑动浏览，点击图片放大；截图为中文界面。",
    "edition": "PacerMind 3.0 · 你的跑步日常",
    "hero.eyebrow": "跑步、路线与那些值得留下的日子",
    "hero.title": "跑过的路，<br><em>都记得你。</em>",
    "hero.subtitle": "自己的节奏，值得留下的故事。",
    "hero.body":
      "看见今天的状态，跟随自己的计划，留下每次跑步的路线与回忆。用 iPhone 与 Apple Watch，把跑步日常连成属于你的旅程。",
    "hero.ctaSecondary": "打开计划编辑器 ↗",
    "planner.eyebrow": "你来设定，工具来承接",
    "planner.title": "安排自己的节奏。<br>留出真实的生活。",
    "planner.body": "想跑什么、哪天休息、为了什么出发，由你决定。用本地结构模板，把单周安排或长期备赛方向整理成清楚、可修改的计划。",
    "planner.cta": "开始编辑计划 ↗",
    "planner.release": "网页计划编辑器为预览版。App 的可用功能与价格，请以 App Store 和 App 内为准。",
    "planner.step1.title": "说清你的意图",
    "planner.step1.body": "记录自己的安排与偏好，选一个结构，再填写距离、时长与目标。首版不自动理解自然语言。",
    "planner.step2.title": "看见每个待确认",
    "planner.step2.body": "日期与空白日程需要你确认。预览支持修改，计算明确区分已知、推算和未知。",
    "planner.step3.title": "交给 PacerMind 承接",
    "planner.step3.body": "复制通过校验的 JSON，在 App 中从剪贴板导入，核对预览后确认。",
    "journey.notes": "阅读跑步与开发笔记 ↗",
    "hero.platform": "为 iPhone、iPad 和 Apple Watch 打造",
    "hero.mapLabel": "小小的脚步，长久的印记。",
    "hero.mapTitle": "把城市，跑成自己的故事。",
    "hero.bottom": "每一次跑步，都会留下些什么。",
    "hero.scroll": "探索 App ↓",
    "intro.replay": "↻ 重播旅程",
    "intro.skip": "跳过动画",
    "product.eyebrow": "找到你的跑步节奏",
    "product.title": "今天的付出，<br>明天的理解。",
    "product.subtitle":
      "Today、Plan、Journey、Me：从今天的状态，到下一程的安排，再到一路跑来的记录。",
    "story.today.title": "今天出发，也带着昨天的故事。",
    "story.today.body":
      "训练状态、最近的跑量和今日计划，在首页一起呈现。翻到一段跑步回忆，再为今天留下新的故事。",
    "story.today.a": "一眼看见训练状态与最近跑量",
    "story.today.b": "今日计划，出发前就有方向",
    "story.today.c": "跑步回忆，让旧故事再次相遇",
    "story.screen": "PacerMind 3.0 真实界面 · iPhone",
    "story.plan.title": "下一程，<br>按自己的节奏。",
    "story.plan.body":
      "看清一周安排，也看清每次训练的结构。跑完之后，回看路线与计划执行，记下这次训练的感受与收获。",
    "story.plan.a": "一周安排与训练结构，清楚展开",
    "story.plan.b": "回看路线，了解计划完成情况",
    "story.plan.c": "训练复盘，留下当时的感受",
    "story.journey.title": "回头看看，<br>你已经跑了多远。",
    "story.journey.body":
      "每条路线，都连向更大的图景。在跑步地图里回看最近训练，也看见一路积累的距离、次数与日子。",
    "story.journey.a": "跑过的路线，汇成一张自己的地图",
    "story.journey.b": "累计距离、跑步次数与时间，一起回看",
    "story.journey.c": "最近的跑步，值得记住的细节",
    "story.journey.label": "每一步，都算数。",
    "journey.eyebrow": "来自开发者的跑步日记",
    "journey.title": "这是我的旅程。<br>你的，会是什么样？",
    "journey.subtitle":
      "我是 Rain，也是正在做 PacerMind 的跑者。这些是我的真实路线和笔记。普通的日子，也在慢慢累积。",
    "journey.stats.runs": "次跑步",
    "journey.stats.distance": "累计公里",
    "journey.stats.years": "年跑步时光",
    "journey.explore": "探索这张地图 ↗",
    "journey.recent": "最近的跑步",
    "journey.original": "日记保留跑者书写时的原文。",
    "journey.loading": "路线记得每一步，最近的笔记将在这里呈现。",
    "journey.more": "查看更多跑步 ↓",
    "companion.eyebrow": "离下一次出发，更近一点",
    "companion.title": "准备好，就出发。",
    "companion.watch": "把训练带到手腕上，再把完成的跑步，带回你的故事。",
    "companion.widgetTitle": "抬眼，就看见",
    "companion.widget": "还没打开 App，小组件就已经把跑步节奏带到身边。",
    "companion.sync":
      "连接你使用的运动数据来源，让分散的跑步记录，在这里相遇。",
    "faq.eyebrow": "出发之前",
    "faq.title": "你可能想知道。",
    "faq.devices.q": "哪些设备可以使用 PacerMind？",
    "faq.devices.a":
      "PacerMind 支持 iPhone、iPad 和 Apple Watch。当前系统与设备要求，请以 App Store 页面为准。",
    "faq.start.q": "可以导入我以前的跑步吗？",
    "faq.start.a":
      "可以。授权 Apple Health，或连接 Strava，即可将支持的训练记录导入 PacerMind。",
    "faq.ai.q": "记录跑步一定需要使用 AI 吗？",
    "faq.ai.a":
      "你的记录、笔记和路线以本地存储为主。AI 功能是可选的，在发送完成请求所需的上下文之前，会先征得你的同意。",
    "faq.price.q": "在哪里查看价格？",
    "faq.price.a":
      "当前价格、购买项目与可用功能，请以 App Store 页面和 App 内说明为准。",
    "download.eyebrow": "从一跑开始。",
    "download.title": "跑出你的<br>下一段旅程。",
    "download.subtitle": "下一章，从你走出门的那一刻开始。",
    "download.privacy": "你的数据与隐私 ↗",
  };
  const homeEnglish = Object.fromEntries(
    [...document.querySelectorAll("[data-i18n]")].map((el) => [
      el.dataset.i18n,
      el.innerHTML,
    ]),
  );
  const translations = window.PM_TRANSLATIONS || {};
  let lang = store.get("pacermind-lang");
  if (!["en", "zh"].includes(lang))
    lang = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  let journey = null,
    expanded = false;
  const localized = (en, cn) => (lang === "zh" ? cn : en);
  function statusText(el, en, cn) {
    el.dataset.statusEn = en;
    el.dataset.statusZh = cn;
    el.textContent = localized(en, cn);
  }
  const buttons = document.querySelectorAll("[data-lang-btn]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  function closeMenu() {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
  function applyLanguage() {
    const dictionary = {
      ...translations.shared?.[lang],
      ...(page === "home"
        ? lang === "zh"
          ? zh
          : homeEnglish
        : translations[page]?.[lang]),
    };
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (dictionary[el.dataset.i18n])
        el.innerHTML = dictionary[el.dataset.i18n];
    });
    buttons.forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll('a[href*="apps.apple.com/"]').forEach((link) => {
      link.href = `https://apps.apple.com/${lang === "zh" ? "cn" : "us"}/app/pacermind/id6754869376`;
    });
    toggle?.setAttribute(
      "aria-label",
      localized("Toggle navigation", "展开或收起导航"),
    );
    document.querySelectorAll("[data-status-en]").forEach((el) => {
      if (el.textContent)
        el.textContent = localized(el.dataset.statusEn, el.dataset.statusZh);
    });
    if (journey) renderJourney();
    document.dispatchEvent(new CustomEvent("pm:language", { detail: { lang } }));
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      lang = button.dataset.lang;
      store.set("pacermind-lang", lang);
      applyLanguage();
      if (page === "home" && heroMap && heroData && heroMap.getSource("pm-place-cities"))
        window.PMHeroLandmarks.language(heroMap, heroData, lang);
    }),
  );
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      if (page === "home") finishIntro();
    }
  });
  applyLanguage();
  if (page !== "home") return;

  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const types = {
    easy: ["Easy run", "轻松跑"],
    recovery: ["Recovery", "恢复跑"],
    long: ["Long run", "长距离"],
    tempo: ["Tempo", "节奏跑"],
    interval: ["Intervals", "间歇跑"],
    race_like: ["Race effort", "比赛强度"],
    race: ["Race", "比赛"],
    run: ["Run", "跑步"],
  };
  function date(value) {
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    return Number.isNaN(d.getTime())
      ? ""
      : new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
          month: "short",
          day: "numeric",
        }).format(d);
  }
  function renderJourney() {
    const stats = journey.stats || {};
    for (const [selector, key] of [
      ["[data-stat-runs]", "runs"],
      ["[data-stat-distance]", "distanceKm"],
      ["[data-stat-years]", "years"],
    ]) {
      document.querySelector(selector).textContent = new Intl.NumberFormat(
        lang === "zh" ? "zh-CN" : "en-US",
        { maximumFractionDigits: 0 },
      ).format(stats[key] || 0);
    }
    document.querySelector("[data-updated-at]").textContent =
      localized("Updated ", "更新于 ") +
      String(journey.updatedAt || "").slice(0, 10);
    const runs = journey.runs || [];
    document.querySelector("[data-run-list]").innerHTML = runs
      .slice(0, expanded ? 10 : 3)
      .map((run) => {
        const type =
          types[String(run.type || "run").toLowerCase()] || types.run;
        const note = String(
          run.note ||
            localized("No note for this run.", "这次跑步没有留下笔记。"),
        );
        const excerptLength = /[\u3400-\u9fff]/.test(note) ? 65 : 125;
        const long = note.length > excerptLength + 15;
        return `<article class="run-item"><div><h3>${escape(date(run.date))} · ${escape(run.title || type[lang === "zh" ? 1 : 0])}</h3><div class="run-meta"><span>${escape(run.duration)}</span><span>${escape(run.avgPace)} /km</span><span>${type[lang === "zh" ? 1 : 0]}</span></div></div><strong class="run-distance">${Number(run.distanceKm || 0).toFixed(1)} <small>km</small></strong><p>${escape(long ? note.slice(0, excerptLength) + "…" : note)}</p>${long ? `<details><summary>${localized("Read original note", "阅读完整笔记")}</summary><p>${escape(note)}</p></details>` : ""}</article>`;
      })
      .join("");
    const more = document.querySelector("[data-more-runs]");
    more.hidden = expanded || runs.length <= 3;
  }
  document.querySelector("[data-more-runs]").addEventListener("click", () => {
    expanded = true;
    renderJourney();
  });
  async function json(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const r = await fetch(url, { signal: controller.signal });
      if (!r.ok) throw new Error("Unavailable");
      return await r.json();
    } finally {
      clearTimeout(timeout);
    }
  }
  function near(element, callback, margin = "250px") {
    if (!("IntersectionObserver" in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          callback();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(element);
  }
  async function loadJourney() {
    try {
      journey = await json("assets/data/journey-summary.json");
      renderJourney();
    } catch {
      const list = document.querySelector("[data-run-list]");
      list.innerHTML = `<p>${localized("Unable to load recent runs. Please retry.", "暂时无法读取跑步记录，请重试。")}</p><button type="button" class="text-link" data-retry-runs>${localized("Retry", "重新加载")}</button>`;
      list.querySelector("[data-retry-runs]").addEventListener("click", loadJourney);
    }
  }
  near(document.querySelector("#journey"), loadJourney);

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const darkMode = matchMedia("(prefers-color-scheme: dark)");
  const replay = document.querySelector("[data-replay]");
  const skip = document.querySelector("[data-skip]");
  const stage = document.querySelector("[data-intro-stage]");
  const status = document.querySelector("[data-map-status]");
  let libraryPromise,
    resourcesPromise,
    heroData,
    heroResourcesPromise,
    heroMap,
    journeyMap,
    generation = 0,
    introActive = false,
    introTimer;
  function resources() {
    if (!resourcesPromise)
      resourcesPromise = Promise.all([
        json("assets/data/mapbox-config.json"),
        json("assets/data/journey-routes.json"),
      ]).catch((error) => {
        resourcesPromise = null;
        throw error;
      });
    return resourcesPromise;
  }
  function heroResources() {
    return (heroResourcesPromise ||= Promise.all([
      json("assets/data/mapbox-config.json"),
      json("assets/data/hero-heatmap.json?v=20260918"),
    ]).catch((error) => {
      heroResourcesPromise = null;
      throw error;
    }));
  }
  function library() {
    if (window.mapboxgl) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://api.mapbox.com/mapbox-gl-js/v3.24.0/mapbox-gl.css";
      document.head.append(css);
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.24.0/mapbox-gl.js";
      script.async = true;
      const timeout = setTimeout(() => reject(new Error("Map timeout")), 10000);
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        libraryPromise = null;
        script.remove();
        reject(new Error("Map unavailable"));
      };
      document.head.append(script);
    });
    return libraryPromise;
  }
  function makeMap(id, config, interactive, globe) {
    if (!window.mapboxgl.supported()) throw new Error("WebGL unavailable");
    return new window.mapboxgl.Map({
      container: id,
      accessToken: config.accessToken,
      style: `mapbox://styles/mapbox/${darkMode.matches ? "dark" : "light"}-v11`,
      projection: "globe",
      center: globe ? [76.475, 20.3] : [121.475, 31.23],
      zoom: globe ? 0 : 11.3,
      bearing: globe ? -30 : 0,
      pitch: 0,
      interactive,
      attributionControl: true,
      fadeDuration: 200,
    });
  }
  function ready(map) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Map timeout")), 10000);
      map.once("load", () => {
        clearTimeout(timeout);
        resolve();
      });
      map.on("error", (e) => {
        if (e.error?.status === 401 || e.error?.status === 403) {
          clearTimeout(timeout);
          reject(new Error("Map unavailable"));
        }
      });
    });
  }
  function addRoutes(map, routes) {
    map.addSource("running-routes", { type: "geojson", data: routes });
    map.addLayer({
      id: "route-glow",
      type: "line",
      source: "running-routes",
      minzoom: 7.4,
      paint: {
        "line-color": "#FF6A1A",
        "line-width": 7,
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7.4,
          0,
          8.4,
          0.18,
        ],
        "line-blur": 4,
      },
    });
    map.addLayer({
      id: "route-line",
      type: "line",
      source: "running-routes",
      minzoom: 7.4,
      paint: {
        "line-color": "#FF6A1A",
        "line-width": 1.7,
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7.4,
          0,
          8.4,
          0.72,
        ],
      },
    });
  }
  function finishIntro() {
    if (!introActive) return;
    introActive = false;
    generation++;
    window.PMGlobeIntro?.stop();
    clearTimeout(introTimer);
    if (heroMap) {
      heroMap.stop();
      heroMap.remove();
      heroMap = null;
    }
    document.querySelector("#hero-map").classList.remove("is-ready");
    stage.classList.remove("is-playing");
    replay.hidden = false;
    skip.hidden = true;
    status.textContent = "";
  }
  async function playIntro(manual = false) {
    if (introActive) return;
    if (reduceMotion.matches && !manual) {
      statusText(
        status,
        "Motion is reduced on your device. Enjoy the city view.",
        "已遵循设备的减少动态效果设置，直接展示城市。",
      );
      return;
    }
    const run = ++generation;
    introActive = true;
    replay.hidden = true;
    skip.hidden = false;
    statusText(status, "Your journey begins here.", "你的旅程，从这里开始。");
    // Hard limit: network delays can never hold the page or controls indefinitely.
    introTimer = setTimeout(() => {
      if (run === generation) {
        finishIntro();
        statusText(
          status,
          "Enjoy the city view. Replay when you’re ready.",
          "先看看这座城市，准备好后可以重播旅程。",
        );
      }
    }, 12000);
    async function offlineFlight() {
      clearTimeout(introTimer);
      heroMap?.remove(); heroMap = null;
      document.querySelector("#hero-map").classList.remove("is-ready");
      stage.classList.add("is-playing");
      await window.PMGlobeIntro.play(stage, darkMode.matches, () => run === generation);
      if (run !== generation) return;
      store.set("pacermind-intro-seen-v1", "1");
      introActive = false;
      stage.classList.remove("is-playing");
      replay.hidden = false; skip.hidden = true; status.textContent = "";
    }
    try {
      if (["127.0.0.1", "localhost", "::1"].includes(location.hostname)) {
        await offlineFlight(); return;
      }
      const [[config, data]] = await Promise.all([heroResources(), library()]);
      heroData = data;
      // Fetch geometry during the globe flight; optional failure never blocks the intro.
      const routeLoad = json(data.routesUrl + "?v=20260918").catch(() => null);
      if (run !== generation) return;
      if (heroMap) {
        heroMap.remove();
        heroMap = null;
      }
      document.querySelector("#hero-map").classList.remove("is-ready");
      heroMap = makeMap("hero-map", config, false, true);
      await ready(heroMap);
      if (run !== generation) return;
      clearTimeout(introTimer);
      window.PMHeroLandmarks.add(heroMap, data, darkMode.matches, lang);
      routeLoad.then((routes) => {
        if (routes && run === generation && heroMap) addRoutes(heroMap, routes);
      });
      heroMap.setFog({
        color: darkMode.matches ? "#28231f" : "#ede5dd",
        "high-color": darkMode.matches ? "#11100f" : "#f6f1ec",
        "space-color": darkMode.matches ? "#11100f" : "#f6f1ec",
        "star-intensity": darkMode.matches ? 0.15 : 0,
      });
      document.querySelector("#hero-map").classList.add("is-ready");
      stage.classList.add("is-playing");
      store.set("pacermind-intro-seen-v1", "1");
      // Same geographic sequence as iOS HomeMapIntroPlayback; all controls stay usable.
      const stages = [
        { zoom: 0.1, duration: 2500, pitch: 0 },
        { zoom: 2.2, duration: 1500, pitch: 0 },
        { zoom: 5, duration: 1600, pitch: 0 },
        { zoom: 8.8, duration: 1300, pitch: 22 },
        { zoom: 11.3, duration: 1100, pitch: 0 },
      ];
      for (const camera of stages) {
        if (run !== generation) return;
        await new Promise((resolve) => {
          heroMap.once("moveend", resolve);
          heroMap.easeTo({
            ...camera,
            center: [121.475, 31.23],
            bearing: 0,
            easing: (t) => t * t * (3 - 2 * t),
          });
        });
      }
      if (run !== generation) return;
      status.textContent = "";
      stage.classList.remove("is-playing");
      // Keep the landed map stable, with no repeated route/camera loop.
      introActive = false;
      replay.hidden = false;
      skip.hidden = true;
      // Leave the final camera in place; no jump back to a differently cropped poster.
    } catch (error) {
      console.warn(
        "PacerMind intro:",
        error.message.replace(
          /access_token=[^&\s]+/g,
          "access_token=[redacted]",
        ),
      );
      if (run !== generation) return;
      try { await offlineFlight(); return; } catch { /* Keep city routes available. */ }
      finishIntro();
      statusText(
        status,
        "The city view is available. The animation could not load; select Replay to retry.",
        "城市路线图已显示。动画未能加载，点击重播可重试。",
      );
    }
  }
  replay.addEventListener("click", () => playIntro(true));
  skip.addEventListener("click", () => {
    store.set("pacermind-intro-seen-v1", "1");
    finishIntro();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finishIntro();
  });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) finishIntro();
  });
  // Scrolling away stops the flight, rather than spending GPU time below the fold.
  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio === 0) finishIntro();
      },
      { threshold: 0 },
    );
    visibility.observe(stage);
  }
  if (
    !store.get("pacermind-intro-seen-v1") &&
    !reduceMotion.matches &&
    !navigator.connection?.saveData
  ) {
    near(stage, () => playIntro(), "0px");
  }
  const routePanel = document.querySelector(".journey-map-panel");
  const routePoster = routePanel.querySelector(".city-poster");
  const routeControls = routePanel.querySelector(".route-view-controls");
  let routeScale = 1, routeX = 0, routeY = 0, routeDrag;
  function drawRouteView() {
    const maxX = routePanel.clientWidth * (routeScale - 1) / 2;
    const maxY = routePanel.clientHeight * (routeScale - 1) / 2;
    routeX = Math.max(-maxX, Math.min(maxX, routeX));
    routeY = Math.max(-maxY, Math.min(maxY, routeY));
    routePoster.style.transform = `translate(${routeX}px, ${routeY}px) scale(${routeScale})`;
  }
  function enableRouteView() {
    routePanel.classList.add("is-route-view");
    routeControls.hidden = false;
  }
  routeControls.addEventListener("click", e => {
    const action = e.target.dataset.routeZoom;
    if (!action) return;
    routeScale = action === "reset" ? 1 : Math.max(1, Math.min(5, routeScale * (action === "in" ? 1.3 : 1 / 1.3)));
    if (action === "reset") routeX = routeY = 0;
    drawRouteView();
  });
  routePanel.addEventListener("pointerdown", e => {
    if (!routePanel.classList.contains("is-route-view") || e.target.closest("button, a")) return;
    routeDrag = { x:e.clientX, y:e.clientY, left:routeX, top:routeY };
    routePanel.setPointerCapture(e.pointerId);
  });
  routePanel.addEventListener("pointermove", e => {
    if (!routeDrag) return;
    routeX = routeDrag.left + e.clientX - routeDrag.x;
    routeY = routeDrag.top + e.clientY - routeDrag.y;
    drawRouteView();
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) routePanel.addEventListener(event, () => routeDrag = null);
  // Local route-image controls remain available while the online map loads.
  enableRouteView();
  const explore = document.querySelector("[data-explore-map]");
  explore.addEventListener("click", async () => {
    const feedback = document.querySelector(".journey-map-status");
    explore.disabled = true;
    statusText(feedback, "Opening map…", "正在打开地图…");
    try {
      const [[config, routes]] = await Promise.all([resources(), library()]);
      routePanel.classList.remove("is-route-view");
      routeControls.hidden = true;
      routePoster.style.transform = "";
      journeyMap = makeMap("journey-map", config, true, false);
      journeyMap.scrollZoom.enable();
      journeyMap.addControl(
        new window.mapboxgl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );
      await ready(journeyMap);
      addRoutes(journeyMap, routes);
      document.querySelector("#journey-map").classList.add("is-ready");
      explore.hidden = true;
      feedback.textContent = "";
      // The map is a keyboard-operable enhancement, never the only route content.
      journeyMap
        .getCanvas()
        .setAttribute(
          "aria-label",
          localized(
            "Shanghai running map. Use arrow keys to pan and plus or minus to zoom.",
            "上海跑步地图。使用方向键移动，加减键缩放。",
          ),
        );
    } catch {
      journeyMap?.remove();
      journeyMap = null;
      explore.disabled = false;
      enableRouteView();
      statusText(feedback,
        "Route image: drag to move, use + / − to zoom. Online map unavailable.",
        "路线图：拖动移动，使用 + / − 缩放。在线地图暂不可用。");
    }
  });
  darkMode.addEventListener("change", () => {
    finishIntro();
    if (heroMap) {
      heroMap.remove();
      heroMap = null;
      document.querySelector("#hero-map").classList.remove("is-ready");
    }
    if (journeyMap) {
      journeyMap.remove();
      journeyMap = null;
      document.querySelector("#journey-map").classList.remove("is-ready");
      explore.hidden = false;
      explore.disabled = false;
    }
  });
})();
