#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

YEAR="${PACERMIND_JOURNEY_YEAR:-$(TZ=Asia/Shanghai date +%Y)}"
DEVICE="${PACERMIND_JOURNEY_DEVICE:-84449D9F-DA19-5759-8022-44A41B9F40A6}"
DEVICE_NAME="${PACERMIND_JOURNEY_DEVICE_NAME:-Rain’s Air}"
REMOTE="${PACERMIND_JOURNEY_REMOTE:-origin}"
BRANCH="${PACERMIND_JOURNEY_BRANCH:-codex/pacermind-3-atlas-editor-review-20261008}"
JOURNEY_PYTHON="${PACERMIND_JOURNEY_PYTHON:-python3}"
PUSH=1
WAIT_DEVICE_SECONDS="${PACERMIND_JOURNEY_WAIT_DEVICE_SECONDS:-60}"

DEVELOPER_DIR_DEFAULT="/Applications/Xcode-beta.app/Contents/Developer"
if [[ -z "${DEVELOPER_DIR:-}" && -d "$DEVELOPER_DIR_DEFAULT" ]]; then
  export DEVELOPER_DIR="$DEVELOPER_DIR_DEFAULT"
fi

usage() {
  cat <<'EOF'
Usage: scripts/publish-journey-update.sh [options]

Sync PacerMind journey data from Rain's Air, verify it, commit it, and push.

Options:
  --year YEAR       Data year to export. Defaults to current Asia/Shanghai year.
  --device ID       Device identifier/name. Defaults to Rain’s Air identifier.
  --wait SECONDS    Wait for the device to become connected. Defaults to 60.
  --no-push         Commit locally but do not push.
  -h, --help        Show this help.

Environment overrides:
  PACERMIND_JOURNEY_YEAR, PACERMIND_JOURNEY_DEVICE,
  PACERMIND_JOURNEY_DEVICE_NAME, PACERMIND_JOURNEY_REMOTE, PACERMIND_JOURNEY_BRANCH,
  PACERMIND_JOURNEY_WAIT_DEVICE_SECONDS, PACERMIND_JOURNEY_PYTHON, DEVELOPER_DIR

Publishing uses a temporary checkout of the remote production branch, preserving
the caller's branch and local edits. --no-push requires a clean production checkout.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --year)
      YEAR="${2:?missing value for --year}"
      shift 2
      ;;
    --device)
      DEVICE="${2:?missing value for --device}"
      shift 2
      ;;
    --wait)
      WAIT_DEVICE_SECONDS="${2:?missing value for --wait}"
      shift 2
      ;;
    --no-push)
      PUSH=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown option $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

say() {
  printf '\n==> %s\n' "$*"
}

if [[ "$PUSH" -eq 1 && "${PACERMIND_JOURNEY_ISOLATED:-0}" != 1 ]]; then
  say "Preparing an isolated copy of $REMOTE/$BRANCH"
  git fetch "$REMOTE" "$BRANCH"
  ISOLATED_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pacermind-journey-publish.XXXXXX")"
  git worktree add --detach "$ISOLATED_DIR" "$REMOTE/$BRANCH"
  trap 'git worktree remove --force "$ISOLATED_DIR"' EXIT
  (
    cd "$ISOLATED_DIR"
    PACERMIND_JOURNEY_ISOLATED=1 scripts/publish-journey-update.sh \
      --year "$YEAR" --device "$DEVICE" --wait "$WAIT_DEVICE_SECONDS"
  )
  exit 0
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: sync requires a clean temporary checkout; existing edits were preserved." >&2
  exit 1
