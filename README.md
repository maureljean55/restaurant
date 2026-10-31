# LE-TCHE — site du restaurant

Site d'un restaurant ivoirien à Abidjan : carte, aperçus 3D / réalité augmentée, panier et commande
(retrait ou livraison, paiement sur place), demandes de réservation.

Next.js 16 · React 19 · Tailwind CSS 4 · Supabase · model-viewer · Vercel.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY et SUPABASE_SECRET_KEY
npm run dev                  # http://localhost:3000
npm test                     # tests unitaires + tests de la base (Postgres embarqué)
```

La carte et les informations du restaurant sont lues dans Supabase : les variables sont
nécessaires, y compris pour `npm run build`.

## Base de données (Supabase)

Le schéma est dans `supabase/migrations/`. Pour l'appliquer au projet Supabase :

```bash
supabase login
supabase link --project-ref <identifiant-du-projet>
supabase db push
```

Règles appliquées par la base (testées dans `tests/db/`) :

- le public ne peut que **lire la carte** ; réservations et commandes sont inaccessibles sans la clé secrète ;
- les **prix et totaux sont recalculés** à partir de la table `dishes` (le prix envoyé par le navigateur est ignoré) ;
- une réservation est toujours **« en attente »** et refusée si le service est complet (capacité provisoire : 30 couverts) ;
- aucune donnée bancaire n'est stockée.

## Contenu modifiable dans Supabase (Table Editor)

| Table | Contenu |
|---|---|
| `restaurant_settings` | Nom, adresse, téléphone, e-mail, horaires, zones, conditions, jours fermés, période réservable. `provisional` liste les champs encore provisoires ; `launched = true` autorise l'indexation Google. |
| `reservation_services` | Plages d'arrivée (déjeuner, dîner…) et capacité en couverts. |
| `categories`, `dishes` | La carte : nom, description, prix, disponibilité, photo, modèle 3D, suggestions (`pairs_with`). |
| `reservations`, `orders`, `order_items` | Demandes reçues (lecture/traitement par le personnel). |

Le site reprend les modifications en une minute environ (cache).
Photos et modèles 3D : `docs/visuels-provisoires.md`.

## Personnel

```bash
npm run compte:personnel     # crée un compte (e-mail, nom, rôle admin ou staff, mot de passe masqué)
```

Connexion : `/admin/connexion`. Rôle `staff` : réservations et commandes. Rôle `admin` : tout, y compris la carte
et les informations du restaurant. Désactiver les inscriptions publiques dans Supabase
(Authentication → Sign In / Providers → « Allow new users to sign up ») : seuls les comptes créés par ce script
servent.
