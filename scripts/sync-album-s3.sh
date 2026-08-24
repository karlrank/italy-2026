#!/usr/bin/env bash
# Publishes the album to S3, served through CloudFront.
#
#   scripts/sync-album-s3.sh [phase ...]     phases: t m l vp v x   (default: all)
#
# The pixels live in three sizes on the external drive under plain names
# (thumbs/DSCF7925.jpg). The album needs them under path tokens
# (t/DSCF7925-Ab3xK9.jpg) so nobody can walk the CDN by guessing filenames, and
# the tokens live only in the manifest. Renaming 10 000 files is not an option,
# so a tree of symlinks with the public names is staged and synced through —
# `aws s3 sync` follows symlinks, and it is far better at 8 GB than anything
# worth writing by hand.
#
# Re-runnable: sync uploads only what is missing or changed.

set -euo pipefail

export AWS_PROFILE="${AWS_PROFILE:-responsible-sso}"
BUCKET="${ALBUM_BUCKET:-italy-2026-album-426919865472}"
CURATION="${CURATION_DIR:-/Volumes/990EVO/Itaalia 2026/curation}"
VIDEOS="${VIDEO_DIR:-$CURATION/web-videos}"
DATA="$CURATION/data"
STAGE="$CURATION/s3stage"
MANIFEST="$DATA/site_manifest.json"

[ -f "$MANIFEST" ] || {
  echo "no manifest — run scripts/build-photo-manifest.mjs first" >&2
  exit 1
}

phases=("$@")
[ ${#phases[@]} -eq 0 ] && phases=(t m l vp v x)

# Rebuilds the symlink tree for one phase from the manifest's tokens.
stage_phase() {
  local phase="$1" srcdir="$2" ext="$3" key="$4"
  local dir="$STAGE/$phase"
  rm -rf "$dir"
  mkdir -p "$dir"
  node -e '
    const { readFileSync, symlinkSync } = require("node:fs");
    const { join } = require("node:path");
    const [manifest, srcdir, dir, ext, key] = process.argv.slice(1);
    const m = JSON.parse(readFileSync(manifest, "utf8"));
    let n = 0;
    for (const it of m[key]) {
      try {
        symlinkSync(join(srcdir, it.s + ext), join(dir, `${it.s}-${it.k}${ext}`));
        n++;
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
      }
    }
    console.log(`  staged ${n}`);
  ' "$MANIFEST" "$srcdir" "$dir" "$ext" "$key"
}

sync_phase() {
  local phase="$1" type="$2"
  aws s3 sync "$STAGE/$phase/" "s3://$BUCKET/$phase/" \
    --no-progress \
    --only-show-errors \
    --content-type "$type" \
    --cache-control "public, max-age=31536000, immutable"
  echo "  $phase synced"
}

for phase in "${phases[@]}"; do
  echo "$phase:"
  case "$phase" in
    t)  stage_phase t "$CURATION/thumbs"   .jpg photos; sync_phase t  image/jpeg ;;
    m)  stage_phase m "$CURATION/proxies"  .jpg photos; sync_phase m  image/jpeg ;;
    l)  stage_phase l "$CURATION/large"    .jpg photos; sync_phase l  image/jpeg ;;
    vp) stage_phase vp "$VIDEOS/posters"   .jpg videos; sync_phase vp image/jpeg ;;
    v)  stage_phase v "$VIDEOS"            .mp4 videos; sync_phase v  video/mp4  ;;
    x)
      # The manifest is re-uploaded on every re-seed, so it must not be cached
      # for a year like the pixels are.
      token=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).__manifest__)' "$DATA/blob_tokens.json")
      aws s3 cp "$MANIFEST" "s3://$BUCKET/x/manifest-$token.json" \
        --content-type application/json \
        --cache-control "public, max-age=30" \
        --only-show-errors
      echo "  https://${ALBUM_CDN:-dsud2siylevs2.cloudfront.net}/x/manifest-$token.json"
      ;;
    *) echo "  unknown phase" >&2; exit 1 ;;
  esac
done
