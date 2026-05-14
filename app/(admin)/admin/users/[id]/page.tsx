import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Heading } from "../../page";
import UserRowActions from "@/components/admin/UserRowActions";
import TrustScoreAdjuster from "@/components/admin/TrustScoreAdjuster";

interface AdminUserDetail {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
    birthDate: string | null;
    trustScore: number;
    verificationStatus: string;
    phoneVerifiedAt: string | null;
    emailVerifiedAt: string | null;
    deletedAt: string | null;
    bannedAt: string | null;
    createdAt: string;
    updatedAt: string;
    appleSubjectId: string | null;
    preferredLanguage: string | null;
    vibeProfile: {
      musicTastes: string[];
      occasionTypes: string[];
      energyLevel: string;
      budgetTier: string;
      languages: string[];
      bio: string | null;
    } | null;
  };
  stats: {
    tablesHosted: number;
    reportsAgainst: number;
    joinsApproved: number;
  };
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, stats } = await apiFetch<AdminUserDetail>(`/admin/users/${id}`);

  const isDeleted = !!user.deletedAt;
  const isBanned = !!user.bannedAt && !isDeleted;
  const provider = user.appleSubjectId ? "Apple" : "Email / password";

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <Link href="/admin/users" className="inline-block text-xs text-fg-tertiary hover:text-fg-secondary">
        ← All users
      </Link>

      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center text-2xl font-bold">
              {user.firstName.charAt(0)}
            </div>
          )}
          <div>
            <Heading
              title={`${user.firstName} ${user.lastName}`}
              sub={
                isDeleted ? "Deleted account — anonymised" :
                isBanned ? `Banned ${user.bannedAt ? new Date(user.bannedAt).toLocaleString() : ""} — sign-in blocked` :
                user.email
              }
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Pill ok={user.verificationStatus === "APPROVED"} label="ID verified" />
              <Pill ok={!!user.phoneVerifiedAt} label="Phone verified" />
              <Pill ok={!!user.emailVerifiedAt} label="Email verified" />
              {isDeleted && <span className="px-2 py-0.5 rounded-md bg-error/15 text-error text-[10px] font-bold tracking-wide">DELETED</span>}
              {isBanned && <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning text-[10px] font-bold tracking-wide">BANNED</span>}
            </div>
          </div>
        </div>
        <UserRowActions userId={user.id} isDeleted={isDeleted} isBanned={isBanned} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="TRUST SCORE" value={user.trustScore} />
        <Stat label="TABLES HOSTED" value={stats.tablesHosted} />
        <Stat label="JOINS APPROVED" value={stats.joinsApproved} accent={stats.reportsAgainst > 0 ? undefined : undefined} />
      </div>

      {stats.reportsAgainst > 0 && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 px-5 py-4 text-sm text-warning">
          <span className="font-bold">{stats.reportsAgainst}</span>{" "}
          report{stats.reportsAgainst === 1 ? " has" : "s have"} been filed against this user.{" "}
          <Link href={`/admin/reports?reportedId=${user.id}`} className="underline">View reports →</Link>
        </div>
      )}

      <Section title="Trust score">
        <TrustScoreAdjuster userId={user.id} current={user.trustScore} />
      </Section>

      <Section title="Identity">
        <DL>
          <DT label="Email">{user.email}</DT>
          <DT label="Phone">{user.phone ?? "—"}</DT>
          <DT label="Birth date">{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "—"}</DT>
          <DT label="Provider">{provider}</DT>
          <DT label="Preferred language">{user.preferredLanguage ?? "—"}</DT>
          <DT label="Created">{new Date(user.createdAt).toLocaleString()}</DT>
          <DT label="Updated">{new Date(user.updatedAt).toLocaleString()}</DT>
        </DL>
      </Section>

      {user.vibeProfile && (
        <Section title="Vibe profile">
          <DL>
            <DT label="Music">{user.vibeProfile.musicTastes.join(", ") || "—"}</DT>
            <DT label="Occasions">{user.vibeProfile.occasionTypes.join(", ") || "—"}</DT>
            <DT label="Energy">{user.vibeProfile.energyLevel}</DT>
            <DT label="Budget tier">{user.vibeProfile.budgetTier}</DT>
            <DT label="Languages">{user.vibeProfile.languages.join(", ") || "—"}</DT>
            <DT label="Bio">{user.vibeProfile.bio ?? "—"}</DT>
          </DL>
        </Section>
      )}
    </div>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok
      ? "px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold tracking-wide"
      : "px-2 py-0.5 rounded-md bg-elevated text-fg-tertiary text-[10px] font-bold tracking-wide"}>
      {ok ? "✓ " : "— "}{label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="text-[10px] tracking-[2px] font-bold text-fg-tertiary">{label}</div>
      <div className="text-3xl font-bold mt-2 tracking-tight">{value.toLocaleString()}</div>
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

function DL({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">{children}</dl>;
}

function DT({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] tracking-wide font-semibold text-fg-tertiary">{label}</dt>
      <dd className="mt-1 text-fg-secondary break-words">{children}</dd>
    </div>
  );
}
