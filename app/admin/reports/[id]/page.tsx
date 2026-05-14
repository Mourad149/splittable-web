import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusPill } from "../page";
import ReportStatusActions from "@/components/admin/ReportStatusActions";

interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  trustScore: number;
  deletedAt: string | null;
  createdAt: string;
}

interface TableSummary {
  id: string;
  title: string | null;
  eventDate: string;
  status: string;
  organizerId: string;
  venue: { name: string; city: string } | null;
}

interface MessageSummary {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  note: string | null;
  status: "OPEN" | "REVIEWED" | "ACTIONED" | "DISMISSED";
  createdAt: string;
}

interface DetailResp {
  report: Report;
  reporter: UserSummary | null;
  reported: UserSummary | null;
  tables: TableSummary[];
  messagesByTable: Record<string, MessageSummary[]>;
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await apiFetch<DetailResp>(`/admin/reports/${id}`);

  return (
    <div className="p-8 max-w-5xl space-y-10">
      <div>
        <Link
          href="/admin/reports"
          className="inline-block text-xs text-fg-tertiary hover:text-fg-secondary mb-4"
        >
          ← All reports
        </Link>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl tracking-tight">
              Report · {reasonLabel(data.report.reason)}
            </h1>
            <div className="flex items-center gap-3 mt-3 text-fg-secondary text-sm">
              <StatusPill status={data.report.status} />
              <span>Filed {new Date(data.report.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <ReportStatusActions reportId={data.report.id} status={data.report.status} />
        </div>

        {data.report.note && (
          <div className="mt-5 rounded-lg bg-card border border-border p-4">
            <div className="text-[11px] tracking-[1.5px] font-bold text-fg-tertiary mb-2">REPORTER&apos;S NOTE</div>
            <p className="text-fg-secondary whitespace-pre-wrap">{data.report.note}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserCard label="REPORTER" user={data.reporter} />
        <UserCard label="REPORTED" user={data.reported} />
      </div>

      <section>
        <h2 className="font-display text-2xl mb-2">Shared tables</h2>
        <p className="text-fg-secondary text-sm">
          {data.tables.length === 0
            ? "These two users have no shared table history."
            : `They've crossed paths on ${data.tables.length} table${data.tables.length === 1 ? "" : "s"}. Last 30 messages from each are below — sender highlighted so reporter / reported attribution is obvious.`}
        </p>

        <div className="mt-5 space-y-6">
          {data.tables.map((t) => {
            const msgs = data.messagesByTable[t.id] ?? [];
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.title ?? t.venue?.name ?? "Untitled table"}</div>
                    <div className="text-xs text-fg-tertiary">
                      {t.venue?.name ?? ""}
                      {t.venue?.name ? " · " : ""}
                      {new Date(t.eventDate).toLocaleString()}
                      {" · "}{t.status}
                    </div>
                  </div>
                  <Link
                    href={`/admin/tables?q=${encodeURIComponent(t.title ?? t.venue?.name ?? "")}`}
                    className="text-[11px] tracking-wide font-bold text-fg-tertiary hover:text-fg"
                  >
                    OPEN →
                  </Link>
                </div>
                <div className="px-5 py-4 max-h-96 overflow-y-auto space-y-2">
                  {msgs.length === 0 && (
                    <div className="text-xs text-fg-tertiary">No messages on this table.</div>
                  )}
                  {msgs.slice().reverse().map((m) => {
                    const who =
                      m.senderId === data.report.reporterId
                        ? { label: "REPORTER", cls: "bg-warning/20 text-warning" }
                        : m.senderId === data.report.reportedId
                          ? { label: "REPORTED", cls: "bg-error/20 text-error" }
                          : { label: "OTHER", cls: "bg-elevated text-fg-tertiary" };
                    return (
                      <div key={m.id} className="flex items-start gap-3 text-sm">
                        <span className={`shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${who.cls}`}>
                          {who.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-fg-secondary whitespace-pre-wrap break-words">{m.content}</div>
                          <div className="text-[10px] text-fg-tertiary mt-0.5">
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function UserCard({ label, user }: { label: string; user: UserSummary | null }) {
  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">{label}</div>
        <div className="mt-3 text-fg-tertiary">(user not found)</div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">{label}</div>
      <div className="mt-3 flex items-center gap-3">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center text-base">
            {user.firstName.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-display text-lg">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-fg-tertiary">{user.deletedAt ? "deleted" : user.email}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-[10px] tracking-wider font-bold text-fg-tertiary">TRUST</div>
          <div className="text-fg mt-0.5">{user.trustScore}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-wider font-bold text-fg-tertiary">JOINED</div>
          <div className="text-fg mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <Link
        href={`/admin/users?q=${encodeURIComponent(user.email)}`}
        className="inline-block mt-4 text-[11px] tracking-wide font-bold text-fg-tertiary hover:text-fg"
      >
        OPEN PROFILE →
      </Link>
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
