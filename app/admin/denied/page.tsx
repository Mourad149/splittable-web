import Link from "next/link";

export default function AdminDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian">
      <div className="max-w-md text-center px-6">
        <div className="text-[11px] tracking-[2px] font-bold text-fg-tertiary mb-4">
          ADMIN
        </div>
        <h1 className="font-display text-3xl mb-3">Access denied.</h1>
        <p className="text-fg-secondary mb-6">
          Your account isn&apos;t on the admin allow-list. If this is a mistake,
          ask whoever provisioned the server to add your email to ADMIN_EMAILS.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-lg border border-border hover:border-border-strong text-sm font-semibold"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
