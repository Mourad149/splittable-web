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
  // Two requests in parallel — stats for the KPI strip, recent reports
  // for the triage panel (which now anchors the page as the primary
  // surface). Both already exist on the backend so this stays a single
  // round-trip pair.
  const [stats, recentReports] = await Promise.all([
    apiFetch<AdminStats>("/admin/stats"),
    apiFetch<{ rows: ReportRow[] }>("/admin/reports", { query: { status: "OPEN", limit: "6" } })
      .then((r) => r.rows)
      .catch(() => []),
  ]);

  const snapshotAt = new Date().toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="p-8 max-w-5xl space-y-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Dashboard</h1>
          <p className="text-fg-secondary mt-2 max-w-prose">
            Platform health, current moderation queue.
          </p>
        </div>
        <SnapshotBadge at={snapshotAt} />
      </header>

      {stats.openReports > 0 && (
        <AlertRibbon
          count={stats.openReports}
          href="/admin/reports?status=OPEN"
        />
      )}

      <section aria-labelledby="kpi-section">
        <h2 id="kpi-section" className="sr-only">Key metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl bg-border overflow-hidden">
          <Kpi label="Active users"    value={stats.activeUsers} />
          <Kpi label="Signups · 24h"   value={stats.signups24h} accent="success" />
          <Kpi label="Upcoming tables" value={stats.openTables} />
          <Kpi
            label="Open reports"
            value={stats.openReports}
            accent={stats.openReports > 0 ? "warning" : undefined}
          />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">
            OPEN REPORTS QUEUE
          </div>
          <Link
            href="/admin/reports?status=OPEN"
            className="text-[11px] tracking-[2px] font-bold text-fg-tertiary hover:text-fg transition-colors cursor-pointer"
          >
            VIEW ALL →
          </Link>
        </div>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {recentReports.length === 0 ? (
            <EmptyReports />
          ) : (
            <ul>
              {recentReports.map((r, i) => (
                <li key={r.id} className={i === 0 ? "" : "border-t border-border"}>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-elevated/40 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 flex items-center gap-4">
                      <ReasonGlyph reason={r.reason} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {reasonLabel(r.reason)}
                        </div>
                        <div className="text-[12px] text-fg-tertiary mt-0.5 truncate">
                          {r.reporter ? `${r.reporter.firstName} ${r.reporter.lastName.charAt(0)}.` : "Unknown"}
                          <span className="text-fg-tertiary/50 mx-1.5">→</span>
                          {r.reported ? `${r.reported.firstName} ${r.reported.lastName.charAt(0)}.` : "Unknown"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <RelativeTime iso={r.createdAt} />
                      <span className="text-fg-tertiary group-hover:text-fg transition-colors text-sm">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Building blocks ────────────────────────────────────────────────

function SnapshotBadge({ at }: { at: string }) {
  return (
    <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-wide text-fg-tertiary border border-border rounded-full px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden />
      <span className="font-mono">{at}</span>
    </div>
  );
}

function AlertRibbon({ count, href }: { count: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-warning/40 bg-warning/[0.06] px-5 py-4 hover:bg-warning/[0.1] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <span className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 16 16" className="w-5 h-5 text-warning" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 2.5 14.5 13H1.5L8 2.5Z" />
            <path d="M8 6.5v3" />
            <path d="M8 11.5v.01" />
          </svg>
        </span>
        <div>
          <div className="text-sm font-semibold">
            {count} {count === 1 ? "report" : "reports"} awaiting triage
          </div>
          <div className="text-[12px] text-fg-secondary mt-0.5">
            Move them through OPEN → REVIEWED → ACTIONED / DISMISSED.
          </div>
        </div>
      </div>
      <span className="text-[11px] tracking-[2px] font-bold text-warning group-hover:translate-x-0.5 transition-transform">
        TRIAGE →
      </span>
    </Link>
  );
}

function Kpi({
  label, value, accent,
}: {
  label: string;
  value: number;
  accent?: "success" | "warning" | "error";
}) {
  // Single-row strip: rounded card wrapper, gap-px exposes the border
  // as hairline separators between cells. Each KPI gets a thin accent
  // bar at the top when its number is hot (warning / success).
  const accentBar =
    accent === "warning" ? "bg-warning" :
    accent === "success" ? "bg-success" :
    accent === "error"   ? "bg-error"   :
    "bg-transparent";

  return (
    <div className="relative bg-card px-5 py-5">
      <div className={`absolute inset-x-5 top-0 h-px ${accentBar}`} aria-hidden />
      <div className="text-[10px] tracking-[2px] font-bold text-fg-tertiary">
        {label.toUpperCase()}
      </div>
      <div className="text-3xl font-bold mt-2 tracking-tight tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function EmptyReports() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-elevated mb-4">
        <svg viewBox="0 0 16 16" className="w-5 h-5 text-fg-tertiary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 13V3l6 .5v9.5" />
          <path d="M3 3l5-1 1 1.5" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-fg">All clear</div>
      <div className="text-[12px] text-fg-tertiary mt-1">
        No reports in the open queue. Check back, or browse the full archive.
      </div>
      <Link
        href="/admin/reports?status=ALL"
        className="inline-block mt-4 text-[11px] tracking-[2px] font-bold text-fg-secondary hover:text-fg transition-colors cursor-pointer"
      >
        VIEW ARCHIVE →
      </Link>
    </div>
  );
}

function ReasonGlyph({ reason }: { reason: string }) {
  // Color-coded square glyph per reason — gives the row a quick
  // scanning hook so a moderator can sort the queue by reason at a
  // glance without reading the label.
  const tone: Record<string, { bg: string; fg: string; letter: string }> = {
    HARASSMENT:   { bg: "bg-error/15",   fg: "text-error",   letter: "H" },
    FAKE_PROFILE: { bg: "bg-warning/15", fg: "text-warning", letter: "F" },
    SPAM:         { bg: "bg-elevated",   fg: "text-fg-secondary", letter: "S" },
    NO_SHOW:      { bg: "bg-elevated",   fg: "text-fg-secondary", letter: "N" },
    OTHER:        { bg: "bg-elevated",   fg: "text-fg-secondary", letter: "•" },
  };
  const t = tone[reason] ?? tone.OTHER;
  return (
    <span
      className={`w-9 h-9 rounded-lg ${t.bg} ${t.fg} flex items-center justify-center text-[13px] font-bold shrink-0`}
      aria-hidden
    >
      {t.letter}
    </span>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  let label: string;
  if (minutes < 1)         label = "just now";
  else if (minutes < 60)   label = `${minutes}m ago`;
  else if (minutes < 1440) label = `${Math.round(minutes / 60)}h ago`;
  else                     label = `${Math.round(minutes / 1440)}d ago`;
  return (
    <span className="text-[11px] text-fg-tertiary font-mono tabular-nums">
      {label}
    </span>
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
