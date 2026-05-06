import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Editorial display face — used for hero titles + card headlines. Closest
// free Google-Fonts neighbour to the iOS app's Clash Display.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Joïn — Find your table tonight",
  description:
    "Half the price, twice the night. Joïn helps you find — and host — tables in Paris bars, restaurants and clubs.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://xn--jon-jpa.fr"),
  openGraph: {
    title: "Joïn",
    description: "Find your table tonight.",
    type: "website",
  },
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-sm text-fg-secondary">
        <div>
          <span className="font-display text-lg text-fg">jo<span className="text-fg-secondary">ï</span>n</span>
          <span className="ml-3">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex gap-6">
          <a href="#testflight" className="hover:text-fg transition-colors">TestFlight</a>
          <a href="/privacy" className="hover:text-fg transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-fg transition-colors">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
