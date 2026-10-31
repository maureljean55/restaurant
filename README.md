# LE-TCHE — site du restaurant

Site d'un restaurant ivoirien à Abidjan : carte, aperçus 3D / réalité augmentée, panier et commande
(retrait ou livraison, paiement sur place), demandes de réservation.

Next.js 16 · React 19 · Tailwind CSS 4 · Supabase · model-viewer · Vercel.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir SUPABASE_URL et SUPABASE_SECRET_KEY
npm run dev                  # http://localhost:3000
npm test                     # tests unitaires + tests de la base (Postgres embarqué)
```

Sans les variables Supabase, le site fonctionne en vitrine : commandes et réservations
affichent « pas encore ouvertes ».

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

## Valeurs provisoires

Nom, adresse, téléphone, horaires : `src/config/site.ts`. Photos et modèles 3D : `docs/visuels-provisoires.md`.
Carte et prix d'exemple : `src/data/demo-dishes.ts` et la migration (mêmes valeurs).
