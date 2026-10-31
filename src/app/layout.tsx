import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { site } from "@/config/site";
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

export const metadata: Metadata = {
  title: {
    default: `${site.name.value} — ${site.tagline.value}`,
    template: `%s · ${site.name.value}`,
  },
  description: site.description.value,
  // Site en préparation : pas d'indexation avant l'ouverture officielle.
  robots: site.launched ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FFF8ED",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
