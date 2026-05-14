import { notFound, redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { TableModel } from "@/lib/types";
import OpenInAppCta from "@/components/OpenInAppCta";
import PrideFlag from "@/components/PrideFlag";

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) redirect(`/login?next=/tables/${id}`);

  let table: TableModel;
  try {
    table = await apiFetch<TableModel>(`/tables/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const dateLong = formatLongDate(table.eventDate);
  const headline = table.title || table.venue?.name || "Table";
  const photo = pickPhoto(table);
  const priceLabel = table.pricePerSeat === 0
    ? "Free"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: table.currency || "EUR", maximumFractionDigits: 0 })
        .format(table.pricePerSeat / 100);

  return (
    <article>
      <Hero photo={photo} table={table} />

      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-12 sm:-mt-16 relative z-10">
        <div className="rounded-3xl border border-border bg-elevated p-6 sm:p-10">
          <div className="eyebrow">{table.occasionType.replace(/_/g, " ")}</div>
          <h1 className="font-display text-4xl sm:text-5xl mt-2 leading-[0.95] flex items-center gap-3">
            <span>{headline}</span>
            {table.isLgbtqia && <PrideFlag size={28} rounded={5} />}
          </h1>
          {table.title && table.venue?.name && (
            <p className="text-fg-secondary mt-2 text-lg">at {table.venue.name}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-8 rounded-2xl overflow-hidden bg-border">
            <Stat label="When" value={dateLong} />
            <Stat label="Seats" value={`${table.availableSeats}/${table.totalSeats}`} sub="open" />
            <Stat label="Energy" value={table.energyLevel} />
            <Stat label="Per seat" value={priceLabel} sub={table.pricePerSeat === 0 ? "RSVP" : undefined} />
          </div>

          {table.description && (
            <section className="mt-10">
              <div className="eyebrow mb-3">About this table</div>
              <p className="text-fg-secondary leading-relaxed whitespace-pre-line">
                {table.description}
              </p>
            </section>
          )}

          {table.inclusions && table.inclusions.length > 0 && (
            <section className="mt-10">
              <div className="eyebrow mb-3">What&apos;s included</div>
              <ul className="flex flex-wrap gap-2">
                {table.inclusions.map((inc) => (
                  <li key={inc} className="px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                    {inc}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {table.organizer && (
            <section className="mt-10">
              <div className="eyebrow mb-3">Hosted by</div>
              <div className="flex items-center gap-4">
                {table.organizer.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={table.organizer.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-border" />
                ) : (
                  <span className="w-14 h-14 rounded-full bg-card grid place-items-center font-display border border-border">
                    {(table.organizer.firstName?.[0] ?? "") + (table.organizer.lastName?.[0] ?? "")}
                  </span>
                )}
                <div>
                  <div className="font-semibold">
                    {table.organizer.firstName} {table.organizer.lastName}
                  </div>
                  <div className="text-xs text-fg-secondary">
                    Trust score {Math.round(table.organizer.trustScore)}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-10">
            <OpenInAppCta
              variant="full"
              reason="Joining locks a seat with Stripe escrow and a Veriff identity check — both live in the iOS app."
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function Hero({ photo, table }: { photo: string | null; table: TableModel }) {
  return (
    <header className="relative h-[44vh] sm:h-[60vh] min-h-[320px] overflow-hidden border-b border-border">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 hero-ambient bg-elevated" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
      <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-5 sm:px-8">
        <div className="eyebrow text-white/85">{table.venue?.city || "Paris"}</div>
      </div>
    </header>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-elevated p-5">
      <div className="eyebrow mb-1">{label}</div>
      <div className="font-display text-xl">{value}</div>
      {sub && <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-fg-tertiary mt-1">{sub}</div>}
    </div>
  );
}

function pickPhoto(table: TableModel): string | null {
  if (table.photoUrls?.[0]) return table.photoUrls[0];
  if (table.hasVenuePhoto && table.venueId) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${base}/venues/${table.venueId}/photo?width=1600`;
  }
  return null;
}

function formatLongDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
