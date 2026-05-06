// Cookie helpers used by the auth API routes + protected pages.

import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "./api";
import type { UserProfile } from "./types";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = ONE_DAY * 30;

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY,
  });
  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
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
