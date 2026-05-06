import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OpenInAppCta from "@/components/OpenInAppCta";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const initials = `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase();
  const verified = me.verificationStatus === "APPROVED";

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-14 space-y-10">
      <header className="flex items-center gap-5">
        {me.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-border" />
        ) : (
          <span className="w-20 h-20 rounded-full bg-elevated grid place-items-center font-display text-2xl border border-border">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <div className="eyebrow">Member</div>
          <h1 className="font-display text-3xl leading-tight">
            {me.firstName} {me.lastName}
          </h1>
          <p className="text-fg-secondary text-sm truncate">{me.email}</p>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-elevated p-6 sm:p-7">
        <div className="eyebrow mb-2">Identity</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">
              {verified ? "Verified" : "Verify your identity"}
            </h3>
            <p className="text-fg-secondary text-sm mt-1 max-w-md">
              {verified
                ? "You're cleared to join and host tables."
                : "Identity verification happens in the iOS app for now — Veriff scan, then you're in."}
            </p>
          </div>
          {!verified && (
            <a
              href="#testflight"
              className="px-4 py-2 rounded-full bg-fg text-obsidian font-semibold text-sm hover:bg-fg/90 transition-colors whitespace-nowrap"
            >
              Continue in app
            </a>
          )}
        </div>
      </section>

      <OpenInAppCta />

      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
