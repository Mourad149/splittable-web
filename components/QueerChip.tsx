"use client";

import PrideFlag from "./PrideFlag";

interface Props {
  selected: boolean;
  onClick: () => void;
}

/*
 * Quick filter chip mirroring DiscoverView's QueerPillButton. Selected
 * state composites the Pride gradient + glossy top highlight + bottom
 * shadow lip + hairline rim so it reads as a finished surface, not a
 * flat swatch. Unselected stays neutral with the rest of the strip.
 */
export default function QueerChip({ selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 " +
        (selected
          ? "text-white shadow-[0_4px_24px_-4px_rgba(147,63,174,0.4)]"
          : "text-fg-secondary hover:text-fg bg-elevated border border-border hover:border-border-strong")
      }
    >
      {selected && (
        <>
          <span aria-hidden className="absolute inset-0 rounded-full pride-gradient" />
          <span aria-hidden className="absolute inset-0 rounded-full pride-gloss" />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "inset 0 -10px 14px -10px rgba(0,0,0,0.18), inset 0 0 0 0.6px rgba(255,255,255,0.45)",
            }}
          />
        </>
      )}
      <span className="relative flex items-center gap-2">
        <PrideFlag size={12} rounded={2} />
        Queer
      </span>
    </button>
  );
}
