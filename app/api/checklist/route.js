// Shared packing checkmark storage.
// Checkmarks live in a Redis HASH (field = item id) so each check/uncheck
// is a single atomic command — two family members ticking boxes at the
// same time can no longer overwrite each other, which the old
// whole-JSON-blob writes did.
// Without KV env vars this answers { configured: false } and the client
// falls back to localStorage (per-device). The page works without a DB.

export const dynamic = "force-dynamic";

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const configured = Boolean(REST_URL && REST_TOKEN);

// Allow only this project's keys
function safeKey(key) {
  return typeof key === "string" && /^packing:[a-z0-9:-]{1,64}$/i.test(key)
    ? key
    : null;
}

// Item ids become hash fields; "_"-prefixed fields are reserved metadata
function safeItemId(id) {
  return typeof id === "string" &&
    /^[a-z0-9_-]{1,64}$/i.test(id) &&
    !id.startsWith("_")
    ? id
    : null;
}

async function redis(command) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV error ${res.status}`);
  return res.json();
}

const hashKey = (key) => `${key}:v2`;

async function readAll(key) {
  const { result } = await redis(["HGETALL", hashKey(key)]);
  const flat = Array.isArray(result) ? result : [];
  const checked = {};
  let updatedAt = null;
  for (let i = 0; i < flat.length; i += 2) {
    if (flat[i] === "_updatedAt") updatedAt = Number(flat[i + 1]) || null;
    else checked[flat[i]] = true;
  }
  return { checked, updatedAt, empty: flat.length === 0 };
}

// One-time migration from the legacy JSON-string record. The legacy key is
// renamed (not deleted) so it stays recoverable and never re-migrates on
// top of later unchecks.
async function migrateLegacy(key) {
  let raw;
  try {
    ({ result: raw } = await redis(["GET", key]));
  } catch {
    return false; // e.g. WRONGTYPE — nothing usable to migrate
  }
  if (!raw) return false;
  let legacy = null;
  try {
    legacy = JSON.parse(raw);
  } catch {}
  const checked = legacy?.checked || {};
  const args = [];
  for (const id of Object.keys(checked)) {
    if (checked[id] && safeItemId(id)) args.push(id, "1");
  }
  args.push("_updatedAt", String(legacy?.updatedAt || Date.now()));
  await redis(["HSET", hashKey(key), ...args]);
  await redis(["RENAME", key, `${key}:legacy`]);
  return true;
}

export async function GET(request) {
  const key = safeKey(new URL(request.url).searchParams.get("key"));
  if (!key) return Response.json({ error: "bad key" }, { status: 400 });
  if (!configured) return Response.json({ configured: false, data: null });

  try {
    let state = await readAll(key);
    if (state.empty && (await migrateLegacy(key))) {
      state = await readAll(key);
    }
    return Response.json({
      configured: true,
      data: { checked: state.checked, updatedAt: state.updatedAt },
    });
  } catch {
    return Response.json(
      { configured: true, error: "read failed" },
      { status: 502 }
    );
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad body" }, { status: 400 });
  }
  const key = safeKey(body?.key);
  if (!key) return Response.json({ error: "bad key" }, { status: 400 });
  if (!configured) return Response.json({ configured: false });

  const now = Date.now();
  try {
    const { action } = body || {};
    if (action === "check" || action === "uncheck") {
      const id = safeItemId(body.id);
      if (!id) return Response.json({ error: "bad id" }, { status: 400 });
      if (action === "check") {
        // Single HSET → atomic; concurrent editors can't clobber each other
        await redis(["HSET", hashKey(key), id, "1", "_updatedAt", String(now)]);
      } else {
        await redis(["HDEL", hashKey(key), id]);
        await redis(["HSET", hashKey(key), "_updatedAt", String(now)]);
      }
      return Response.json({ configured: true, ok: true, updatedAt: now });
    }

    // Legacy full-state write from clients still running the old JS bundle.
    // Replaces the whole hash (same clobber semantics the old API had) —
    // kept only for the transition window.
    if (body?.data) {
      const checked = body.data.checked ?? {};
      const args = [];
      for (const id of Object.keys(checked)) {
        if (checked[id] && safeItemId(id)) args.push(id, "1");
      }
      args.push("_updatedAt", String(now));
      await redis(["DEL", hashKey(key)]);
      await redis(["HSET", hashKey(key), ...args]);
      return Response.json({ configured: true, ok: true, updatedAt: now });
    }

    return Response.json({ error: "bad action" }, { status: 400 });
  } catch {
    return Response.json(
      { configured: true, error: "write failed" },
      { status: 502 }
    );
  }
}
