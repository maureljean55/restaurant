/**
 * Crée (ou met à jour) un compte du personnel : compte Supabase Auth + fiche dans la table staff.
 *   npm run compte:personnel
 * Le mot de passe est saisi sans s'afficher et n'est enregistré nulle part en clair.
 * Nécessite SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis dans .env.local");
  process.exit(1);
}
const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const rl = createInterface({ input: stdin, output: stdout });
const demander = (q) => rl.question(q).then((r) => r.trim());

/** Saisie masquée (le mot de passe ne s'affiche pas). */
async function motDePasse(q) {
  stdout.write(q);
  rl.pause();
  const ancien = rl._writeToOutput;
  rl._writeToOutput = () => {};
  rl.resume();
  const r = await rl.question("");
  rl._writeToOutput = ancien;
  stdout.write("\n");
  return r;
}

const email = (await demander("E-mail : ")).toLowerCase();
const nom = await demander("Nom affiché (ex. Awa) : ");
const roleSaisi = (await demander("Rôle — admin (gère tout) ou staff (réservations et commandes) [staff] : ")).toLowerCase() || "staff";
const role = roleSaisi === "admin" ? "admin" : "staff";
const mdp = await motDePasse("Mot de passe (10 caractères minimum) : ");
const confirmation = await motDePasse("Confirmez le mot de passe : ");
rl.close();

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("E-mail invalide");
if (nom.length < 2) throw new Error("Nom trop court");
if (mdp.length < 10) throw new Error("Mot de passe trop court (10 caractères minimum)");
if (mdp !== confirmation) throw new Error("Les deux mots de passe ne correspondent pas");

// Compte existant ? (même e-mail)
let userId;
for (let page = 1; !userId; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
  if (data.users.length < 200) break;
}

if (userId) {
  const { error } = await db.auth.admin.updateUserById(userId, { password: mdp, email_confirm: true });
  if (error) throw error;
  console.log("Compte existant : mot de passe mis à jour.");
} else {
  const { data, error } = await db.auth.admin.createUser({ email, password: mdp, email_confirm: true });
  if (error) throw error;
  userId = data.user.id;
  console.log("Compte créé.");
}

const { error } = await db.from("staff").upsert({ user_id: userId, name: nom, role });
if (error) throw error;
console.log(`✓ ${nom} <${email}> a accès à l'espace du personnel (rôle : ${role}).`);
