# PacerMind 3.0 website preview

This is a reviewable static implementation for the existing PacerMind website, submitted on a separate branch and draft pull request. It does not establish that App 3.0 has publicly launched. Deployment, hosting changes, iOS changes, credentials, paid services and device actions are outside this review.

## Review routes

- `index.html`: Atlas palette from the current iOS tokens, running/route/memory positioning, product/editor/notes navigation, 3.0 preparation status, proposed free download and one-time personal record import purchase targeting ¥15 in China. Existing genuine 2.0 captures are labelled; existing routes, map attribution, origin restrictions, reduced motion, optional live-map loading, support and privacy are retained.
- `planner.html`: English/Chinese browser-local editor. Choose a structure, enter your own values, confirm the days, and inspect the App JSON snapshot. No natural-language interpretation or LLM request is implemented or advertised. Your intention text is preserved as the plan goal.
- `notes.html`: the existing published running summary and original notes. The development category is intentionally empty. No unpublished material or made-up posts, testimonials, routes or product screenshots were added.

Start the existing static server from the website directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`, `/planner.html` and `/notes.html` in the same environment. This is a local preview, not a published URL. Relative links/assets also work under a hosting path prefix. The implementation does not require GitHub Pages; the owner will decide the release host separately.

## Plan workflow

1. Name the plan and write your intention. Choose an explicit start date matching Monday or Sunday.
2. Select a one-week horizon or assemble whole-week race phases. Specify race details, phase roles and your own focus. No amounts, paces or workload prescriptions are supplied by the phase structures.
3. Choose a workout template and fill in distance/duration, units, repeats and optional targets. Warmup and cooldown occur once; every repeated block includes all its work and recovery segments. A final repetition without recovery needs a separate block.
4. Confirm each concrete export day as rest, workout or race. Empty days remain pending. Future metadata weeks can remain unscheduled; select only the fully confirmed weeks for export.
5. Validate and inspect the snapshot. Copy JSON → in PacerMind, import from clipboard → App preview → confirmation. Keep the App week-start setting aligned. App import confirms conflicts in the concrete date window. Downloaded JSON is a backup, not a promise of App file import. No deep link is added.

The external App contract supports **one workout and one optional race event per day**. A second same-day workout cannot be represented in this export, and is never silently merged. Missing optional pace targets remain absent; distance/time conversions never infer them. Required amounts or dates that are missing, malformed or ambiguous block export.

## Contract and calculations

The checked-in `assets/data/schema/plan-v2.json` is byte-identical to the iOS external schema at iOS commit `1aebc16b9f59e58cd65764bfc32d33691ab8d5e5` (`SPEC/PacerMind_Plan_JSON_v2_Schema_Draft.json`). Schema version stays **2.0**, independent of product version 3.0. Time is decimal minutes, distance is kilometres, pace is decimal minutes per kilometre. `5:30` becomes `5.5`; `5.30` means 5 minutes 18 seconds. Miles use 1.609344 km.

The web draft is a separate, versioned backup format; it preserves typed units and original intention. It is not App JSON. Restore validates type, structure, size (1.5 MB), version and complexity before a replacement preview. Autosaving uses localStorage, reports denial/quota errors, preserves unreadable stored data, and pauses on another tab's changes. Choose a version explicitly to resume. Draft clearing and calendar/phase changes require an in-page preview; ordinary changes can be undone during the visit.

`coachProgram` preserves a stable ID, Monday/Sunday alignment, contiguous seven-day weeks, one-based indexes and contiguous block indexes. A race-preparation route must contain a Race-role week covering the race date. Exported route changes increment the revision; workout-only changes do not. Metadata can cover 1–160 weeks independently from a selected concrete day window. Previously imported revisions are not observable from this browser; the App's own checks remain authoritative.

D1 sums explicit components, multiplying all segments in each repeated block and counting warmup/cooldown once. Both pace bounds can supply a calculated range. A single pace bound cannot supply a complete range. Unknown distance/time components are shown separately from known subtotals. Races and explicit recovery distance are separate. Quality counts are based on the specified workout types, not a claim of actual physiological intensity; spacing uses calendar days, not assumed recovery hours.

G1 compares consecutive complete weeks only when distance is exact, nonzero in the previous week, with no pending or unknown components. No percentage is shown for incomplete or pace-derived totals. The editable 10% comparison reference is not a safety threshold. Taper-labelled weeks expose the actual entered trend without generating a taper prescription. Reference IDs are linked inside the calculation notes; no medical conclusion or readiness verdict is produced.

## Checks

```sh
node --check scripts/site.js
node --check scripts/translations.js
node --check scripts/planner.mjs
node --check scripts/plan-core.mjs
node --check scripts/plan-copy.mjs
node --check scripts/notes.mjs
node --test scripts/tests/plan-core.test.mjs
python3 scripts/tests/check-site.py
python3 scripts/tests/check-plan-contract.py
# Optional read-only source comparison and existing iOS fixture validation:
python3 scripts/tests/check-plan-contract.py --ios-root /path/to/Pacermind-app-ios
```

The Python contract check uses `jsonschema`. Browser checks use an installed Playwright and Chromium, with the local server running:

```sh
PACERMIND_CHROMIUM=/path/to/chromium node scripts/tests/browser-tests.cjs
```

If Playwright is installed outside Node's usual module resolution, set `PACERMIND_PLAYWRIGHT_MODULE` to its installed module path. `PACERMIND_PREVIEW_URL` can set another local preview URL. `PACERMIND_SCREENSHOTS` optionally saves website screenshots to a chosen output folder. All external browser requests are blocked during these checks; tests use synthetic plans. Product analytics remains confined to the existing homepage/legal pages; the editor and notes page load no analytics or remote fonts.

These checks exercise schema and browser behavior. **No Xcode, Simulator or actual App import was run in this Linux environment.** The read-only iOS fixture was validated in place; only independently constructed synthetic fixtures were added to this public website.

The pull-request-only workflow in `.github/workflows/website-review.yml` runs the same public checks and 23 browser scenarios against a local static server. It uses read-only repository permissions, pinned action commits, Node 24, Python 3.12, `jsonschema` 4.26.0 and Playwright 1.57.0. Dependencies and browser binaries are installed in the ephemeral CI runner. The private/read-only sibling iOS checkout is not needed by CI. There is no deployment, public preview, secret access, production request or artifact publishing step.

## Release follow-up

- The user will supply real 3.0 App captures when ready; keep the labelled genuine 2.0 images until then.
- Confirm the public App 3.0 release status and final store pricing before changing preparation/proposed-price wording.
- Run a user-owned real App clipboard import and verify preview, week-start preference, conflict confirmation and route revision behavior.
- Approve any development article and its publication metadata before adding it; keep private drafts outside the public repository.
- Any future natural-language service needs a separately reviewed server integration, explicit data consent, privacy documentation, provider/cost controls and credentials configured by the owner. It is outside this local first version.
- Review the draft pull request and its CI results before a separately authorized merge or release. Hosting remains undecided; no release was performed here.
