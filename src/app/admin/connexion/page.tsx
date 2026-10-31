import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getStaff } from "@/lib/supabase/auth";
import { brand } from "@/config/site";
import { IconCalendar, IconChef, IconReceipt, IconShield } from "@/components/ui/icons";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

const postes = [
  { Icon: IconReceipt, titre: "Commandes & livraisons", texte: "Du bon de commande à la remise au client." },
  { Icon: IconChef, titre: "Écran cuisine", texte: "Tickets en direct, minuteurs et alertes." },
  { Icon: IconCalendar, titre: "Salle & réservations", texte: "Confirmez les tables selon la capacité." },
];

export default function ConnexionPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <Suspense>
        <DejaConnecte />
      </Suspense>
      {/* Visuel (ordinateur) */}
      <aside className="relative hidden overflow-hidden border-r border-or/15 lg:block">
        <Image src="/demo/table-partage.jpg" alt="" fill priority sizes="55vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-br from-encre via-encre/85 to-or-sombre/70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3 text-label-md text-texte/60 hover:text-or">
            ← Retour au site
          </Link>
          <div>
            <Image src={brand.logo.or} alt="Logo LE-TCHE" width={150} height={150} className="size-36 drop-shadow-[0_8px_30px_rgb(196_164_103/0.25)]" />
            <p className="surtitre mt-8 text-champagne">Restaurant LE-TCHE · Abidjan</p>
            <h1 className="mt-2 max-w-md font-display text-display leading-[1.05] text-or">Espace du personnel</h1>
            <ul className="mt-10 flex max-w-md flex-col gap-5">
              {postes.map(({ Icon, titre, texte }) => (
                <li key={titre} className="flex items-start gap-4">
                  <span className="verre grid size-11 shrink-0 place-items-center rounded-xl text-or">
                    <Icon width={20} height={20} />
                  </span>
                  <span>
                    <span className="block text-title text-ivoire">{titre}</span>
                    <span className="text-body-sm text-texte/60">{texte}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-label-sm text-texte/40">Accès réservé à l&apos;équipe · Abidjan, UTC+0</p>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center lg:hidden">
            <Image src={brand.logo.or} alt="Logo LE-TCHE" width={96} height={96} className="size-24" priority />
            <p className="surtitre mt-4 text-champagne">Restaurant LE-TCHE</p>
          </div>
          <div className="mt-6 rounded-2xl border border-ligne bg-surface p-6 shadow-flottant sm:p-8 lg:mt-0">
            <p className="surtitre text-champagne">Bienvenue</p>
            <h2 className="mt-1 text-headline-md text-or">Connexion</h2>
            <p className="mt-1 text-body-sm text-texte/60">Identifiez-vous avec le compte créé par votre administrateur.</p>
            <LoginForm />
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px] text-texte/45">
            <IconShield width={14} height={14} className="shrink-0 text-or/70" />
            Connexion chiffrée · session sécurisée
          </p>
          <Link href="/" className="mt-3 block text-center text-label-md text-texte/50 hover:text-or lg:hidden">
            ← Retour au site
          </Link>
        </div>
      </main>
    </div>
  );
}

/** Déjà connecté : direction le tableau de bord. */
async function DejaConnecte() {
  if (await getStaff()) redirect("/admin");
  return null;
}
