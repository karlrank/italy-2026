// Jagatud pakkimisnimekirja salvestus.
// Kasutab Vercel KV / Upstash Redis REST API-t, kui keskkonnamuutujad on
// olemas. Kui pole, vastab { configured: false } ja klient kasutab
// localStorage'i (seadmepõhine). Nii töötab leht ka ilma andmebaasita.

export const dynamic = "force-dynamic";

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const configured = Boolean(REST_URL && REST_TOKEN);

// Lubame ainult selle projekti võtmeid
function safeKey(key) {
  return typeof key === "string" && /^packing:[a-z0-9:-]{1,64}$/i.test(key)
    ? key
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

export async function GET(request) {
  const key = safeKey(new URL(request.url).searchParams.get("key"));
  if (!key) return Response.json({ error: "bad key" }, { status: 400 });
  if (!configured) return Response.json({ configured: false, data: null });

  try {
    const { result } = await redis(["GET", key]);
    return Response.json({
      configured: true,
      data: result ? JSON.parse(result) : null,
    });
  } catch (e) {
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

  const record = {
    checked: body?.data?.checked ?? {},
    extras: body?.data?.extras ?? [],
    updatedAt: Date.now(),
  };

  try {
    await redis(["SET", key, JSON.stringify(record)]);
    return Response.json({ configured: true, ok: true, updatedAt: record.updatedAt });
  } catch (e) {
    return Response.json(
      { configured: true, error: "write failed" },
      { status: 502 }
    );
  }
}
