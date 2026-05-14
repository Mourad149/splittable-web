"use client";

import { useRouter, useSearchParams } from "next/navigation";
import QueerChip from "./QueerChip";

type Chip = "all" | "tonight" | "queer" | "premium" | "chill" | "wild";

const ORDER: Chip[] = ["all", "tonight", "queer", "premium", "chill", "wild"];

interface Props {
  selected: Chip;
  city: string;
  /// Server-translated labels keyed by chip. The server-component
  /// parent resolves these via getT() and passes them in so this
  /// client component doesn't need its own locale lookup.
  labels: Record<Chip, string>;
}

/*
 * Horizontal chip strip mirroring DiscoverView's filterBar — same
 * order (Queer in 3rd position), same single-select semantics, same
 * Pride-gradient treatment for the queer chip when selected.
 */
export default function FilterStrip({ selected, labels }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function pick(chip: Chip) {
    const next = new URLSearchParams(params);
    if (chip === "all") next.delete("chip");
    else next.set("chip", chip);
    router.push(`/?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ORDER.map((key) =>
        key === "queer" ? (
          <QueerChip key={key} selected={selected === key} onClick={() => pick(key)} />
        ) : (
          <Pill
            key={key}
            label={labels[key]}
            selected={selected === key}
            onClick={() => pick(key)}
          />
        )
      )}
    </div>
  );
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 " +
        (selected
          ? "bg-fg text-obsidian shadow-[0_4px_24px_-8px_rgba(255,255,255,0.3)]"
          : "bg-elevated text-fg-secondary border border-border hover:text-fg hover:border-border-strong")
      }
    >
      {label}
    </button>
  );
}
