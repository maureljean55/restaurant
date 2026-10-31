import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Client Supabase côté serveur, avec la clé SECRÈTE (contourne le RLS).
 * `server-only` fait échouer la compilation si ce fichier est importé côté navigateur.
 * Renvoie null tant que la base n'est pas configurée (.env.local / Vercel).
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
