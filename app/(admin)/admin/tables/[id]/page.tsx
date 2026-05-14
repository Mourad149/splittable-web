import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Heading } from "../../page";
import TableRowActions from "@/components/admin/TableRowActions";

interface AdminTableDetail {
  table: {
    id: string;
    title: string | null;
    description: string | null;
    eventDate: string;
    endDate: string | null;
    status: string;
    totalSeats: number;
    availableSeats: number;
    pricePerSeat: number;
    currency: string;
    occasionType: string;
    energyLevel: string;
    budgetTier: string;
    inclusions: string[];
    musicTags: string[];
    isLgbtqia: boolean;
    payoutMode: string;
    createdAt: string;
    venue: { name: string; city: string; address: string | null } | null;
    organizer: AdminUserMini | null;
    joinRequests: Array<{
      id: string;
      userId: string;
      status: string;
      seatsWanted: number;
      message: string | null;
      paymentAuthorizedAt: string | null;
      createdAt: string;
      user: AdminUserMini | null;
    }>;
  };
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: AdminUserMini | null;
  }>;
}

interface AdminUserMini {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  trustScore?: number;
  deletedAt: string | null;
}

export default async function AdminTableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { table, messages } = await apiFetch<AdminTableDetail>(`/admin/tables/${id}`);
  const date = new Date(table.eventDate);

  const groupedJRs = {
    APPROVED:   table.joinRequests.filter((j) => j.status === "APPROVED"),
    PENDING:    table.joinRequests.filter((j) => j.status === "PENDING"),
    WAITLISTED: table.joinRequests.filter((j) => j.status === "WAITLISTED"),
    DECLINED:   table.joinRequests.filter((j) => j.status === "DECLINED"),
    CANCELLED:  table.joinRequests.filter((j) => j.status === "CANCELLED"),
  };
  const tableTitle = table.title || table.venue?.name || "Untitled table";

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <Link href="/admin/tables" className="inline-block text-xs text-fg-tertiary hover:text-fg-secondary">
        ← All tables
      </Link>

      <div className="flex items-start justify-between gap-6">
        <div>
          <Heading title={tableTitle} sub={`${table.status} · created ${new Date(table.createdAt).toLocaleDateString()}`} />
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Pill label={table.occasionType} />
            <Pill label={table.energyLevel.toLowerCase()} />
            <Pill label={table.budgetTier.toLowerCase()} />
            <Pill label={table.payoutMode} />
            {table.isLgbtqia && <Pill label="🏳️‍🌈 LGBTQIA+" />}
          </div>
        </div>
        <TableRowActions tableId={table.id} title={tableTitle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Stat label="DATE" value={date.toLocaleDateString()} sub={date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
        <Stat label="SEATS" value={`${table.totalSeats - table.availableSeats} / ${table.totalSeats}`} sub={`${table.availableSeats} free`} />
        <Stat label="PRICE" value={table.pricePerSeat === 0 ? "Free" : `${(table.pricePerSeat / 100).toFixed(0)} ${table.currency}`} />
        <Stat label="JOIN REQUESTS" value={table.joinRequests.length.toString()} sub={`${groupedJRs.APPROVED.length} approved`} />
      </div>

      <Section title="Venue">
        <div className="text-sm">
          <div className="font-semibold">{table.venue?.name ?? "—"}</div>
          {table.venue && (
            <div className="text-fg-secondary mt-1">{table.venue.address ?? ""}{table.venue.address && table.venue.city ? ", " : ""}{table.venue.city}</div>
          )}
        </div>
      </Section>

      <Section title="Organizer">
        {table.organizer ? <UserCard user={table.organizer} /> : <span className="text-fg-tertiary text-sm">No organizer</span>}
      </Section>

      {table.description && (
        <Section title="Description">
          <p className="text-sm text-fg-secondary whitespace-pre-wrap">{table.description}</p>
        </Section>
      )}

      {table.inclusions.length > 0 && (
        <Section title="Inclusions">
          <div className="flex flex-wrap gap-1.5">
            {table.inclusions.map((i) => <Pill key={i} label={i} />)}
          </div>
        </Section>
      )}

      <Section title={`Join requests · ${table.joinRequests.length}`}>
        {table.joinRequests.length === 0 ? (
          <p className="text-sm text-fg-tertiary">No join requests yet.</p>
        ) : (
          <div className="space-y-5">
            {(["APPROVED", "PENDING", "WAITLISTED", "DECLINED", "CANCELLED"] as const).map((status) =>
              groupedJRs[status].length > 0 ? (
                <div key={status}>
                  <div className="text-[10px] tracking-[2px] font-bold text-fg-tertiary mb-2">{status} · {groupedJRs[status].length}</div>
                  <div className="space-y-2">
                    {groupedJRs[status].map((jr) => (
                      <div key={jr.id} className="flex items-start justify-between gap-3 rounded-lg bg-elevated/40 border border-border px-3 py-2.5">
                        {jr.user ? <UserCard user={jr.user} compact /> : <span className="text-fg-tertiary text-xs">unknown user</span>}
                        <div className="text-right text-[11px] text-fg-tertiary shrink-0">
                          <div>{jr.seatsWanted} seat{jr.seatsWanted === 1 ? "" : "s"}</div>
                          <div>{new Date(jr.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </Section>

      <Section title={`Recent messages · ${messages.length}`}>
        {messages.length === 0 ? (
          <p className="text-sm text-fg-tertiary">No chat activity yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-semibold">
                  {m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : "Unknown"}
                </span>
                <span className="text-fg-tertiary text-[11px] ml-2">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
                <div className="text-fg-secondary mt-0.5 whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return <span className="px-2 py-0.5 rounded-md bg-elevated text-fg-secondary text-[10px] font-bold tracking-wide">{label}</span>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="text-[10px] tracking-[2px] font-bold text-fg-tertiary">{label}</div>
      <div className="text-xl font-bold mt-2 tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-fg-tertiary mt-1">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[11px] tracking-[2px] font-bold text-fg-tertiary mb-3">{title.toUpperCase()}</h2>
      <div className="rounded-xl bg-card border border-border p-5">{children}</div>
    </div>
  );
}

function UserCard({ user, compact = false }: { user: AdminUserMini; compact?: boolean }) {
  return (
    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className={compact ? "w-8 h-8 rounded-full object-cover" : "w-10 h-10 rounded-full object-cover"} />
      ) : (
        <div className={`${compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full bg-elevated flex items-center justify-center font-semibold`}>
          {user.firstName.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <div className={`${compact ? "text-sm" : "text-base"} font-semibold truncate`}>
          {user.firstName} {user.lastName}
          {user.deletedAt && <span className="ml-2 text-[10px] text-fg-tertiary font-normal">(deleted)</span>}
        </div>
        <div className="text-[11px] text-fg-tertiary truncate">{user.deletedAt ? "—" : user.email}</div>
      </div>
    </Link>
  );
}
