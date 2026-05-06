"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: AppleIDInit) => void;
        signIn: () => Promise<AppleIDSignInResponse>;
      };
    };
  }
}

interface AppleIDInit {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  usePopup?: boolean;
}

interface AppleIDSignInResponse {
  authorization: { id_token: string; code: string; state?: string };
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}

/*
 * Sign in with Apple using Apple's JS SDK (popup mode). Returns an
 * identity token that we POST to /api/auth/apple, which proxies to
 * the SplitTable backend and sets httpOnly cookies on success.
 *
 * Apple delivers the user's name only on the *first* sign-in for
 * a given Apple ID, matching the iOS native behaviour.
 */
export default function AppleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID;
  const redirectURI =
    process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
    (typeof window !== "undefined" ? `${window.location.origin}/login` : "");

  async function handleClick() {
    if (!window.AppleID || !clientId) {
      setError("Apple sign-in is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      window.AppleID.auth.init({ clientId, scope: "name email", redirectURI, usePopup: true });
      const resp = await window.AppleID.auth.signIn();
      const r = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: resp.authorization.id_token,
          firstName: resp.user?.name?.firstName,
          lastName: resp.user?.name?.lastName,
        }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || `HTTP_${r.status}`);
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      const err = e as { error?: string; message?: string };
      // popup_closed_by_user is silent
      if (err.error !== "popup_closed_by_user") {
        setError(err.message || "Apple sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="lazyOnload"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-fg text-obsidian font-semibold hover:bg-fg/90 disabled:opacity-60 transition-colors"
      >
        <AppleLogo />
        {loading ? "Connecting…" : "Continue with Apple"}
      </button>
      {error && <div className="text-sm text-error">{error}</div>}
    </>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 17 20" fill="currentColor" aria-hidden>
      <path d="M13.85 10.51c-.02-2.41 1.97-3.57 2.06-3.63-1.12-1.64-2.87-1.86-3.49-1.89-1.49-.15-2.9.87-3.66.87-.76 0-1.93-.85-3.18-.83-1.63.02-3.14.95-3.99 2.41-1.7 2.94-.43 7.3 1.22 9.7.81 1.17 1.78 2.49 3.04 2.45 1.22-.05 1.69-.79 3.17-.79 1.48 0 1.9.79 3.19.77 1.32-.02 2.16-1.19 2.97-2.37.93-1.36 1.32-2.68 1.34-2.75-.03-.01-2.55-.98-2.57-3.94zM11.46 3.43c.67-.81 1.13-1.94 1-3.06-.97.04-2.14.65-2.83 1.46-.62.71-1.16 1.86-1.02 2.96 1.08.08 2.18-.55 2.85-1.36z" />
    </svg>
  );
}
