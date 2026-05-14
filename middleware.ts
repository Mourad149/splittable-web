import { NextRequest, NextResponse } from "next/server";

/// Edge middleware — minimal abuse-prevention layer in front of the
/// auth + admin proxy routes. Stops the obvious brute-force / credential
/// stuffing / register-spam patterns without paying for Cloudflare.
///
/// Storage is an in-memory Map living inside the edge function instance.
/// Vercel rotates instances and runs many in parallel, so this only
/// catches per-instance bursts — a sophisticated attacker on a botnet
/// would land each request on a different instance. Acceptable for the
/// staging stage; swap to Vercel KV / Upstash once the user base
/// justifies the operational overhead.
///
/// Rules (per IP):
///   POST /api/auth/login                       — 5 / 60s
///   POST /api/auth/register                    — 3 / 10m
///   POST /api/auth/password/reset/start        — 3 / 5m
///   POST /api/auth/password/reset/complete     — 5 / 5m
///   *    /api/admin/*                          — 60 / 60s   (auth-gated upstream anyway)
///
/// On hit: 429 + Retry-After header. The number of seconds is computed
/// from the sliding window so the client knows when to come back.

interface Rule {
  pattern: RegExp;
  /// Only count matching methods, ignore the rest (e.g. login is POST-
  /// only, GET on the same path isn't an attack vector).
  methods?: string[];
  limit: number;
  windowMs: number;
}

const RULES: Rule[] = [
  { pattern: /^\/api\/auth\/login$/,                    methods: ["POST"], limit: 5,  windowMs: 60_000 },
  { pattern: /^\/api\/auth\/register$/,                 methods: ["POST"], limit: 3,  windowMs: 10 * 60_000 },
  { pattern: /^\/api\/auth\/password\/reset\/start$/,   methods: ["POST"], limit: 3,  windowMs:  5 * 60_000 },
  { pattern: /^\/api\/auth\/password\/reset\/complete$/, methods: ["POST"], limit: 5, windowMs:  5 * 60_000 },
  { pattern: /^\/api\/admin\//,                                            limit: 60, windowMs: 60_000 },
];

// Single shared bucket. Key: `${ip}|${rule-index}`. Value: array of hit
// timestamps. Sliding-window via filter-then-length.
const buckets = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  // Vercel injects the real client IP into x-real-ip / x-forwarded-for.
  // Fall back to a constant so missing headers still bucket together
  // (better than letting every request in unrate-limited).
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const method = req.method.toUpperCase();
  const ip = clientIp(req);
  const now = Date.now();

  for (let i = 0; i < RULES.length; i++) {
    const rule = RULES[i]!;
    if (!rule.pattern.test(path)) continue;
    if (rule.methods && !rule.methods.includes(method)) continue;

    const key = `${ip}|${i}`;
    const hits = buckets.get(key) ?? [];
    // Drop timestamps outside the window in one pass.
    const fresh = hits.filter((t) => now - t < rule.windowMs);

    if (fresh.length >= rule.limit) {
      // Retry-After = ms until the oldest in-window hit ages out.
      const oldest = fresh[0]!;
      const retryAfterSec = Math.max(1, Math.ceil((rule.windowMs - (now - oldest)) / 1000));
      return new NextResponse(
        JSON.stringify({ error: "RATE_LIMITED", retryAfter: retryAfterSec }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": String(retryAfterSec),
          },
        },
      );
    }

    fresh.push(now);
    buckets.set(key, fresh);
    // Only one rule matches per request — first hit wins. Stops here.
    break;
  }

  return NextResponse.next();
}

/// Matcher is path-prefix based; the per-rule regex above narrows
/// further. Excluding everything else means we don't run for static
/// assets or pages — keeps the edge function cold-start surface tiny.
export const config = {
  matcher: ["/api/auth/:path*", "/api/admin/:path*"],
};
