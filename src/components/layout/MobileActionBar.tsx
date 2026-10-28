import Link from "next/link";
import { whatsappUrl } from "@/config/site";
import { IconBag, IconCalendar, IconChat } from "@/components/ui/icons";

/** Barre d'actions fixe, téléphone uniquement (masquée dès 768 px). */
export function MobileActionBar() {
  const wa = whatsappUrl();
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold";

  return (
    <nav
      aria-label="Actions rapides"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sable bg-ivoire/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="flex items-stretch gap-2 px-3 py-2">
        <Link href="/menu" className={`${item} rounded-2xl bg-orange text-charbon`}>
          <IconBag width={20} height={20} />
          Commander
        </Link>
        <Link href="/reservation" className={`${item} rounded-2xl text-vert`}>
          <IconCalendar width={20} height={20} />
          Réserver
        </Link>
        {wa ? (
          <a href={wa} className={`${item} rounded-2xl text-vert`} target="_blank" rel="noopener noreferrer">
            <IconChat width={20} height={20} />
            WhatsApp
          </a>
        ) : (
          <Link href="/contact" className={`${item} rounded-2xl text-vert`}>
            <IconChat width={20} height={20} />
            Contact
          </Link>
        )}
      </div>
    </nav>
  );
}
