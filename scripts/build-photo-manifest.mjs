// Builds the gallery manifest from the curation output on the external drive.
//
// The manifest is the SEED: it says which tier the curation pipeline put each
// photo in. Human re-tiering lives separately in KV (photos:tier), as a diff
// against this seed, so re-running this script does not touch anyone's edits.
//
//   RE-SEEDING (e.g. when tier 1 gets re-judged):
//     node scripts/build-photo-manifest.mjs && node scripts/upload-photos.mjs manifest
//   No deploy needed — the site reads the manifest from blob storage at runtime.
//
// Why this file is not in the repo: github.com/karlrank/italy-2026 is PUBLIC.
// The manifest holds every photo's URL, timestamp and GPS position, so it is
// uploaded to blob storage under an unguessable path and the site reaches it
// through PHOTO_MANIFEST_URL (a secret env var).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { join, basename } from "node:path";

const CURATION =
  process.env.CURATION_DIR || "/Volumes/990EVO/Itaalia 2026/curation";
const DATA = join(CURATION, "data");
const TOKENS = join(DATA, "blob_tokens.json");
const OUT = join(DATA, "site_manifest.json");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const readJsonl = (p) =>
  readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

// ── tokens ────────────────────────────────────────────────────────────
// Every asset gets a random path token so the blob URLs cannot be walked by
// guessing filenames. Persisted, because changing one orphans an upload.
const tokens = existsSync(TOKENS) ? readJson(TOKENS) : {};
let minted = 0;
function tokenFor(key) {
  if (!tokens[key]) {
    tokens[key] = randomBytes(12).toString("base64url"); // 16 chars
    minted++;
  }
  return tokens[key];
}

// ── photos ────────────────────────────────────────────────────────────
const tier1 = readJson(join(DATA, "tier1.json"));
const tier2 = new Set(readJson(join(DATA, "tier2.json")));
const tier1Set = new Set(tier1);
const tier3 = readJsonl(join(DATA, "tier3_final.jsonl"));
const rejected = readJsonl(join(DATA, "rejected_final.jsonl"));

const why = new Map();
const rank1 = new Map();
for (const d of readJson(join(DATA, "tier1_detail.json"))) {
  why.set(d.stem, d.why);
  rank1.set(d.stem, d.rank);
}

// Tiers are nested (1 ⊂ 2 ⊂ 3); a photo carries the tightest one it belongs to.
// 0 = cut by the pipeline.
const seedTier = (stem, kept) =>
  !kept ? 0 : tier1Set.has(stem) ? 1 : tier2.has(stem) ? 2 : 3;

const cams = [];
const camIndex = (name) => {
  const label = name === "? ?" ? "tundmatu" : name;
  let i = cams.indexOf(label);
  if (i < 0) i = cams.push(label) - 1;
  return i;
};

const round = (n, d) => (n == null ? null : Number(n.toFixed(d)));

function photoRecord(r, kept) {
  const t = seedTier(r.stem, kept);
  const rec = {
    s: r.stem,
    k: tokenFor(r.stem),
    t,
    d: r.dt, // local wall-clock time as the camera recorded it
    c: camIndex(r.cam),
    w: r.w,
    h: r.h,
    m: r.moment,
    r: r.rank_in_moment,
    q: round(r.q, 3),
    f: r.faces || 0,
  };
  // ~5 m of precision; enough to place a photo, not enough to be a home address
  if (r.gps) rec.g = [round(r.gps[0], 5), round(r.gps[1], 5)];
  if (!kept) rec.x = r.reject;
  if (t === 1) {
    rec.y = why.get(r.stem) || null;
    rec.n = rank1.get(r.stem) || null;
  }
  return rec;
}

const photos = [
  ...tier3.map((r) => photoRecord(r, true)),
  ...rejected.map((r) => photoRecord(r, false)),
].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : a.s < b.s ? -1 : 1));

// ── videos ────────────────────────────────────────────────────────────
// Excluded from curation entirely (no scores, no clustering) — they get their
// own tab, ordered by time like everything else.
const videoPaths = readFileSync(join(DATA, "videos.txt"), "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean)
  // "name(1).mp4" is Drive's rename of a byte-identical duplicate (verified
  // with cmp); uploading both would cost 1.7 GB for the same 30 seconds.
  .filter((p) => !/\(\d+\)\.[^.]+$/.test(p));

const mdls = (path, ...attrs) => {
  const out = execFileSync(
    "mdls",
    [...attrs.flatMap((a) => ["-name", a]), path],
    { encoding: "utf8" }
  );
  const map = {};
  for (const line of out.split("\n")) {
    const m = line.match(/^(\w+)\s+=\s+(.*)$/);
    if (m) map[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return map;
};

// PXL_20260725_104654454 / VID20260726110117 carry the capture time in the
// name; Spotlight's content-creation date is the fallback for the rest.
function videoDate(stem, meta) {
  let m = stem.match(/^PXL_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!m) m = stem.match(/^VID(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (m) {
    const [, Y, M, D, h, mi, s] = m;
    return `${Y}-${M}-${D}T${h}:${mi}:${s}`;
  }
  const raw = meta.kMDItemContentCreationDate;
  return raw ? raw.replace(" ", "T").slice(0, 19) : null;
}

const videos = videoPaths
  .map((p) => {
    const stem = basename(p).replace(/\.[^.]+$/, "");
    const meta = mdls(
      p,
      "kMDItemDurationSeconds",
      "kMDItemPixelWidth",
      "kMDItemPixelHeight",
      "kMDItemContentCreationDate"
    );
    return {
      s: stem,
      k: tokenFor(stem),
      d: videoDate(stem, meta),
      w: Number(meta.kMDItemPixelWidth) || null,
      h: Number(meta.kMDItemPixelHeight) || null,
      dur: round(Number(meta.kMDItemDurationSeconds) || 0, 1),
    };
  })
  .sort((a, b) => (a.d < b.d ? -1 : 1));

// ── base URL ──────────────────────────────────────────────────────────
// CloudFront in front of a private S3 bucket (eu-north-1). Vercel Blob was the
// first home, but the Hobby plan caps it at 1 GB and the album is ~8 GB.
const base = process.env.ALBUM_BASE || "https://dsud2siylevs2.cloudfront.net";

// The manifest's own path token — minted once, then reused forever so that
// re-seeding overwrites the same URL instead of stranding PHOTO_MANIFEST_URL.
tokenFor("__manifest__");

const counts = photos.reduce((a, p) => ((a[p.t] = (a[p.t] || 0) + 1), a), {});
const manifest = {
  v: 1,
  built: new Date().toISOString(),
  base,
  cams,
  photos,
  videos,
  stats: {
    total: photos.length,
    tier1: counts[1] || 0,
    tier2: counts[2] || 0,
    tier3: counts[3] || 0,
    rejected: counts[0] || 0,
    videos: videos.length,
    moments: new Set(photos.map((p) => p.m)).size,
  },
};

writeFileSync(TOKENS, JSON.stringify(tokens, null, 0));
writeFileSync(OUT, JSON.stringify(manifest));

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`manifest → ${OUT}  (${kb(JSON.stringify(manifest).length)})`);
console.log(`  ${JSON.stringify(manifest.stats)}`);
console.log(`  base ${base}`);
console.log(`  tokens: ${Object.keys(tokens).length} (${minted} new)`);
