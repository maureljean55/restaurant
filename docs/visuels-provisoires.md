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
| gnamakoudji.jpg | https://unsplash.com/photos/ktwdY1TnefE |
| banane-braisee.jpg | https://unsplash.com/photos/1OBc1LhNAXI |

## Remplacer par les photos officielles

1. **Prise de vue** : lumière naturelle, même fond (bois sombre ou feuille de bananier),
   même angle pour tous les plats (3/4 ou vue de dessus), format JPEG, 2000 px minimum de large.
2. Déposer la photo dans `public/plats/`, puis dans Supabase (table `dishes`) changer `photo`
   (ex. `/plats/alloco.jpg`) et passer `photo_is_illustration` à `false`.
3. Plus tard : téléversement depuis l'administration (fiche du plat → Photos).
   L'optimisation (AVIF/WebP, tailles adaptées au mobile) est automatique.
4. Supprimer les fichiers de `public/demo/` qui ne servent plus.

## Aperçus 3D provisoires

Les fichiers de `public/models/apercus/` sont **générés à partir des photos** par `npm run apercus-3d`
(script `scripts/generer-apercus-3d.mjs`) : une assiette en céramique modélisée en 3D (≈ 30 cm, taille réelle
en réalité augmentée) avec la photo du plat posée dans son creux. Ainsi, la vignette et la 3D montrent le même plat.

⚠️ Ce **n'est pas un scan** : une photo seule ne suffit pas à produire un modèle 3D fidèle. Le site l'indique
(« Aperçu 3D provisoire »). Pour régénérer après avoir changé une photo : `npm run apercus-3d`.

### Remplacer par les modèles des vrais plats

1. Scanner le plat (photogrammétrie : Apple Object Capture, Polycam, RealityScan…), nettoyer le modèle.
2. Exporter en GLB, viser **moins de 5 Mo** (`npx @gltf-transform/cli optimize plat.glb plat-opt.glb --texture-size 1024`).
3. Vérifier le rendu sur la page 3D, puis la RA sur un iPhone et un Android réels.
4. Déposer le fichier dans `public/models/plats/` et mettre à jour la colonne `model` du plat dans
   Supabase (table `dishes`, `"isDemo": false`). Plus tard : téléversement depuis l'administration.
