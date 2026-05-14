// Thin server-side fetch wrapper around the SplitTable backend.
// Reads the access token from httpOnly cookies set by the auth API
// routes — never exposes the token to client-side JS, which is the
// whole point of routing auth through Next API handlers.

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export const ACCESS_COOKIE = "join_access";
export const REFRESH_COOKIE = "join_refresh";

interface RequestInit {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | undefined>;
  // When true, attach the cookie-stored access token. Default true.
  authed?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { method = "GET", body, query, authed = true } = init;

  const url = new URL(API_BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // always fresh — Phase 1 has no real caching strategy yet
  });

  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    try {
      const data = await res.json();
      code = data.error ?? code;
    } catch {}
    throw new ApiError(res.status, code);
  }

  // Backend wraps most successful payloads as `{ data: ... }`. Unwrap
  // automatically so callers can type the inner shape directly. Auth
  // endpoints are exempt — those return `{ user, tokens }` at top level.
  const json = await res.json();
  if (json && typeof json === "object" && "data" in json && Object.keys(json).length === 1) {
    return json.data as T;
  }
  return json as T;
}
