"use client";

export default function LogoutButton() {
  const logout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    window.location.assign("/login");
  };

  return (
    <button
      onClick={logout}
      className="text-xs font-medium text-cream/45 underline-offset-4 transition hover:text-sun hover:underline"
    >
      Logi välja
    </button>
  );
}
