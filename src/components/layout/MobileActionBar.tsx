import Link from "next/link";
import { whatsappUrl } from "@/config/site";
import { IconBag, IconCalendar, IconChat } from "@/components/ui/icons";

/** Barre d'actions flottante, téléphone uniquement (masquée dès 768 px). */
export function MobileActionBar() {
  const wa = whatsappUrl();
  const item = "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-[0.8rem] font-bold";

  return (
    <nav
      aria-label="Actions rapides"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <div className="flex items-center gap-1 rounded-full border border-ivoire/10 bg-charbon/85 p-1.5 text-ivoire shadow-[0_20px_40px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl">
        <Link href="/menu" className={`${item} flex-[1.4] bg-orange text-charbon`}>
          <IconBag width={18} height={18} />
          Commander
        </Link>
        <Link href="/reservation" className={item}>
          <IconCalendar width={18} height={18} />
          Réserver
        </Link>
        {wa ? (
          <a href={wa} className={item} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <IconChat width={18} height={18} />
          </a>
        ) : (
          <Link href="/contact" className={item}>
            <IconChat width={18} height={18} />
            Contact
          </Link>
        )}
      </div>
    </nav>
  );
}
