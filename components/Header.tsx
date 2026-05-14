import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

/*
 * Top nav. Editorial wordmark on the left, single primary CTA on the
 * right (Sign in OR avatar+name when authenticated). No sub-nav, no
 * megamenu — Phase 1 is intentionally one screen of intent: discover.
 */
export default async function Header() {
  const me = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-obsidian/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="join"
            width={32}
            height={32}
            className="rounded-md"
            priority
          />
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/"
            className="hidden sm:inline-flex px-3 py-2 rounded-full text-fg-secondary hover:text-fg transition-colors"
          >
            Discover
          </Link>
          {me ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-border-strong transition-colors"
            >
              <Avatar user={me} />
              <span className="hidden sm:inline text-fg">{me.firstName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-fg text-obsidian font-semibold hover:bg-fg/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Wordmark() {
  // Display the IDN-correct mark to users — the dotted "ï" is part of
  // brand identity. ASCII fallback `join` is only used for DNS / URLs.
  return (
    <span className="font-display text-xl tracking-tight">
      jo<span className="text-fg-secondary group-hover:text-fg transition-colors">ï</span>n
    </span>
  );
}

function Avatar({ user }: { user: { firstName?: string | null; lastName?: string | null; avatarUrl: string | null } }) {
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />;
  }
  // Defensive: SIWA users who hide their name on first sign-in (or any
  // profile where firstName/lastName ends up empty) shouldn't crash the
  // server render. Fall back to a glyph.
  const first = (user.firstName ?? "").trim();
  const last  = (user.lastName  ?? "").trim();
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "·";
  return (
    <span className="w-7 h-7 rounded-full bg-elevated grid place-items-center text-[11px] font-semibold">
      {initials}
    </span>
  );
}
