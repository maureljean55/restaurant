import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileActionBar } from "@/components/layout/MobileActionBar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-full bg-orange px-4 py-2 font-bold text-charbon focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      {/* L'en-tête flotte au-dessus du contenu : chaque page réserve son espace en haut. */}
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
