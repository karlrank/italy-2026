// Thin Vercel KV / Upstash Redis REST client (dependency-free).
const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const kvConfigured = Boolean(REST_URL && REST_TOKEN);

async function cmd(command) {
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

export async function kvGet(key) {
  const { result } = await cmd(["GET", key]);
  return result ? JSON.parse(result) : null;
}

export async function kvGetRaw(key) {
  const { result } = await cmd(["GET", key]);
  return result ?? null;
}

export async function kvSet(key, value) {
  await cmd(["SET", key, JSON.stringify(value)]);
}

export async function kvSetEx(key, value, ttlSeconds) {
  await cmd(["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]);
}

export async function kvSetRaw(key, value) {
  await cmd(["SET", key, value]);
}

export async function kvSetRawEx(key, value, ttlSeconds) {
  await cmd(["SET", key, value, "EX", String(ttlSeconds)]);
}

export async function kvDel(key) {
  await cmd(["DEL", key]);
}

export async function kvHSet(key, field, value) {
  await cmd(["HSET", key, field, value]);
}

export async function kvHDel(key, field) {
  await cmd(["HDEL", key, field]);
}

export async function kvHGetAll(key) {
  const { result } = await cmd(["HGETALL", key]);
  const flat = Array.isArray(result) ? result : [];
  const obj = {};
  for (let i = 0; i < flat.length; i += 2) obj[flat[i]] = flat[i + 1];
  return obj;
}

// All keys matching the pattern (cursor loop; fine at this project's scale)
export async function kvScan(match) {
  let cursor = "0";
  const keys = [];
  do {
    const { result } = await cmd(["SCAN", cursor, "MATCH", match, "COUNT", "100"]);
    cursor = String(result[0]);
    keys.push(...result[1]);
  } while (cursor !== "0");
  return keys;
}
