import type { Metadata, Viewport } from "next";
import { Manrope, Young_Serif } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name.value} — ${site.tagline.value}`,
    template: `%s · ${site.name.value}`,
  },
  description: site.description.value,
  // Site en préparation : pas d'indexation tant que les infos sont provisoires.
  robots: site.name.placeholder ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#174C38",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${youngSerif.variable} ${manrope.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
