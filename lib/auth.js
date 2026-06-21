// Jagatud autentimisabilised (kasutavad nii middleware kui /api/auth).
// Küpsis hoiab parooli HMAC-allkirja — parool ise küpsisesse ei satu.

export const AUTH_COOKIE = "it_auth";
const SALT = "italia-2026-auth-v1";
const enc = new TextEncoder();

function base64url(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Oodatav küpsise väärtus antud parooli korral
export async function expectedToken(password) {
  if (!password) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SALT));
  return base64url(sig);
}

// Konstantse ajaga võrdlus
export function timingSafeEqual(a = "", b = "") {
  const ae = enc.encode(a);
  const be = enc.encode(b);
  if (ae.length !== be.length) return false;
  let diff = 0;
  for (let i = 0; i < ae.length; i++) diff |= ae[i] ^ be[i];
  return diff === 0;
}
