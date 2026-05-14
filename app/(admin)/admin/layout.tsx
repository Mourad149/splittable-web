import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

/// Admin shell. Two-pane: left rail with section nav, right pane is
/// whatever child page renders. Auth-gated server-side: any request
/// that doesn't survive a probe call to /admin/stats (which requires
/// the backend's allow-list) bounces to /admin/denied.
///
/// Putting the gate here means every nested page inherits it for
/// free — child pages only have to fetch data.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");

  // Probe: if the backend's allow-list rejects us, the response is
  // a 403. Everything else (including ok) means the user is an admin.
  try {
    await apiFetch("/admin/stats");
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      redirect("/admin/denied");
    }
    throw err;
  }

  return (
    <div className="min-h-screen flex bg-obsidian">
      <aside className="relative w-56 shrink-0 border-r border-border bg-elevated/30">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary">ADMIN</div>
          <div className="font-display text-2xl tracking-tight mt-1">
            jo<span className="text-fg-secondary">ï</span>n
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4 text-sm">
          <NavLink href="/admin"        label="Dashboard" />
          <NavLink href="/admin/users"  label="Users" />
          <NavLink href="/admin/tables" label="Tables" />
          <NavLink href="/admin/reports" label="Reports" />
        </nav>
        <div className="absolute bottom-4 left-3 right-3 text-[11px] text-fg-tertiary px-2">
          {me.firstName} {me.lastName}
          <div className="mt-1">{me.email ?? ""}</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-fg-secondary hover:text-fg hover:bg-elevated"
    >
      {label}
    </Link>
  );
}
