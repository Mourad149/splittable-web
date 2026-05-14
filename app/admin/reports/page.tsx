import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Heading } from "../page";

interface ReportRow {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  note: string | null;
  status: "OPEN" | "REVIEWED" | "ACTIONED" | "DISMISSED";
  createdAt: string;
  reporter: { id: string; firstName: string; lastName: string; email: string; deletedAt: string | null } | null;
  reported: { id: string; firstName: string; lastName: string; email: string; deletedAt: string | null } | null;
}

interface ReportsResp {
  rows: ReportRow[];
  total: number;
  limit: number;
  offset: number;
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const STATUS_OPTIONS = ["OPEN", "REVIEWED", "ACTIONED", "DISMISSED", "ALL"] as const;

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status ?? "OPEN";
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { rows, total } = await apiFetch<ReportsResp>("/admin/reports", {
    query: { status, limit: String(limit), offset: String(offset) },
  });

  return (
    <div className="p-8">
      <Heading
        title="Reports"
        sub={`${total.toLocaleString()} reports in the ${status.toLowerCase()} queue.`}
      />

      <div className="mt-6 flex gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${
              status === s
                ? "bg-fg text-obsidian border-fg"
                : "bg-card border-border hover:bg-elevated text-fg-secondary"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-elevated/50">
            <tr className="text-left text-[11px] tracking-[1.5px] font-bold text-fg-tertiary">
              <th className="px-4 py-3">REPORTER</th>
              <th className="px-4 py-3">REPORTED</th>
              <th className="px-4 py-3">REASON</th>
              <th className="px-4 py-3">STATUS</th>
              <th className="px-4 py-3">FILED</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-elevated/30">
                <td className="px-4 py-3">
                  <UserCell user={r.reporter} />
                </td>
                <td className="px-4 py-3">
                  <UserCell user={r.reported} />
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="font-semibold">{reasonLabel(r.reason)}</span>
                  {r.note && <div className="text-fg-tertiary mt-0.5 line-clamp-2 max-w-xs">{r.note}</div>}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3 text-fg-tertiary text-xs">
                  {new Date(r.createdAt).toLocaleDateString()}
                  <div className="text-[10px]">
                    {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wide bg-fg text-obsidian"
                  >
                    OPEN
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-fg-tertiary text-sm">
                No reports.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserCell({ user }: { user: { firstName: string; lastName: string; email: string; deletedAt: string | null } | null }) {
  if (!user) return <span className="text-fg-tertiary text-xs">(unknown)</span>;
  return (
    <div>
      <div className="font-semibold">{user.firstName} {user.lastName}</div>
      <div className="text-[11px] text-fg-tertiary">
        {user.deletedAt ? "deleted" : user.email}
      </div>
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

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN:      "bg-warning/15 text-warning",
    REVIEWED:  "bg-elevated text-fg-secondary",
    ACTIONED:  "bg-error/15 text-error",
    DISMISSED: "bg-success/15 text-success",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${map[status] ?? "bg-elevated text-fg-secondary"}`}>
      {status}
    </span>
  );
}
