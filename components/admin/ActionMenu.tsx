"use client";

import { useEffect, useRef, useState } from "react";

/// Compact ••• dropdown for table-row actions. The previous design
/// inlined every action as a coloured pill which made rows visually
/// loud and wrapped at narrow widths. Collapsing into a menu keeps
/// the list scannable; destructive items still flagged via `tone`.
export interface ActionMenuItem {
  label: string;
  onSelect: () => void;
  tone?: "neutral" | "warning" | "error";
  disabled?: boolean;
}

export default function ActionMenu({ items, label = "Actions" }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-elevated hover:bg-border border border-border text-fg-secondary"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] rounded-lg bg-card border border-border shadow-xl z-20 overflow-hidden">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              disabled={it.disabled}
              onClick={() => { setOpen(false); it.onSelect(); }}
              className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-elevated disabled:opacity-40 ${
                it.tone === "error" ? "text-error" :
                it.tone === "warning" ? "text-warning" :
                "text-fg"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
