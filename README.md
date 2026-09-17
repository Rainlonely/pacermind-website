# PacerMind website

Static bilingual website at https://pacermind.xyz. GitHub Pages publishes the root of `main` automatically. No npm build or backend is required.

## Preview and check

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --check scripts/site.js
node --check scripts/translations.js
python3 scripts/tests/check-site.py
```

Mapbox's existing public token is restricted by origin. Local previews display the bundled city poster; verify the live map and globe flight on the allowed production origin. Do not broaden token permissions to make localhost work.

## Design

- Match the iOS `DesignTokens.swift`: light `#F6F1EC` / dark `#11100F`, card `#FFFFFF` / `#201D1A`, brand orange `#FF6A1A`.
- Local Barlow Condensed for Latin display text, Barlow for metrics, system sans-serif for body/Chinese. Font license is in `assets/fonts/OFL.txt`.
- 18–24 px card radii; motion never gates content, navigation or downloads.
- Existing real PacerMind 2.0 iPhone captures are responsively encoded, shown at their original aspect ratio. Replace the source PNGs with new release captures when app screens change; never fabricate product UI.
- `main.css` retains shared support/privacy layout; `website.css` supplies the current cross-site design and home layout.

## First-visit map flight

The hero mirrors iOS `HomeMapIntroPlayback`: globe → continent → country → city → running routes. It plays once per browser after the map is ready, with Skip and Replay. A local city poster is visible immediately. Reduced motion and data saver skip autoplay. Leaving the hero, hiding the tab, or pressing Escape interrupts playback. A 12-second preparation deadline leaves the poster usable on slow/offline networks. The landed map stays still, rather than repeatedly moving between runs.

The Journey map is explicitly activated by the visitor. Its scroll-wheel zoom is disabled so it does not capture page scrolling.

## Refresh published journey assets

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

Run checks and visually verify light/dark desktop and mobile, both languages, navigation, FAQs, first-visit/replay/skip, return visits, reduced motion, map failure, image loading and legal pages. Commit to `main` and push `origin main`; check the Pages build and deployed asset hashes. No separate host or deployment credentials are used.
