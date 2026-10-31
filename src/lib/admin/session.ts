import "server-only";
import { redirect } from "next/navigation";
import { getStaff, supabaseSession, type StaffMember } from "@/lib/supabase/auth";

/** Membre connecté + client Supabase à ses droits ; renvoie vers la connexion sinon. */
export async function requireStaff(): Promise<{ membre: StaffMember; db: Awaited<ReturnType<typeof supabaseSession>> }> {
  const membre = await getStaff();
  if (!membre) redirect("/admin/connexion");
  return { membre, db: await supabaseSession() };
}

/** Début de la journée en cours à Abidjan (UTC+0 toute l'année). */
export function debutDuJour(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}
export const aujourdhuiIso = () => new Date().toISOString().slice(0, 10);

const tz = { timeZone: "Africa/Abidjan" } as const;
export const heureAbidjan = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { ...tz, hour: "2-digit", minute: "2-digit" });
export const dateAbidjan = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  new Date(iso).toLocaleDateString("fr-FR", { ...tz, ...opts });

/** Instant (ISO) d'il y a `jours` jours — pour les filtres « 30 derniers jours ». */
export const ilYA = (jours: number) => new Date(Date.now() - jours * 86_400_000).toISOString();
