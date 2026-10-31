import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getCatalogue } from "@/lib/catalogue/server";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCatalogue();
  return {
    title: { default: `${settings.name} — ${settings.tagline}`, template: `%s · ${settings.name}` },
    description: settings.description,
    // Site en préparation : pas d'indexation avant l'ouverture officielle (restaurant_settings.launched).
    robots: settings.launched ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B0A08",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
