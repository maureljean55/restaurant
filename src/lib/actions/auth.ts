"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseSession } from "@/lib/supabase/auth";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  password: z.string().min(1, "Indiquez votre mot de passe"),
});

/** Connexion du personnel (e-mail + mot de passe). Les comptes sont créés par un administrateur. */
export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const parsed = loginSchema.safeParse({ email, password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const db = await supabaseSession();
  const { data, error } = await db.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "E-mail ou mot de passe incorrect.", email };

  // Un compte Supabase qui n'est pas dans l'équipe n'a pas accès
  const { data: membre } = await db.from("staff").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!membre) {
    await db.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'espace du personnel.", email };
  }
  redirect("/admin");
}

export async function signOut() {
  const db = await supabaseSession();
  await db.auth.signOut();
  redirect("/admin/connexion");
}
