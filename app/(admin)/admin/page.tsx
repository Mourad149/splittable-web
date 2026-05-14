import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface AdminStats {
  activeUsers: number;
  deletedUsers: number;
  openTables: number;
  totalTables: number;
  openReports: number;
  signups24h: number;
}

interface ReportRow {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { firstName: string; lastName: string } | null;
  reported: { firstName: string; lastName: string } | null;
}

export default async function AdminDashboardPage() {
  // Two requests in parallel — stats for the tiles, recent reports for
  // the triage panel. Both already exist on the backend so this stays
  // a single round-trip pair.
  const [stats, recentReports] = await Promise.all([
    apiFetch<AdminStats>("/admin/stats"),
    apiFetch<{ rows: ReportRow[] }>("/admin/reports", { query: { status: "OPEN", limit: "5" } })
      .then((r) => r.rows)
      .catch(() => []),
  ]);

  return (
    <div className="p-8 max-w-5xl space-y-12">
      <Heading title="Dashboard" sub="Platform health at a glance." />

      <section>
        <SectionLabel>OVERVIEW</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <Tile label="Active users"      value={stats.activeUsers} />
          <Tile label="Signups (24h)"     value={stats.signups24h} accent="success" />
          <Tile label="Deleted / banned"  value={stats.deletedUsers} accent="muted" />
          <Tile label="Upcoming tables"   value={stats.openTables} />
          <Tile label="Tables (all-time)" value={stats.totalTables} accent="muted" />
          <Tile label="Open reports"      value={stats.openReports} accent={stats.openReports > 0 ? "warning" : "muted"} />
        </div>
      </section>

      <section>
        <SectionLabel>QUICK ACTIONS</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <QuickAction href="/admin/users?status=ACTIVE"  title="Browse users"    sub="Search, filter, moderate" />
          <QuickAction href="/admin/tables?status=UPCOMING" title="Upcoming tables" sub="View, cancel, audit chat" />
          <QuickAction
            href="/admin/reports?status=OPEN"
            title={stats.openReports > 0 ? `Triage reports (${stats.openReports})` : "No open reports"}
            sub={stats.openReports > 0 ? "Move them through the queue" : "All clear"}
            accent={stats.openReports > 0 ? "warning" : undefined}
          />
        </div>
      </section>

      <section>
        <SectionLabel>RECENT REPORTS</SectionLabel>
        <div className="mt-3 rounded-2xl bg-card border border-border overflow-hidden">
          {recentReports.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-fg-tertiary">
              No reports in the open queue.
            </div>
          ) : (
            <ul>
              {recentReports.map((r, i) => (
                <li key={r.id} className={i === 0 ? "" : "border-t border-border"}>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-elevated/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {reasonLabel(r.reason)}
                      </div>
                      <div className="text-[12px] text-fg-tertiary mt-0.5">
                        {r.reporter ? `${r.reporter.firstName} ${r.reporter.lastName.charAt(0)}.` : "Unknown"}
                        {" → "}
                        {r.reported ? `${r.reported.firstName} ${r.reported.lastName.charAt(0)}.` : "Unknown"}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-fg-tertiary shrink-0">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-fg-tertiary">
        Snapshot taken at {new Date().toLocaleString()}.
      </p>
    </div>
  );
}

function reasonLabel(r: string): string {
  switch (r) {
    case "HARASSMENT":   return "Harassment / safety";
    case "FAKE_PROFILE": return "Fake profile";
    case "SPAM":         return "Spam";
    case "NO_SHOW":      return "No-show";
    case "OTHER":        return "Other";
    default: return r;
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">{children}</div>
  );
}

function Tile({
  label, value, accent = "default",
}: { label: string; value: number; accent?: "default" | "muted" | "success" | "warning" | "error" }) {
  const ring =
    accent === "success" ? "ring-1 ring-success/30" :
    accent === "warning" ? "ring-1 ring-warning/40" :
    accent === "error"   ? "ring-1 ring-error/40"   :
    "";
  return (
    <div className={`rounded-2xl bg-card border border-border p-5 ${ring}`}>
      <div className="text-[10px] tracking-[2px] font-bold text-fg-tertiary">
        {label.toUpperCase()}
      </div>
      <div className="text-4xl font-bold mt-3 tracking-tight">{value.toLocaleString()}</div>
    </div>
  );
}

function QuickAction({
  href, title, sub, accent,
}: { href: string; title: string; sub: string; accent?: "warning" }) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl bg-card border border-border p-5 hover:bg-elevated/40 transition-colors block ${
        accent === "warning" ? "ring-1 ring-warning/30" : ""
      }`}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-fg-tertiary mt-1">{sub}</div>
      <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary mt-4 group-hover:text-fg">
        OPEN →
      </div>
    </Link>
  );
}

export function Heading({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        {sub && <p className="text-fg-secondary mt-2 max-w-prose">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
