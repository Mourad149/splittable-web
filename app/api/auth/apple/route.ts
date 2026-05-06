import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.identityToken) {
    return NextResponse.json({ error: "MISSING_IDENTITY_TOKEN" }, { status: 400 });
  }

  // Forward to backend /auth/apple. The backend verifies Apple's JWT
  // against Apple's JWKS, validates aud against APPLE_BUNDLE_ID, and
  // either creates or returns the matching user.
  const upstream = await fetch(`${API_BASE}/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityToken: body.identityToken,
      firstName: body.firstName,
      lastName: body.lastName,
    }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json({ error: data.error || `HTTP_${upstream.status}` }, { status: upstream.status });
  }

  const data = (await upstream.json()) as AuthResponse;
  await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);
  return NextResponse.json({ user: data.user });
}
