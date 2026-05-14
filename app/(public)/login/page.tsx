import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppleSignInButton from "@/components/AppleSignInButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default async function LoginPage() {
  const me = await getCurrentUser();
  if (me) redirect("/");

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      <div aria-hidden className="absolute inset-0 hero-ambient" />
      <div className="relative w-full mx-auto max-w-md px-5 sm:px-0 py-12">
        <div className="text-center mb-10 rise-in">
          <span className="font-display text-3xl tracking-tight">jo<span className="text-fg-secondary">ï</span>n</span>
          <h1 className="font-display text-4xl mt-6 leading-tight">Welcome.</h1>
          <p className="text-fg-secondary mt-2">
            One account for browsing tables here and joining them in the iOS app.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-elevated p-6 sm:p-7 space-y-3 rise-in rise-in-delay-1">
          <AppleSignInButton />
          <Divider />
          <GoogleSignInButton />
        </div>

        <p className="text-xs text-fg-tertiary text-center mt-6 max-w-sm mx-auto">
          By continuing, you agree to Joïn&apos;s <Link href="/terms" className="underline hover:text-fg-secondary">Terms</Link> and <Link href="/privacy" className="underline hover:text-fg-secondary">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border" />
      <span className="eyebrow">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
