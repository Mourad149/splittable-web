import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

/// Generic proxy for the backend's /admin/* surface. Client components
/// hit /api/admin/<whatever>; this forwards verb + body + path through
/// to the upstream and re-emits the response. apiFetch handles the
/// auth-cookie injection on the server side so the httpOnly token
/// never crosses back to the browser.
///
/// One file, every admin mutation. Kept generic on purpose — admin
/// endpoints are stable shape (POST / DELETE / PATCH with JSON body)
/// so we don't need per-action handlers.

async function forward(req: NextRequest, method: "GET" | "POST" | "PATCH" | "DELETE", segments: string[]) {
  const upstream = "/admin/" + segments.join("/");
  // Pass query params through as-is so e.g. /api/admin/users?q=foo works.
  const search = req.nextUrl.search;
  const fullPath = upstream + (search || "");

  let body: unknown = undefined;
  if (method !== "GET" && method !== "DELETE") {
    body = await req.json().catch(() => undefined);
  }

  try {
    const data = await apiFetch<unknown>(fullPath, { method, body: body as any });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, "GET", path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, "POST", path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, "PATCH", path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, "DELETE", path);
}
