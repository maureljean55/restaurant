import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase « au nom de l'utilisateur connecté » : session dans des cookies httpOnly,
 * clé publique, droits limités par la base (RLS : personnel / administrateur).
 */
export async function supabaseSession() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Connexion du personnel indisponible : renseignez SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY.");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (aEcrire) => {
        try {
          for (const { name, value, options } of aEcrire) store.set(name, value, options);
        } catch {
          // Appelé pendant le rendu d'une page : les cookies seront rafraîchis par le proxy.
        }
      },
    },
  });
}

export type StaffMember = { id: string; email: string; name: string; role: "staff" | "admin" };

/** Membre du personnel connecté, ou null (non connecté, ou compte sans accès). */
export async function getStaff(): Promise<StaffMember | null> {
  const db = await supabaseSession();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("staff").select("name, role").eq("user_id", user.id).maybeSingle();
  return data ? { id: user.id, email: user.email ?? "", name: data.name, role: data.role } : null;
}
