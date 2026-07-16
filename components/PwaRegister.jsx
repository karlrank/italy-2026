"use client";

import { useEffect } from "react";

// Registers the offline service worker. Production only — a caching SW
// during development serves stale bundles and fights hot reload.
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
