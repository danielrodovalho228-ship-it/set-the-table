import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

// metadataBase prefers the public site URL, falls back to the Vercel preview URL,
// then to a placeholder. Set NEXT_PUBLIC_SITE_URL to your final domain in production.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  title: "Set the Table — tables worth remembering",
  description:
    "Browse curated table settings for Thanksgiving, Christmas, birthdays, and dinner parties. Customize, save, and get a shopping list.",
  metadataBase: new URL(siteUrl)
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Nav />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
