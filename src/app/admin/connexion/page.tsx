import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-ligne bg-surface p-6 shadow-carte">
      <p className="surtitre text-champagne">Espace du personnel</p>
      <h1 className="mt-1 text-headline-sm text-or">Connexion</h1>
      <p className="mt-1 text-body-sm text-texte/65">Réservé à l&apos;équipe du restaurant. Les comptes sont créés par un administrateur.</p>
      <LoginForm />
    </div>
  );
}
