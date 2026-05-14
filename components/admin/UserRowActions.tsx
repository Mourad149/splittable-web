"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionMenu from "./ActionMenu";
import ConfirmDialog from "./ConfirmDialog";

/// Inline action surface for the admin Users table. Collapses every
/// destructive action behind a ⋯ menu so rows stay scannable, with a
/// dedicated VIEW link for the detail page. Modal confirms (not
/// window.confirm) for the "are you sure?" step.
///
/// Severity ladder:
///   Force-verify — manual ID approval (skip Veriff).
///   Clean        — wipe avatar / moments / bio. Reversible.
///   Ban          — anonymise in place, revoke sessions.
///   Delete       — full cascade. Use sparingly.
type Action = "force-verify" | "clean" | "ban" | "delete";

const CONFIRM: Record<Action, { title: string; body: React.ReactNode; confirm: string; tone: "neutral" | "warning" | "error" }> = {
  "force-verify": {
    title: "Force-verify this user?",
    body: "Flips verificationStatus to APPROVED without going through Veriff. Use only when you've vetted the user out-of-band.",
    confirm: "Force-verify",
    tone: "neutral",
  },
  "clean": {
    title: "Clean this user's content?",
    body: "Wipes their avatar, moments, and bio. Reversible — they can re-upload anytime.",
    confirm: "Clean content",
    tone: "neutral",
  },
  "ban": {
    title: "Ban this user?",
    body: "Anonymises the account, revokes every session. Reviews and messages they wrote stay readable as 'Banned User'. The user can re-sign-up later but with a fresh row.",
    confirm: "Ban user",
    tone: "warning",
  },
  "delete": {
    title: "Delete this user?",
    body: (
      <>
        Full cascade: cancels every table they&apos;re hosting (pushing affected joiners),
        cancels their join requests, anonymises the row.<br /><br />
        Use <b>Ban</b> instead unless there&apos;s a hard reason for the full purge.
      </>
    ),
    confirm: "Delete account",
    tone: "error",
  },
};

export default function UserRowActions({ userId, isDeleted }: { userId: string; isDeleted: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<Action | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isDeleted) {
    return <span className="text-fg-tertiary text-xs">—</span>;
  }

  async function run(action: Action) {
    setPending(action);
    setError(null);
    try {
      const url = action === "delete"
        ? `/api/admin/users/${userId}`
        : `/api/admin/users/${userId}/${action}`;
      const method = action === "delete" ? "DELETE" : "POST";
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setPending(null);
      setPendingConfirm(null);
    }
  }

  const dialogConfig = pendingConfirm ? CONFIRM[pendingConfirm] : null;

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/users/${userId}`}
        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-elevated hover:bg-border border border-border"
      >
        VIEW
      </Link>
      <ActionMenu
        items={[
          { label: "Force-verify ID",  onSelect: () => setPendingConfirm("force-verify") },
          { label: "Clean content",    onSelect: () => setPendingConfirm("clean") },
          { label: "Ban user",         onSelect: () => setPendingConfirm("ban"),    tone: "warning" },
          { label: "Delete account",   onSelect: () => setPendingConfirm("delete"), tone: "error" },
        ]}
      />
      {error && <span className="text-error text-[10px] ml-2">{error}</span>}

      <ConfirmDialog
        open={pendingConfirm !== null}
        title={dialogConfig?.title ?? ""}
        body={dialogConfig?.body}
        confirmLabel={dialogConfig?.confirm ?? "Confirm"}
        tone={dialogConfig?.tone ?? "neutral"}
        pending={pending !== null}
        onConfirm={() => pendingConfirm && run(pendingConfirm)}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
