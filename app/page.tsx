import { apiFetch } from "@/lib/api";
import type { TableModel } from "@/lib/types";
import TableCard from "@/components/TableCard";
import FilterStrip from "@/components/FilterStrip";
import OpenInAppCta from "@/components/OpenInAppCta";

interface SearchParams {
  city?: string;
  chip?: "all" | "tonight" | "queer" | "premium" | "chill" | "wild";
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const chip = sp.chip ?? "all";

  // Translate the chip into the same query params DiscoverViewModel sends.
  const query: Record<string, string | undefined> = { city: sp.city || "Paris" };
  if (chip === "tonight") query.tonight = "true";
  if (chip === "premium") query.budgetTier = "PREMIUM";
  if (chip === "chill") query.energyLevel = "CHILL";
  if (chip === "wild") query.energyLevel = "WILD";
  if (chip === "queer") query.isLgbtqia = "true";

  let tables: TableModel[] = [];
  let loadError: string | null = null;
  try {
    tables = await apiFetch<TableModel[]>("/tables", { query, authed: false });
  } catch (e) {
    loadError = (e as Error).message ?? "Couldn't load tables.";
  }

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-5 sm:px-8 mt-2 sm:mt-6">
        <FilterStrip selected={chip} city={sp.city || "Paris"} />
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 mt-8">
        {loadError ? (
          <ErrorState message={loadError} />
        ) : tables.length === 0 ? (
          <EmptyState chip={chip} />
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t, i) => (
              <TableCard key={t.id} table={t} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 mt-16">
        <OpenInAppCta />
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className="absolute inset-0 hero-ambient" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-24 pb-10 sm:pb-16">
        <div className="eyebrow rise-in">Paris · tonight & beyond</div>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[0.92] tracking-tight rise-in rise-in-delay-1">
          Find your table.<br />
          <span className="text-fg-secondary">Half the price, twice the night.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-fg-secondary rise-in rise-in-delay-2">
          Joïn matches you with people heading to the same bar, club or
          restaurant — share a table, split the bill, skip the queue.
        </p>
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-border bg-elevated p-8 sm:p-12 text-center">
      <div className="eyebrow text-error mb-2">Couldn&apos;t load tables</div>
      <p className="text-fg-secondary text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ chip }: { chip: string }) {
  const { title, sub } = emptyCopy(chip);
  return (
    <div className="rounded-3xl border border-border bg-elevated p-10 sm:p-14 text-center max-w-2xl mx-auto">
      <div className="eyebrow mb-3">Nothing here yet</div>
      <h3 className="font-display text-3xl mb-3">{title}</h3>
      <p className="text-fg-secondary">{sub}</p>
    </div>
  );
}

function emptyCopy(chip: string): { title: string; sub: string } {
  switch (chip) {
    case "tonight":
      return { title: "No tables for tonight.", sub: "Try a different vibe — or check back closer to evening." };
    case "queer":
      return { title: "No queer events right now.", sub: "Reset filters or check back soon — organizers list throughout the week." };
    case "premium":
      return { title: "No premium tables right now.", sub: "Try Chill or All to widen the search." };
    default:
      return { title: "No tables in Paris yet.", sub: "Joïn is just getting started — be among the first hosts to list a table." };
  }
}
