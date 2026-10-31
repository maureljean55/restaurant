/**
 * Génère un APERÇU 3D provisoire par plat : une assiette en céramique modélisée en 3D,
 * avec la photo du plat posée dans son creux (dôme légèrement bombé).
 *
 * ⚠️ Ce n'est PAS un scan du plat : c'est un aperçu en attendant les vrais modèles
 * (photogrammétrie). Le site l'indique à l'utilisateur.
 *
 * La construction 3D est dans src/lib/three/apercu-3d.mjs (partagée avec l'administration).
 *
 * Usage : npm run apercus-3d
 * Sortie : public/models/apercus/<slug>.glb  (dimensions réelles en mètres → bonne taille en RA)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { genererApercu3D } from "../src/lib/three/apercu-3d.mjs";

const RACINE = path.resolve(import.meta.dirname, "..");
const SORTIE = path.join(RACINE, "public/models/apercus");

/** Plats à générer : identifiant → photo (dans public/). */
const PLATS = {
  "poisson-braise-attieke": "demo/poisson-braise-alloco.jpg",
  "kedjenou-poulet": "demo/kedjenou.jpg",
  alloco: "demo/alloco.jpg",
  "sauce-graine": "demo/sauce-graine.jpg",
  "riz-gras-poulet": "demo/riz-gras-poulet.jpg",
  "sauce-feuille-foutou": "demo/sauce-feuille-foutou.jpg",
  brochettes: "demo/brochettes.jpg",
};

await mkdir(SORTIE, { recursive: true });
for (const [slug, photo] of Object.entries(PLATS)) {
  const glb = await genererApercu3D(path.join(RACINE, "public", photo), slug);
  await writeFile(path.join(SORTIE, `${slug}.glb`), glb);
  console.log(`✓ ${slug}.glb  ${(glb.byteLength / 1024).toFixed(0)} Ko`);
}
