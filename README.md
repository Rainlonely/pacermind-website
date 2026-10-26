# PacerMind website

Static bilingual website at https://pacermind.xyz. The site runs from ordinary static hosting; no npm build or backend is required. Public hosting moved to the existing Alibaba Cloud server on 2026-10-26 after website filing (沪ICP备2025147756号-3). HTTPS serves the apex domain; `www` redirects to it. Pushes to `codex/pacermind-3-atlas-editor-review-20261008` automatically validate and publish static files through GitHub Actions. See [deployment notes](deploy/README.md) for branch scope, isolation, preview access, renewal and rollback.

## PacerMind 3.0 review branch

The 3.0 homepage, browser-local plan editor and published-notes entrance are documented in [REVIEW-3.0.md](REVIEW-3.0.md), which records their original review context. The website is now deployed; the editor remains labelled as a preview and needs no backend or build step. It sends no plan content to a server.

## Preview and check

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --check scripts/site.js
node --check scripts/translations.js
python3 scripts/tests/check-site.py
```

Mapbox's existing public token is restricted by origin. Local previews display the bundled city poster; verify the live map and globe flight on the allowed production origin. Do not broaden token permissions to make localhost work.

## Design

- Match the current Atlas tokens in iOS `DesignTokens.swift`: paper `#F5F0E5` / `#101619`, surface `#FBF7EF` / `#1B2528`, ink `#202D29` / `#F5F0E7`, accent `#B8401C` / `#FF762F`.
- Local Barlow Condensed for Latin display text, Barlow for metrics, system sans-serif for body/Chinese. Font license is in `assets/fonts/OFL.txt`.
- 18–24 px card radii; motion never gates content, navigation or downloads.
- The homepage uses real PacerMind 3.0 iPhone preview captures and the nine approved App Store cards completed on 2026-10-09. Responsive WebP assets and source hashes are in `assets/images/iphone-20261009/`; all compositions and attribution remain intact. The captures contain Chinese UI in both website languages. Older 2.0 source assets remain archived separately.
- `main.css` and `website.css` retain existing layouts; `atlas.css` supplies the 3.0 palette and homepage, while `planner.css` supplies the editor.

## First-visit map flight

The hero mirrors iOS `HomeMapIntroPlayback`: globe → continent → country → city → running routes. It plays once per browser after the map is ready, with Skip and Replay. A local city poster is visible immediately. Reduced motion and data saver skip autoplay. Leaving the hero, hiding the tab, or pressing Escape interrupts playback. A 12-second preparation deadline leaves the poster usable on slow/offline networks. The landed map stays still, rather than repeatedly moving between runs.

The Journey map is explicitly activated by the visitor. Its scroll-wheel zoom is disabled so it does not capture page scrolling.

## Refresh published journey assets

A scheduled task in the owner's local chat runs daily at **12:00 Asia/Shanghai** to read Rain’s Air and publish new or changed running notes/data. The Mac, desktop app and paired phone must be available. Missing-device or validation failures preserve the previous website. Original notes are not rewritten; raw phone databases remain temporary and never enter Git.

The publishing script uses a disposable checkout of the remote production branch, preserving unfinished local edits and unrelated commits. It defaults to `codex/pacermind-3-atlas-editor-review-20261008`; a successful push triggers the website deployment workflow. Timestamp-only changes produce no commit. Its Python environment needs Pillow:

```sh
PACERMIND_JOURNEY_PYTHON=/Users/brorain/.local/share/pacermind-website-sync/venv/bin/python \
  scripts/publish-journey-update.sh --device 'Rain’s Air'
```

This command publishes the existing public journey fields, notes and sampled routes. It reads the phone without modifying it. `--journey-only` on the asset builder skips unrelated archived screenshot re-encoding during daily updates.

Install Pillow into your preferred Python environment, then run:

```sh
python3 scripts/build-web-assets.py
python3 scripts/tests/check-site.py
```

The script reads the **already published** `assets/data/journey.json` and generates:
- `journey-summary.json`: totals and latest ten notes, without route coordinates.
- `journey-routes.json`: sampled WGS84 Shanghai route geometry, loaded only for maps.
- Light/dark city posters with real routes; cached Mapbox base maps retain attribution.
- 450 px and 750 px WebP product screenshots.

`--refresh-maps` refreshes cached Mapbox base maps. This makes a normal authenticated request to the existing Mapbox Static Images API with the website's public token and origin. The daily device publishing script also rebuilds and commits summary/routes/posters so derived assets stay current.

## Release

Review changes on a separate branch and draft pull request. The review workflow only checks syntax, synthetic plan contracts, static assets and browser behavior; it has no deployment step or deployment permissions. Before a separately authorized release, confirm the hosting provider and visually verify light/dark desktop and mobile, both languages, navigation, FAQs, first-visit/replay/skip, return visits, reduced motion, map failure, image loading and legal pages. Do not treat a review PR or successful tests as publication approval.

## Export the independent Hero heatmap

With the trusted iPhone connected, run `python3 scripts/export-hero-heatmap.py`.
This reads the current committed iOS heatmap generation and cached place names,
without exporting workouts, identifiers, dates, notes or health metrics. Raw caches
stay in a temporary directory outside Git. The output is intended for the public website.
Use `--device NAME` for another phone or `--cache-dir PATH` for a saved cache/places pair.

- `hero-heatmap.json`: archive-wide occupied-region lights and localized country/city signs.
- `hero-heatmap-routes.json`: every cached route, simplified with disconnected GPS segments preserved, converted from GCJ-02 to WGS84.

Hero loads the small landmark file first and fetches geometry during the globe flight.
The Journey section and its daily publishing data remain independent. Camera landing
stays in Shanghai to match the homepage; the globe shows the full exported footprint.
Landmark zoom thresholds and sign styling mirror the iOS renderer (countries 0–2,
cities 1.4–9.4, lights fade at 7.4–8.4). Missing English cache entries use translated
names from the same cached Chinese location. Update URL versions in site.js when
publishing another export. Never check raw device caches into this repository.
