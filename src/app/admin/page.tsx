import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/lib/actions/auth";
import { getStaff, supabaseSession } from "@/lib/supabase/auth";
import { btn } from "@/components/ui/styles";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement…</p>}>
      <Accueil />
    </Suspense>
  );
}

async function Accueil() {
  const membre = await getStaff();
  if (!membre) redirect("/admin/connexion");

  // Lu avec les droits du membre connecté (RLS) : prouve que l'accès du personnel fonctionne
  const db = await supabaseSession();
  const compter = async (table: "reservations" | "orders", filtre: [string, string]) => {
    const { count } = await db.from(table).select("*", { count: "exact", head: true }).eq(...filtre);
    return count ?? 0;
  };
  const [resaEnAttente, commandesRecues] = await Promise.all([compter("reservations", ["status", "pending"]), compter("orders", ["status", "received"])]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="surtitre text-champagne">{membre.role === "admin" ? "Administrateur" : "Personnel"}</p>
          <h1 className="mt-1 text-headline-md text-or">Bonjour {membre.name}</h1>
          <p className="text-body-sm text-texte/60">{membre.email}</p>
        </div>
        <form action={signOut}>
          <button className={`${btn.secondary} ${btn.sm}`}>Se déconnecter</button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Réservations en attente", resaEnAttente],
          ["Commandes à traiter", commandesRecues],
        ].map(([libelle, n]) => (
          <div key={libelle} className="rounded-xl border border-ligne bg-surface p-5 shadow-carte">
            <p className="text-label-md text-texte/60">{libelle}</p>
            <p className="prix mt-1 font-display text-headline-lg text-or">{n}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-body-sm text-texte/55">
        Le tableau de bord (liste des réservations et commandes, confirmation, changement de statut) arrive à la
        prochaine étape.
      </p>
    </>
  );
}
