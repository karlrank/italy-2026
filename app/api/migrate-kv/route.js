// AJUTINE — kustuta pärast KV kolimist Euroopasse.
// Kopeerib kõik püsiandmed vanast KV-st (KV_*) uude (KV_EU_*) ja
// kontrollib iga võtme väärtust. Ei kustuta ega muuda vana andmebaasi.
// flight:* vahemälu jäetakse vahele — see taastub ise.
// Kaitstud middleware'iga nagu kõik /api teed.

export const dynamic = "force-dynamic";

const OLD = {
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
};
const NEW = {
  url:
    process.env.KV_EU_KV_REST_API_URL || process.env.KV_EU_REST_API_URL || "",
  token:
    process.env.KV_EU_KV_REST_API_TOKEN ||
    process.env.KV_EU_REST_API_TOKEN ||
    "",
};

async function cmd(store, command) {
  const res = await fetch(store.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${store.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  return res.json();
}

export async function GET() {
  if (!OLD.url || !OLD.token || !NEW.url || !NEW.token) {
    return Response.json({
      ok: false,
      error: "env puudu",
      oldConfigured: Boolean(OLD.url && OLD.token),
      newConfigured: Boolean(NEW.url && NEW.token),
    });
  }

  try {
    // Kõik võtmed vanast baasist
    let cursor = "0";
    const keys = [];
    do {
      const { result } = await cmd(OLD, ["SCAN", cursor, "MATCH", "*", "COUNT", "100"]);
      cursor = String(result[0]);
      keys.push(...result[1]);
    } while (cursor !== "0");

    const toCopy = keys.filter((k) => !k.startsWith("flight:"));
    const report = [];
    for (const k of toCopy) {
      const { result: val } = await cmd(OLD, ["GET", k]);
      if (val == null) {
        // mitte-string võti või kadunud — raporteeri, ära kirjuta
        report.push({ key: k, copied: false, reason: "empty or non-string" });
        continue;
      }
      await cmd(NEW, ["SET", k, val]);
      const { result: check } = await cmd(NEW, ["GET", k]);
      report.push({ key: k, copied: true, bytes: val.length, verified: check === val });
    }

    return Response.json({
      ok: report.every((r) => !r.copied || r.verified),
      keysInOld: keys.length,
      skippedFlightCache: keys.length - toCopy.length,
      report,
    });
  } catch (e) {
    return Response.json({ ok: false, error: e?.message || "failed" }, { status: 502 });
  }
}
