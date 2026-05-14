"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/// Two-button language switcher. The active locale is passed in from
/// the server-rendered Header so this component doesn't have to read
/// the cookie itself. On click: POST /api/locale to persist + call
/// router.refresh() so every server component re-renders with the
/// new bundle.
export default function LocaleToggle({ current }: { current: "en" | "fr" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyLocale, setBusyLocale] = useState<"en" | "fr" | null>(null);

  function pick(locale: "en" | "fr") {
    if (locale === current || pending) return;
    setBusyLocale(locale);
    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    })
      .then(() => {
        startTransition(() => router.refresh());
      })
      .finally(() => setBusyLocale(null));
  }

  return (
    <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-border p-0.5 text-[11px] font-bold tracking-wide">
      {(["en", "fr"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => pick(loc)}
          aria-pressed={current === loc}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            current === loc
              ? "bg-fg text-obsidian"
              : "text-fg-secondary hover:text-fg"
          } ${busyLocale === loc ? "opacity-60" : ""}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
