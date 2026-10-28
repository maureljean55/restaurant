import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileActionBar } from "@/components/layout/MobileActionBar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-orange px-4 py-2 font-bold text-charbon focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      {/* Espace réservé à la barre d'actions mobile */}
      <div className="bg-charbon pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <SiteFooter />
      </div>
      <MobileActionBar />
    </>
  );
}
