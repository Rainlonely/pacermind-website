# PacerMind website design — September 2026

The website and iOS app share a warm, restrained running identity. The site explains the product, shows genuine app screens, and uses the maker's real running history as evidence.

## Page sequence

1. Light up your city: product promise, direct download, actual Today screen, real city route map.
2. Today: training state, plan, weather.
3. Plan & reflect: weekly plan, workout connection, optional AI insights, notes.
4. Journey: long-term running memory.
5. Maker's journey: aggregate stats, on-demand city map, latest three notes; expand to ten.
6. Apple Watch, widgets, Apple Health / Strava.
7. FAQs, download, privacy and support.

## Shared design language

Use iOS semantic colors and typography (see README). Chinese body and headings use system sans-serif; do not introduce a separate serif identity. Screenshots retain their full proportions. Small metadata labels support the hierarchy instead of competing with content.

## Loading and motion

The first meaningful frame is complete and independent of Mapbox. Self-host fonts and map posters, load responsive screenshots, defer journey notes, and fetch route geometry only for a requested map or eligible first-visit flight. Never load the full device-export JSON in the browser.

The initial globe-to-city flight follows iOS, plays once, can be skipped/replayed, and never blocks the website. Respect reduced motion and data saver. No automatic route carousel after landing.

## Content maintenance

English and Simplified Chinese UI and region-correct download links. Runner notes remain in their original language and are labelled accordingly. Explain AI consent accurately; do not claim all AI processing occurs on device. Keep support/privacy content intact while applying shared styling. See README for asset generation and release checks.
