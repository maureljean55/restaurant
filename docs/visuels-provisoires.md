# Visuels provisoires

Les photos dans `public/demo/` sont des **photos d'illustration** provenant d'Unsplash
([licence Unsplash](https://unsplash.com/license) : usage commercial gratuit, sans attribution obligatoire).
Elles **ne représentent pas** les plats du restaurant et sont signalées comme telles sur le site.

| Fichier | Source |
|---|---|
| hero-poisson-feuille.jpg | https://unsplash.com/photos/hVnClpnYUUk |
| table-partage.jpg | https://unsplash.com/photos/U9KvS-fLDwo |
| poisson-braise-alloco.jpg | https://unsplash.com/photos/a5MP_o7xy54 |
| kedjenou.jpg | https://unsplash.com/photos/1lAIRAsv3C4 |
| riz-gras-poulet.jpg | https://unsplash.com/photos/77ItGP98s6g |
| alloco.jpg | https://unsplash.com/photos/iZizDMsDeIo |
| sauce-graine.jpg | https://unsplash.com/photos/al9eh9QkdPA |
| sauce-feuille-foutou.jpg | https://unsplash.com/photos/kn_ANxnwCQ0 |
| brochettes.jpg | https://unsplash.com/photos/UC0HZdUitWY |
| bissap.jpg | https://unsplash.com/photos/kOoMCheZesE |

## Remplacer par les photos officielles

1. **Prise de vue** : lumière naturelle, même fond (bois sombre ou feuille de bananier),
   même angle pour tous les plats (3/4 ou vue de dessus), format JPEG, 2000 px minimum de large.
2. **Avant Supabase** : déposer la photo dans `public/plats/`, puis changer `photo` et passer
   `photoIsIllustration` à `false` dans `src/data/demo-dishes.ts`.
3. **Après Supabase** : téléverser la photo depuis l'administration (fiche du plat → Photos).
   L'optimisation (AVIF/WebP, tailles adaptées au mobile) est automatique.
4. Supprimer les fichiers de `public/demo/` qui ne servent plus.
