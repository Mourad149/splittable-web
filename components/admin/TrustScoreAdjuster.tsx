"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

/// Slider + nudge buttons for the admin trust-score control. POSTs to
/// /admin/users/:id/trust-score, which clamps server-side. The
/// confirm dialog summarises the new value before committing so an
/// accidental drag doesn't quietly mutate a real user.
export default function TrustScoreAdjuster({ userId, current }: { userId: string; current: number }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function commit() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/trust-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setPending(false);
      setConfirmOpen(false);
    }
  }

  const dirty = value !== current;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          className="w-20 px-2 py-1.5 bg-elevated border border-border rounded-md text-sm text-center"
        />
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() => setConfirmOpen(true)}
          className="px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide bg-fg text-obsidian disabled:opacity-30"
        >
          {pending ? "…" : "SAVE"}
        </button>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() => setValue(current)}
          className="px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide bg-elevated border border-border disabled:opacity-30"
        >
          RESET
        </button>
      </div>
      <p className="text-xs text-fg-tertiary">
        Trust scores affect ranking + match priority. Live range 0–100; 50 is the default for fresh accounts.
      </p>
      {error && <p className="text-xs text-error">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Update trust score?"
        body={<>Setting from <b>{current}</b> to <b>{value}</b>. Takes effect immediately.</>}
        confirmLabel="Update score"
        pending={pending}
        onConfirm={commit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
