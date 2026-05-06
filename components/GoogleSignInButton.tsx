"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GsiInit) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}
interface GsiInit { client_id: string; callback: (resp: { credential: string }) => void; ux_mode?: "popup" | "redirect"; auto_select?: boolean; }
interface GsiButtonOptions { theme?: "outline" | "filled_blue" | "filled_black"; size?: "large" | "medium" | "small"; type?: "standard" | "icon"; shape?: "rectangular" | "pill" | "circle" | "square"; text?: "signin_with" | "signup_with" | "continue_with" | "signin"; logo_alignment?: "left" | "center"; width?: number; }

/*
 * Google Identity Services — renders Google's branded button (locked
 * styling, can't be deeply customised), captures the credential
 * (Google ID token), POSTs to /api/auth/google.
 */
export default function GoogleSignInButton() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  useEffect(() => {
    if (!scriptReady || !window.google || !clientId || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const r = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: credential }),
          });
          if (!r.ok) {
            const data = await r.json().catch(() => ({}));
            throw new Error(data.error || `HTTP_${r.status}`);
          }
          router.push("/");
          router.refresh();
        } catch (e) {
          setError((e as Error).message || "Google sign-in failed.");
        }
      },
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "center",
      width: 320,
    });
  }, [scriptReady, clientId, router]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="flex justify-center" />
      {error && <div className="text-sm text-error">{error}</div>}
    </>
  );
}
