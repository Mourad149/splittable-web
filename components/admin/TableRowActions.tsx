"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/// Single destructive action on the admin Tables row — cancels the
/// table with the full organizer-cancel cascade (refund every approved
/// joiner, drop slots/tx/messages/reviews/JRs, then the table row).
/// While payments are paused refunds are a no-op, but the rest of the
/// cascade still runs and joiners still get a push.
export default function TableRowActions({ tableId, title }: { tableId: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm(`Cancel "${title}"?\n\nEvery approved joiner gets a push. Any held payments are refunded (no-op today since payments are paused). This cannot be undone.`)) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Cancel failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-error/10 hover:bg-error/20 text-error border border-error/30"
        onClick={cancel}
        disabled={pending}
      >
        {pending ? "…" : "CANCEL & REFUND"}
      </button>
      {error && <span className="text-error text-[10px] ml-2">{error}</span>}
    </div>
  );
}
