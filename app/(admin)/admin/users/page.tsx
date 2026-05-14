import { apiFetch } from "@/lib/api";
import { Heading } from "../page";
import UserRowActions from "@/components/admin/UserRowActions";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  trustScore: number;
  verificationStatus: string;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

interface UsersResp {
  rows: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "ACTIVE";
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { rows, total } = await apiFetch<UsersResp>("/admin/users", {
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
        title="Users"
        sub={`${total.toLocaleString()} match this filter.`}
      />

      <form method="get" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 max-w-md px-4 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-fg-tertiary focus:outline-none focus:border-border-strong"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="DELETED">Deleted / banned</option>
          <option value="ALL">All</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 bg-fg text-obsidian rounded-lg text-sm font-semibold"
        >
          Search
        </button>
      </form>

      <div className="mt-6 border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-elevated/50">
            <tr className="text-left text-[11px] tracking-[1.5px] font-bold text-fg-tertiary">
              <th className="px-4 py-3">USER</th>
              <th className="px-4 py-3">EMAIL</th>
              <th className="px-4 py-3">TRUST</th>
              <th className="px-4 py-3">VERIFIED</th>
              <th className="px-4 py-3">JOINED</th>
              <th className="px-4 py-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-elevated/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-xs">
                        {u.firstName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{u.firstName} {u.lastName}</div>
                      {u.deletedAt && (
                        <div className="text-[11px] text-fg-tertiary">deleted</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-fg-secondary text-xs">{u.email}</td>
                <td className="px-4 py-3">{u.trustScore}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={pillClass(u.verificationStatus === "APPROVED")}>
                    ID {u.verificationStatus === "APPROVED" ? "✓" : "—"}
                  </span>{" "}
                  <span className={pillClass(!!u.phoneVerifiedAt)}>📱</span>{" "}
                  <span className={pillClass(!!u.emailVerifiedAt)}>✉</span>
                </td>
                <td className="px-4 py-3 text-fg-tertiary text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserRowActions userId={u.id} isDeleted={!!u.deletedAt} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-fg-tertiary text-sm">
                No users match this filter.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} limit={limit} page={page} q={q} status={status} />
    </div>
  );
}

function pillClass(ok: boolean): string {
  return ok
    ? "inline-block px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold"
    : "inline-block px-2 py-0.5 rounded-md bg-elevated text-fg-tertiary text-[10px] font-bold";
}

function Pagination({ total, limit, page, q, status }: { total: number; limit: number; page: number; q: string; status: string }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  const qs = (p: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), status, page: String(p) }).toString()}`;
  return (
    <div className="mt-6 flex items-center justify-between text-xs text-fg-secondary">
      <div>Page {page} of {totalPages}</div>
      <div className="flex gap-2">
        {page > 1 && <a className="px-3 py-1.5 border border-border rounded-md hover:bg-elevated" href={qs(page - 1)}>← Prev</a>}
        {page < totalPages && <a className="px-3 py-1.5 border border-border rounded-md hover:bg-elevated" href={qs(page + 1)}>Next →</a>}
      </div>
    </div>
  );
}
