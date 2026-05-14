"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/// Sidebar item for the admin shell. Three responsibilities: render the
/// icon + label, highlight when active (exact match for Dashboard;
/// startsWith for everything else so nested detail pages still light
/// the parent), and surface an optional count badge (used by Reports
/// to advertise the open-triage queue).
export default function AdminNavLink({
  href, label, icon, exact = false, badge,
}: {
  href: string;
  label: string;
  icon: "grid" | "users" | "rows" | "flag";
  exact?: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-elevated text-fg"
          : "text-fg-secondary hover:text-fg hover:bg-elevated/60",
      ].join(" ")}
    >
      <Icon name={icon} active={active} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 rounded-md bg-warning/15 text-warning text-[10px] font-bold tracking-wide">
          {badge}
        </span>
      )}
    </Link>
  );
}

function Icon({ name, active }: { name: "grid" | "users" | "rows" | "flag"; active: boolean }) {
  // Hand-rolled monoline SVGs so the admin shell carries no icon-pack
  // dependency. Stroke colour inherits via `currentColor` from the
  // parent text colour, so active/inactive state flips for free.
  const className = `w-4 h-4 ${active ? "text-fg" : "text-fg-tertiary group-hover:text-fg-secondary"}`;
  const stroke = { stroke: "currentColor", strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (name) {
    case "grid":
      return (
        <svg viewBox="0 0 16 16" className={className} {...stroke}>
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 16 16" className={className} {...stroke}>
          <circle cx="6" cy="5.5" r="2.5" />
          <path d="M2 13.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" />
          <circle cx="11.5" cy="6" r="2" />
          <path d="M10.5 9.7c2 .2 3.5 1.6 3.5 3.3" />
        </svg>
      );
    case "rows":
      return (
        <svg viewBox="0 0 16 16" className={className} {...stroke}>
          <rect x="2" y="3" width="12" height="3" rx="0.8" />
          <rect x="2" y="10" width="12" height="3" rx="0.8" />
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 16 16" className={className} {...stroke}>
          <path d="M3.5 14V2.5h7l-1 2 1 2H3.5" />
        </svg>
      );
  }
}
