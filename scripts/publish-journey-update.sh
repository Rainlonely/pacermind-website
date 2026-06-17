#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

YEAR="${PACERMIND_JOURNEY_YEAR:-$(TZ=Asia/Shanghai date +%Y)}"
DEVICE="${PACERMIND_JOURNEY_DEVICE:-84449D9F-DA19-5759-8022-44A41B9F40A6}"
DEVICE_NAME="${PACERMIND_JOURNEY_DEVICE_NAME:-Rain’s Air}"
REMOTE="${PACERMIND_JOURNEY_REMOTE:-origin}"
BRANCH="${PACERMIND_JOURNEY_BRANCH:-main}"
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
  PACERMIND_JOURNEY_WAIT_DEVICE_SECONDS, DEVELOPER_DIR
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

require_clean_worktree() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "error: working tree is not clean. Commit or stash local changes first." >&2
    git status --short >&2
    exit 1
  fi
}

say "Checking clean working tree"
require_clean_worktree

say "Updating local $BRANCH from $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
git rebase "$REMOTE/$BRANCH"

say "Checking device: $DEVICE_NAME ($DEVICE)"
deadline=$((SECONDS + WAIT_DEVICE_SECONDS))
while :; do
  DEVICE_LIST="$(xcrun devicectl list devices)"
  printf '%s\n' "$DEVICE_LIST"
  if xcrun devicectl device info details --device "$DEVICE" >/dev/null 2>&1; then
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
scripts/sync-journey-from-device.py --year "$YEAR" --device "$DEVICE"

say "Verifying generated files"
node --check scripts/scroll-effects.js
node -e "JSON.parse(require('fs').readFileSync('assets/data/journey.json','utf8')); console.log('journey json ok')"

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

if git diff --quiet -- assets/data/journey.json; then
  say "No journey data changes to commit"
  exit 0
fi

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
git add assets/data/journey.json
git commit -m "update journey data for $COMMIT_DATE"

say "Rebasing once more before push"
git pull --rebase "$REMOTE" "$BRANCH"

if [[ "$PUSH" -eq 1 ]]; then
  say "Pushing to $REMOTE $BRANCH"
  git push "$REMOTE" "$BRANCH"
else
  say "Skipping push because --no-push was set"
fi

say "Done"
git status --short --branch
