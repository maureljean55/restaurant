import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { UpsellSheet } from "@/components/cart/UpsellSheet";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-full bg-orange px-4 py-2 font-bold text-charbon focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      {/* L'en-tête est fixe : on réserve sa hauteur */}
      <main id="contenu" className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] lg:pt-[4.5rem]">
        {children}
      </main>
      <SiteFooter />
      <BottomTabBar />
      <UpsellSheet />
    </CartProvider>
  );
}
