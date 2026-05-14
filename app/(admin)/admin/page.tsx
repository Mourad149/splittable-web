import { apiFetch } from "@/lib/api";

interface AdminStats {
  activeUsers: number;
  deletedUsers: number;
  openTables: number;
  totalTables: number;
  openReports: number;
  signups24h: number;
}

export default async function AdminDashboardPage() {
  const stats = await apiFetch<AdminStats>("/admin/stats");

  return (
    <div className="p-8 max-w-5xl">
      <Heading title="Dashboard" sub="Platform health at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Tile label="Active users"          value={stats.activeUsers} />
        <Tile label="Deleted / banned"      value={stats.deletedUsers} accent="muted" />
        <Tile label="Signups (24h)"         value={stats.signups24h}   accent="success" />
        <Tile label="Upcoming tables"       value={stats.openTables} />
        <Tile label="Tables (all time)"     value={stats.totalTables}  accent="muted" />
        <Tile label="Open reports"          value={stats.openReports}  accent={stats.openReports > 0 ? "warning" : "muted"} />
      </div>

      <div className="mt-12 text-xs text-fg-tertiary">
        Updated {new Date().toLocaleString()}.
      </div>
    </div>
  );
}

function Tile({
  label, value, accent = "default",
}: { label: string; value: number; accent?: "default" | "muted" | "success" | "warning" | "error" }) {
  const ring =
    accent === "success" ? "ring-1 ring-success/30" :
    accent === "warning" ? "ring-1 ring-warning/40" :
    accent === "error"   ? "ring-1 ring-error/40"   :
    accent === "muted"   ? "" :
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