fi
if [[ "$PUSH" -eq 0 && "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "error: --no-push must run on the configured production branch $BRANCH." >&2
  exit 1
fi
"$JOURNEY_PYTHON" -c 'from PIL import Image' || {
  echo "error: set PACERMIND_JOURNEY_PYTHON to a Python environment with Pillow." >&2
  exit 1
}

say "Updating local $BRANCH from $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
git rebase "$REMOTE/$BRANCH"

say "Checking device: $DEVICE_NAME ($DEVICE)"
deadline=$((SECONDS + WAIT_DEVICE_SECONDS))
while :; do
  DEVICE_LIST="$(xcrun devicectl list devices)"
  printf '%s\n' "$DEVICE_LIST"
  if xcrun devicectl device info details --device "$DEVICE" --timeout 15 >/dev/null 2>&1; then
    break
  fi

  if (( SECONDS >= deadline )); then
    DEVICE_LINE="$(printf '%s\n' "$DEVICE_LIST" | grep -F "$DEVICE_NAME" || true)"
    if [[ -n "$DEVICE_LINE" ]]; then
      echo "error: $DEVICE_NAME is visible but devicectl cannot open a usable device tunnel:" >&2
      echo "$DEVICE_LINE" >&2
    else
      echo "error: $DEVICE_NAME was not found by devicectl." >&2
    fi
    echo "Unlock the phone, keep it awake, connect USB if needed, and check trust / Developer Mode." >&2
    exit 1
  fi

  echo "waiting for $DEVICE_NAME device tunnel..." >&2
  sleep 5
done

say "Syncing journey data for $YEAR"
"$JOURNEY_PYTHON" scripts/sync-journey-from-device.py --year "$YEAR" --device "$DEVICE"

SUMMARY="$(node - <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("assets/data/journey.json", "utf8"));
const latest = data.runs && data.runs[0];
const stats = data.stats || {};
if (!latest) {
  console.log("No route workouts exported.");
  process.exit(0);
}
console.log([
  `updatedAt=${data.updatedAt}`,
  `latest=${latest.date} · ${latest.title} · ${latest.distanceKm} km`,
  `routes=${data.runs.length}`,
  stats.totalDistanceKm ? `totalKm=${stats.totalDistanceKm}` : null
].filter(Boolean).join("\n"));
NODE
)"
printf '%s\n' "$SUMMARY"

JOURNEY_CHANGED=1
if git diff --quiet -- assets/data/journey.json; then
  JOURNEY_CHANGED=0
elif "$JOURNEY_PYTHON" - <<'PY'
import json
import subprocess

with open("assets/data/journey.json", encoding="utf-8") as f:
    current = json.load(f)
previous = json.loads(subprocess.check_output(["git", "show", "HEAD:assets/data/journey.json"]))
current.pop("updatedAt", None)
previous.pop("updatedAt", None)
raise SystemExit(0 if current == previous else 1)
PY
then
  git show HEAD:assets/data/journey.json > assets/data/journey.json
  JOURNEY_CHANGED=0
fi

if [[ "$JOURNEY_CHANGED" -eq 1 ]]; then
  say "Preparing lightweight website data and maps"
  "$JOURNEY_PYTHON" scripts/build-web-assets.py --journey-only

  say "Verifying generated files"
  node --check scripts/site.js
  "$JOURNEY_PYTHON" scripts/tests/check-site.py

  COMMIT_DATE="$(node - <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("assets/data/journey.json", "utf8"));
const latest = data.runs && data.runs[0];
if (!latest || !latest.date) {
  process.exit(1);
}
const date = new Date(`${latest.date}T00:00:00+08:00`);
const month = date.toLocaleString("en-US", { month: "long", timeZone: "Asia/Shanghai" });
console.log(`${month} ${date.getDate()}`);
NODE
)"

  say "Committing journey data for $COMMIT_DATE"
  git add index.html assets/data/journey.json assets/data/journey-summary.json assets/data/journey-routes.json assets/data/journal-index.json assets/data/journal assets/images/web/city-light.webp assets/images/web/city-dark.webp
  git commit -m "update journey data for $COMMIT_DATE"
else
  say "No new or changed journey data; nothing to publish"
  exit 0
fi

say "Rebasing once more before push"
git fetch "$REMOTE" "$BRANCH"
git rebase "$REMOTE/$BRANCH"

if [[ "$PUSH" -eq 1 ]]; then
  say "Pushing HEAD to $REMOTE/$BRANCH"
  git push "$REMOTE" "HEAD:$BRANCH"
else
  say "Skipping push because --no-push was set"
fi

say "Done"
git status --short --branch
