"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/// Triage status toggles for a single report detail page. The only
/// thing the admin does here is move the report along its lifecycle —
/// destructive moderation actions against the reported user live on
/// the Users page (Clean / Ban / Delete).
///
/// Flow: OPEN → REVIEWED (acknowledged) → ACTIONED (we did something)
///                                      → DISMISSED (no merit).
export default function ReportStatusActions({ reportId, status }: { reportId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function setStatus(next: "REVIEWED" | "ACTIONED" | "DISMISSED") {
    setPending(next);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      // swallow — user can retry
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-1.5">
        <button
          onClick={() => setStatus("REVIEWED")}
          disabled={status === "REVIEWED" || pending !== null}
          className="px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide bg-elevated hover:bg-border border border-border disabled:opacity-40"
        >
          {pending === "REVIEWED" ? "…" : "MARK REVIEWED"}
        </button>
        <button
          onClick={() => setStatus("ACTIONED")}
          disabled={status === "ACTIONED" || pending !== null}
          className="px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide bg-error/10 hover:bg-error/20 text-error border border-error/30 disabled:opacity-40"
        >
          {pending === "ACTIONED" ? "…" : "ACTIONED"}
        </button>
        <button
          onClick={() => setStatus("DISMISSED")}
          disabled={status === "DISMISSED" || pending !== null}
          className="px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide bg-success/10 hover:bg-success/20 text-success border border-success/30 disabled:opacity-40"
        >
          {pending === "DISMISSED" ? "…" : "DISMISS"}
        </button>
      </div>
    </div>
  );
}
