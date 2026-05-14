// Cookie helpers used by the auth API routes + protected pages.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "./api";
import type { UserProfile } from "./types";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = ONE_DAY * 30;

/// Build a NextResponse that already has the auth cookies attached.
/// Setting cookies on the response object (rather than via the global
/// `cookies()` jar) is the reliable way to ship Set-Cookie headers
/// from Route Handlers in Next 15+.
export function jsonWithAuthCookies(body: unknown, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json(body);
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY,
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}

export function jsonWithClearedAuthCookies(body: unknown) {
  const res = NextResponse.json(body);
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const jar = await cookies();
  if (!jar.get(ACCESS_COOKIE)?.value) return null;
  try {
    return await apiFetch<UserProfile>("/users/me");
  } catch {
    return null;
  }
}
