"use client";

import { useEffect, useRef } from "react";

/// Modal confirmation dialog. Replaces window.confirm everywhere the
/// admin platform asks for "are you sure?" before a destructive
/// action. Three visual flavours match the existing action-button
/// palette (neutral / warning / error).
///
/// Keyboard: Esc cancels, Enter triggers the primary action.
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "neutral" | "warning" | "error";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "neutral",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
      if (e.key === "Enter" && !pending) onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onConfirm, onCancel]);

  useEffect(() => {
    if (!open) return;
    // Focus into the dialog so Tab cycles inside it (cheap focus trap).
    const t = setTimeout(() => ref.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const confirmClass =
    tone === "error"
      ? "bg-error/10 hover:bg-error/20 text-error border-error/40"
      : tone === "warning"
      ? "bg-warning/10 hover:bg-warning/20 text-warning border-warning/40"
      : "bg-fg text-obsidian border-fg hover:bg-fg/90";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/70 backdrop-blur-sm"
      onClick={() => { if (!pending) onCancel(); }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-6 rounded-2xl bg-card border border-border p-6 shadow-2xl"
      >
        <h3 className="font-display text-xl tracking-tight">{title}</h3>
        {body && (
          <div className="mt-3 text-sm text-fg-secondary leading-relaxed">{body}</div>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-fg-secondary hover:text-fg disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide border disabled:opacity-50 ${confirmClass}`}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
