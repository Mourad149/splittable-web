import Link from "next/link";
import type { TableModel } from "@/lib/types";
import PrideFlag from "./PrideFlag";

interface Props { table: TableModel; index?: number }

/*
 * Editorial card surface — full-bleed photo (or moody fallback), big
 * display headline, supporting eyebrow + meta strip, energy + Pride
 * marks pinned to the top corner. Designed to feel like a magazine
 * cover, not a SaaS list row.
 */
export default function TableCard({ table, index = 0 }: Props) {
  const headline = table.title || table.venue?.name || "Table";
  const subtitle = table.title && table.venue?.name ? table.venue.name : null;
  const photo = pickPhoto(table);
  const dateLabel = formatEventDate(table.eventDate);
  const priceLabel = table.pricePerSeat === 0
    ? "Free"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: table.currency || "EUR", maximumFractionDigits: 0 })
        .format(table.pricePerSeat / 100);

  const reveal = index < 4 ? `rise-in rise-in-delay-${index + 1}` : "rise-in";

  return (
    <Link
      href={`/tables/${table.id}`}
      className={`group relative block overflow-hidden rounded-3xl bg-card border border-border hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5 ${reveal}`}
    >
      <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 hero-ambient bg-elevated" />
        )}
        {/* Bottom-up scrim so headline stays legible on bright photos */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

        {/* Top-leading badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <EnergyMark level={table.energyLevel} />
          {table.isLgbtqia && (
            <div className="inline-flex items-center px-2 py-1.5 rounded-full bg-black/50 border border-white/25">
              <PrideFlag size={14} rounded={3} />
            </div>
          )}
        </div>

        {/* Top-trailing seats pill */}
        <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 border border-white/20 text-[11px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          {table.availableSeats}/{table.totalSeats} OPEN
        </div>

        {/* Bottom content stack */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="eyebrow text-white/80 mb-2">{table.occasionType.replace(/_/g, " ")}</div>
          <h3 className="font-display text-2xl sm:text-3xl leading-[0.95] mb-1">{headline}</h3>
          {subtitle && (
            <div className="text-sm text-white/75 mb-3">at {subtitle}</div>
          )}
          <div className="flex items-end justify-between mt-3">
            <div className="text-[10px] font-bold tracking-[0.18em] text-white/85 uppercase">
              {dateLabel}
            </div>
            <div className="text-right">
              <div className="font-display text-2xl">{priceLabel}</div>
              <div className="text-[9px] font-bold tracking-[0.16em] text-white/70 uppercase">
                {table.pricePerSeat === 0 ? "RSVP" : "per seat"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EnergyMark({ level }: { level: TableModel["energyLevel"] }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/55 border border-white/25 text-[10px] font-extrabold tracking-[0.14em] text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      {level}
    </div>
  );
}

function pickPhoto(table: TableModel): string | null {
  if (table.photoUrls?.[0]) return table.photoUrls[0];
  if (table.hasVenuePhoto && table.venueId) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${base}/venues/${table.venueId}/photo?width=900`;
  }
  return null;
}

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d
      .toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      .replace(",", " ·");
  } catch {
    return "";
  }
}
