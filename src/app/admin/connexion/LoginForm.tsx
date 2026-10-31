"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/lib/actions/auth";
import { btn } from "@/components/ui/styles";

const champ =
  "mt-1 h-11 w-full rounded-lg border border-ligne bg-surface px-3 text-body-md text-texte outline-none placeholder:text-texte/40 focus:border-or focus:ring-1 focus:ring-or";

export function LoginForm() {
  const [state, action, enCours] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="block">
        <span className="text-label-md text-texte/80">E-mail</span>
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} className={champ} />
      </label>
      <label className="block">
        <span className="text-label-md text-texte/80">Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" required className={champ} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg border border-erreur/40 bg-erreur/10 p-3 text-body-sm text-erreur">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={enCours} aria-busy={enCours} className={`${btn.primary} ${btn.md} mt-1 w-full`}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
