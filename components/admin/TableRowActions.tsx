"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmDialog from "./ConfirmDialog";

/// Row-level controls for the admin Tables list. VIEW link to the
/// detail page + an inline destructive "Cancel & refund" button.
/// The cancel runs the full organizer-cancel cascade on the backend
/// (push every approved joiner, drop slots/tx/messages/reviews/JRs).
/// Refunds are a no-op while PAYMENTS_ENABLED is false but the rest
/// of the cascade still fires.
export default function TableRowActions({ tableId, title }: { tableId: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setPending(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/tables/${tableId}`}
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-elevated hover:bg-border border border-border"
      >
        VIEW
      </Link>
      <button
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-error/10 hover:bg-error/20 text-error border border-error/30"
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
      >
        CANCEL
      </button>
      {error && <span className="text-error text-[10px] ml-2">{error}</span>}

      <ConfirmDialog
        open={confirmOpen}
        title={`Cancel "${title}"?`}
        body={
          <>
            Every approved joiner gets a push. Any held payments are refunded
            (no-op today since payments are paused). The table row, its slots,
            join requests, messages, and reviews are deleted.
            <br /><br />
            This cannot be undone.
          </>
        }
        confirmLabel="Cancel & refund"
        tone="error"
        pending={pending}
        onConfirm={cancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
