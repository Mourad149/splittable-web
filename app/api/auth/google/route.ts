import { NextRequest, NextResponse } from "next/server";
import { jsonWithAuthCookies } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.idToken) {
    return NextResponse.json({ error: "MISSING_ID_TOKEN" }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: body.idToken }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json({ error: data.error || `HTTP_${upstream.status}` }, { status: upstream.status });
  }

  const data = (await upstream.json()) as AuthResponse;
  return jsonWithAuthCookies({ user: data.user }, data.tokens.accessToken, data.tokens.refreshToken);
}
