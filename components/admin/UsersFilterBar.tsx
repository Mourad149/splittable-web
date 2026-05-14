"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/// Search + status filter for the admin Users table. Server pages can't
/// `onChange` a `<select>`, so this lives in its own client component.
/// The status dropdown auto-submits on change (no separate Search click
/// needed) and the search input still posts on Enter / Search-button.
export default function UsersFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const status = searchParams.get("status") ?? "ACTIVE";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    next.delete("page");  // any filter / search change resets pagination
    router.push(`?${next.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setParam("q", q); }}
      className="mt-6 flex gap-2"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email…"
        className="flex-1 max-w-md px-4 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-fg-tertiary focus:outline-none focus:border-border-strong"
      />
      <select
        value={status}
        onChange={(e) => setParam("status", e.target.value)}
        className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm"
      >
        <option value="ACTIVE">Active</option>
        <option value="DELETED">Deleted / banned</option>
        <option value="ALL">All</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2.5 bg-fg text-obsidian rounded-lg text-sm font-semibold"
      >
        Search
      </button>
    </form>
  );
}
