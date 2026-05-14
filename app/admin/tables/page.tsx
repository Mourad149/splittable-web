import { apiFetch } from "@/lib/api";
import { Heading } from "../page";
import TableRowActions from "@/components/admin/TableRowActions";

interface AdminTable {
  id: string;
  title: string | null;
  eventDate: string;
  status: string;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  venue: { name: string; city: string } | null;
  organizer: { id: string; firstName: string; lastName: string; email: string } | null;
  _count: { joinRequests: number };
}

interface TablesResp {
  rows: AdminTable[];
  total: number;
  limit: number;
  offset: number;
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminTablesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "UPCOMING";
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { rows, total } = await apiFetch<TablesResp>("/admin/tables", {
    query: {
      q: q || undefined,
      status,
      limit: String(limit),
      offset: String(offset),
    },
  });

  return (
    <div className="p-8">
      <Heading
        title="Tables"
        sub={`${total.toLocaleString()} match this filter.`}
      />

      <form method="get" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title or venue…"
          className="flex-1 max-w-md px-4 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-fg-tertiary focus:outline-none focus:border-border-strong"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm"
        >
          <option value="UPCOMING">Upcoming</option>
          <option value="PAST">Past</option>
          <option value="ALL">All</option>
        </select>
        <button type="submit" className="px-4 py-2.5 bg-fg text-obsidian rounded-lg text-sm font-semibold">
          Search
        </button>
      </form>

      <div className="mt-6 border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-elevated/50">
            <tr className="text-left text-[11px] tracking-[1.5px] font-bold text-fg-tertiary">
              <th className="px-4 py-3">TABLE</th>
              <th className="px-4 py-3">VENUE</th>
              <th className="px-4 py-3">ORGANIZER</th>
              <th className="px-4 py-3">DATE</th>
              <th className="px-4 py-3">SEATS</th>
              <th className="px-4 py-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const date = new Date(t.eventDate);
              return (
                <tr key={t.id} className="border-t border-border hover:bg-elevated/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{t.title ?? "—"}</div>
                    <div className="text-[11px] text-fg-tertiary">{t.status}</div>
                  </td>
                  <td className="px-4 py-3 text-fg-secondary text-xs">
                    {t.venue?.name ?? "—"}
                    {t.venue && <div className="text-[10px] text-fg-tertiary">{t.venue.city}</div>}
                  </td>
                  <td className="px-4 py-3 text-fg-secondary text-xs">
                    {t.organizer ? `${t.organizer.firstName} ${t.organizer.lastName}` : "—"}
                    {t.organizer && <div className="text-[10px] text-fg-tertiary">{t.organizer.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-fg-secondary text-xs">
                    {date.toLocaleDateString()}
                    <div className="text-[10px] text-fg-tertiary">
                      {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.totalSeats - t.availableSeats} / {t.totalSeats}
                    <div className="text-[10px] text-fg-tertiary">{t._count.joinRequests} requests</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TableRowActions tableId={t.id} title={t.title ?? t.venue?.name ?? "this table"} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-fg-tertiary text-sm">
                No tables match this filter.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="mt-6 flex items-center justify-between text-xs text-fg-secondary">
          <div>Page {page} of {Math.ceil(total / limit)}</div>
          <div className="flex gap-2">
            {page > 1 && <a className="px-3 py-1.5 border border-border rounded-md hover:bg-elevated" href={`?${new URLSearchParams({ ...(q ? { q } : {}), status, page: String(page - 1) })}`}>← Prev</a>}
            {page * limit < total && <a className="px-3 py-1.5 border border-border rounded-md hover:bg-elevated" href={`?${new URLSearchParams({ ...(q ? { q } : {}), status, page: String(page + 1) })}`}>Next →</a>}
          </div>
        </div>
      )}
    </div>
  );
}
