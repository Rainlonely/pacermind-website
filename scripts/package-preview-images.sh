#!/bin/bash
# Mechanical sizing/encoding only; translated pixels come from image-generation.
set -euo pipefail
locale="$1"
case "$locale" in en|zh-Hant|ja|ko|de|fr|pt|es) ;; *) exit 2;; esac
mkdir -p "outputs/app-store-localized/$locale" "assets/images/iphone-localized/$locale"
for source in "outputs/localized-previews/$locale/"*.png; do
  name=$(basename "$source" .png)
  sips -z 2556 1179 "$source" --out "outputs/app-store-localized/$locale/$name.png" >/dev/null
  cwebp -quiet -q 88 -resize 450 976 "$source" -o "assets/images/iphone-localized/$locale/$name-450.webp"
  cwebp -quiet -q 90 -resize 900 1952 "$source" -o "assets/images/iphone-localized/$locale/$name-900.webp"
done
