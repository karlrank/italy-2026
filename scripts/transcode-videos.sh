#!/usr/bin/env bash
# Web versions of the trip videos.
#
# All 118 originals are HEVC — Safari plays that, other browsers are a coin
# toss — and they average 82 MB. This re-encodes to H.264/AAC in an MP4 capped
# at 1920 on the long side, which every browser plays, and pulls a poster frame
# so the grid has something to show before the video is fetched.
#
#   scripts/transcode-videos.sh [outDir] [jobs]
#
# Already-converted files are skipped, so a killed run resumes.

set -uo pipefail

CURATION="${CURATION_DIR:-/Volumes/990EVO/Itaalia 2026/curation}"
OUT="${1:-$CURATION/web-videos}"
JOBS="${2:-4}"
LIST="$CURATION/data/videos.txt"

mkdir -p "$OUT/posters"

convert_one() {
  local src="$1" out="$2"
  local stem
  stem="$(basename "$src")"
  stem="${stem%.*}"

  # "name(1).mp4" is Drive's rename of a byte-identical duplicate — skip it
  case "$stem" in *\(*\)) return 0 ;; esac

  local mp4="$out/$stem.mp4" poster="$out/posters/$stem.jpg"

  if [ ! -f "$poster" ]; then
    # 0.3 s in: past the frame where autofocus is still settling, and short
    # enough for the 1-second clips
    ffmpeg -nostdin -loglevel error -ss 0.3 -i "$src" -frames:v 1 \
      -vf "scale=w=1024:h=1024:force_original_aspect_ratio=decrease:force_divisible_by=2" \
      -q:v 4 -y "$poster" 2>/dev/null \
      || ffmpeg -nostdin -loglevel error -i "$src" -frames:v 1 \
           -vf "scale=w=1024:h=1024:force_original_aspect_ratio=decrease:force_divisible_by=2" \
           -q:v 4 -y "$poster"
  fi

  if [ ! -f "$mp4" ]; then
    # +faststart puts the index first so playback starts before the whole file
    # has downloaded
    # crf alone is not enough here: the handheld low-light clips are noisy
    # enough that x264 spends 20 Mbps chasing grain, which produced files
    # larger than the HEVC originals. The maxrate ceiling settles it, and
    # 60 fps phone footage drops to 30 — nobody is watching this in slow motion.
    if ffmpeg -nostdin -loglevel error -i "$src" \
      -vf "scale=w=1920:h=1920:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30" \
      -c:v libx264 -preset medium -crf 26 -maxrate 4M -bufsize 8M \
      -pix_fmt yuv420p -profile:v high \
      -c:a aac -b:a 128k -movflags +faststart -y "$mp4.tmp.mp4"; then
      mv "$mp4.tmp.mp4" "$mp4"
    else
      rm -f "$mp4.tmp.mp4"
      echo "FAIL $stem" >&2
      return 1
    fi
  fi
  echo "ok $stem"
}
export -f convert_one

grep -v '^[[:space:]]*$' "$LIST" \
  | xargs -P "$JOBS" -I{} bash -c 'convert_one "$@"' _ {} "$OUT" \
  | grep -c '^ok' \
  | xargs -I{} echo "converted/present: {}"

echo "videos: $(ls -1 "$OUT"/*.mp4 2>/dev/null | wc -l | tr -d ' ')  posters: $(ls -1 "$OUT/posters"/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
du -sh "$OUT"
