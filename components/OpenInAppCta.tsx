/*
 * Phase 1 booking funnel-out: tables can be browsed on web but the
 * actual join flow (Veriff KYC + Stripe PaymentSheet + QR check-in)
 * lives only on iOS for now. This card is the explicit handoff —
 * shown on table detail and on any "Join" CTA tap.
 */

interface Props {
  variant?: "full" | "compact";
  reason?: string;
}

export default function OpenInAppCta({ variant = "full", reason }: Props) {
  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-border bg-elevated/60 px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-fg-secondary">Joining tables is in the iOS app for now.</span>
        <a
          href="#testflight"
          className="px-3 py-1.5 rounded-full bg-fg text-obsidian font-semibold hover:bg-fg/90 transition-colors"
        >
          Get the app
        </a>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-elevated p-6 sm:p-8">
      <div aria-hidden className="absolute inset-0 hero-ambient" />
      <div className="relative">
        <div className="eyebrow mb-3">For now, iOS only</div>
        <h3 className="font-display text-2xl sm:text-3xl leading-tight mb-2">
          Join from the iOS app.
        </h3>
        <p className="text-fg-secondary max-w-md mb-6">
          {reason ?? "Veriff identity check, Apple Pay, secure escrow and QR check-in live in the iOS app today. The web booking flow lands shortly after."}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#testflight"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-fg text-obsidian font-semibold hover:bg-fg/90 transition-colors"
          >
            Get TestFlight access
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-fg-secondary hover:text-fg hover:border-border-strong transition-colors"
          >
            Keep browsing
          </a>
        </div>
      </div>
    </div>
  );
}
