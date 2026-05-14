import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

/// POST /api/locale  { locale: "en" | "fr" }
///
/// Persists the user's choice as an httpOnly-ish cookie (we leave it
/// readable to JS so client components can also peek without an
/// extra round-trip). The client toggle calls this then router.refresh()
/// so the next render picks the new bundle off the cookie.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale as string | undefined;
  if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
    return NextResponse.json({ error: "INVALID_LOCALE" }, { status: 400 });
  }
  const res = NextResponse.json({ locale });
  res.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  return res;
}
