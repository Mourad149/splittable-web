"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/// Inline action buttons for the admin Users table. Three destructive
/// flavours with escalating severity:
///   Clean — wipes avatar, moments, vibe bio. Reversible.
///   Ban   — anonymises in place, revokes sessions. Account row stays
///           so written reviews / messages remain readable.
///   Delete — full cascade (cancels their tables, refunds joiners,
///            anonymises). Use sparingly.
///
/// Each opens a confirm sheet before firing so a slip-of-the-finger
/// doesn't atomise an account.
export default function UserRowActions({ userId, isDeleted }: { userId: string; isDeleted: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isDeleted) {
    return <span className="text-fg-tertiary text-xs">—</span>;
  }

  async function run(action: "clean" | "ban" | "delete", confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return;
    setPending(action);
    setError(null);
    try {
      const url = action === "delete"
        ? `/api/admin/users/${userId}`
        : `/api/admin/users/${userId}/${action}`;
      const method = action === "delete" ? "DELETE" : "POST";
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-elevated hover:bg-border border border-border"
        onClick={() => run("clean",
          "Clean this user?\n\nThis wipes their avatar, moments, and bio. Reversible — they can re-upload.")}
        disabled={pending !== null}
      >
        {pending === "clean" ? "…" : "CLEAN"}
      </button>
      <button
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30"
        onClick={() => run("ban",
          "Ban this user?\n\nAnonymises the account, revokes every session. Reviews and messages they wrote remain readable as 'Banned User'.")}
        disabled={pending !== null}
      >
        {pending === "ban" ? "…" : "BAN"}
      </button>
      <button
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-error/10 hover:bg-error/20 text-error border border-error/30"
        onClick={() => run("delete",
          "DELETE this user?\n\nFull cascade: cancels every table they're hosting (pushes affected joiners), cancels their JRs, anonymises the row. Use ban instead unless there's a hard reason for the full purge.")}
        disabled={pending !== null}
      >
        {pending === "delete" ? "…" : "DELETE"}
      </button>
      {error && <span className="text-error text-[10px] ml-2">{error}</span>}
    </div>
  );
}
