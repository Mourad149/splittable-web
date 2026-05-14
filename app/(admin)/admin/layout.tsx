import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import AdminNavLink from "@/components/admin/AdminNavLink";

/// Admin shell. Left rail with iconography + active-state, right pane
/// is whatever child page renders. Auth-gated server-side via a probe
/// call to /admin/stats — any 403 redirects to /admin/denied.
///
/// The probe doubles as a cheap counter: we ask for the open-reports
/// count alongside, so the sidebar can render a "you have N pending
/// triage tasks" badge without an extra round-trip.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");

  let openReports = 0;
  try {
    const stats = await apiFetch<{ openReports: number }>("/admin/stats");
    openReports = stats.openReports ?? 0;
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      redirect("/admin/denied");
    }
    throw err;
  }

  return (
    <div className="min-h-screen flex bg-obsidian">
      <aside className="relative w-60 shrink-0 border-r border-border bg-elevated/30 flex flex-col">
        <div className="px-5 py-5 border-b border-border flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="join"
            width={36}
            height={36}
            className="rounded-md shrink-0"
            priority
          />
          <div>
            <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">ADMIN</div>
            <div className="font-display text-xl tracking-tight">
              jo<span className="text-fg-secondary">ï</span>n
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-4 text-sm">
          <AdminNavLink href="/admin"         label="Dashboard" icon="grid"  exact />
          <AdminNavLink href="/admin/users"   label="Users"     icon="users" />
          <AdminNavLink href="/admin/tables"  label="Tables"    icon="rows"  />
          <AdminNavLink href="/admin/reports" label="Reports"   icon="flag"  badge={openReports} />
        </nav>

        <div className="mt-auto px-5 py-4 border-t border-border">
          <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary mb-1">SIGNED IN</div>
          <div className="text-sm font-semibold">{me.firstName} {me.lastName}</div>
          <div className="text-[11px] text-fg-tertiary mt-0.5 truncate">{me.email ?? ""}</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
