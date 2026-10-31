import { CartProvider } from "@/lib/cart";
import { CatalogueProvider } from "@/lib/catalogue/context";
import { getCatalogue } from "@/lib/catalogue/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { UpsellSheet } from "@/components/cart/UpsellSheet";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const catalogue = await getCatalogue();
  return (
    <CatalogueProvider catalogue={catalogue}>
    <CartProvider>
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-full bg-or px-4 py-2 font-bold text-noir focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      {/* L'en-tête est fixe : on réserve sa hauteur */}
      <main id="contenu" className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] lg:pt-[4.5rem]">
        {children}
      </main>
      <SiteFooter settings={catalogue.settings} />
      <UpsellSheet />
    </CartProvider>
    </CatalogueProvider>
  );
}
