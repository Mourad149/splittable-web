import { cookies, headers } from "next/headers";

/// Tiny in-house i18n. Two locales — English and French — with a
/// flat string table per page surface. We deliberately do NOT use
/// next-intl + locale-prefix routing in this iteration; that would
/// require restructuring every public route under `app/[locale]/…`,
/// breaking the existing API surfaces. Cookie-driven swap is enough
/// for the public marketing + auth pages this round localizes.
///
/// The admin platform stays English — internal tooling, no need to
/// localize. Components in app/(admin)/* should not import from here.

export type Locale = "en" | "fr";
export const SUPPORTED_LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "join_locale";

const messages = {
  en: {
    // Header
    nav_discover:    "Discover",
    nav_signin:      "Sign in",

    // Login page
    login_title:           "Welcome.",
    login_subtitle:        "One account for browsing tables here and joining them in the iOS app.",
    login_or:              "or",
    login_legal_prefix:    "By continuing, you agree to Joïn's",
    login_legal_terms:     "Terms",
    login_legal_and:       "and",
    login_legal_privacy:   "Privacy",
    login_legal_period:    ".",

    // Landing / Discover
    landing_section_label:    "DISCOVER",
    landing_title:            "Tonight in",
    landing_subtitle:         "Verified hosts. Real tables. Split the bill.",
    landing_chip_all:         "All",
    landing_chip_tonight:     "Tonight",
    landing_chip_queer:       "🏳️‍🌈 Queer-friendly",
    landing_chip_premium:     "Premium",
    landing_chip_chill:       "Chill",
    landing_chip_wild:        "Wild",
    landing_empty:            "No tables match this filter today.",

    // Footer / common
    footer_legal_privacy:  "Privacy",
    footer_legal_terms:    "Terms",
    footer_open_in_app:    "Open in app",

    // Locale toggle
    toggle_label_en:       "English",
    toggle_label_fr:       "Français",
  },
  fr: {
    nav_discover:    "Découvrir",
    nav_signin:      "Se connecter",

    login_title:           "Bienvenue.",
    login_subtitle:        "Un seul compte pour parcourir les tables ici et les rejoindre dans l'app iOS.",
    login_or:              "ou",
    login_legal_prefix:    "En continuant, vous acceptez les",
    login_legal_terms:     "Conditions",
    login_legal_and:       "et la",
    login_legal_privacy:   "Politique de confidentialité",
    login_legal_period:    " de Joïn.",

    landing_section_label:    "DÉCOUVRIR",
    landing_title:            "Ce soir à",
    landing_subtitle:         "Des hôtes vérifiés. De vraies tables. L'addition partagée.",
    landing_chip_all:         "Tous",
    landing_chip_tonight:     "Ce soir",
    landing_chip_queer:       "🏳️‍🌈 Queer-friendly",
    landing_chip_premium:     "Premium",
    landing_chip_chill:       "Chill",
    landing_chip_wild:        "Wild",
    landing_empty:            "Aucune table ne correspond à ce filtre aujourd'hui.",

    footer_legal_privacy:  "Confidentialité",
    footer_legal_terms:    "Conditions",
    footer_open_in_app:    "Ouvrir l'app",

    toggle_label_en:       "English",
    toggle_label_fr:       "Français",
  },
} as const;

export type MessageKey = keyof typeof messages.en;

/// Resolves the active locale for the current request. Order:
///   1. `join_locale` cookie (set by the user's locale toggle)
///   2. Accept-Language header (matches "fr-*" → French, else English)
///   3. DEFAULT_LOCALE
///
/// Server-component only — uses next/headers.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "en" || fromCookie === "fr") return fromCookie;

  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") ?? "";
  if (/^fr\b|,\s*fr\b/i.test(acceptLang)) return "fr";
  return DEFAULT_LOCALE;
}

/// Convenience getter for the message bundle. Use as:
///   const t = await getT();
///   <Text>{t("login_submit")}</Text>
export async function getT(): Promise<(key: MessageKey) => string> {
  const locale = await getLocale();
  const bundle = messages[locale];
  return (key) => bundle[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
}
