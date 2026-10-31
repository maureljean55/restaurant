/**
 * Aperçu 3D d'un plat : une assiette en céramique modélisée en 3D, avec la photo du plat
 * posée dans son creux (dôme légèrement bombé).
 *
 * ⚠️ Ce n'est PAS un scan du plat : c'est un aperçu construit à partir d'une photo.
 * Utilisé par l'administration (ajout d'un plat) et par scripts/generer-apercus-3d.mjs.
 */
import { Document, NodeIO } from "@gltf-transform/core";
import sharp from "sharp";

const SEGMENTS = 96; // finesse du cercle

/** Profil de l'assiette (rayon, hauteur) en mètres : dessus du creux → marli → bord → dessous → pied. */
const PROFIL_ASSIETTE = [
  [0, 0.006], [0.1, 0.006], [0.108, 0.0068], [0.116, 0.0095], [0.126, 0.0155], [0.136, 0.0205],
  [0.143, 0.0228], [0.147, 0.0232], [0.1495, 0.0222], [0.1505, 0.0205], [0.149, 0.0185],
  [0.142, 0.0155], [0.128, 0.0105], [0.11, 0.0055], [0.092, 0.0022], [0.088, 0], [0.078, 0],
  [0.074, 0.0028], [0, 0.0028],
];

/** Normales lissées : somme des normales des faces adjacentes. */
function normales(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3];
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

/** Surface de révolution autour de l'axe vertical à partir d'un profil (r, y). */
function revolution(profil) {
  const pos = [];
  const idx = [];
  for (const [r, y] of profil) {
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = (s / SEGMENTS) * Math.PI * 2;
      pos.push(r * Math.cos(t), y, r * Math.sin(t));
    }
  }
  const ligne = SEGMENTS + 1;
  for (let p = 0; p < profil.length - 1; p++) {
    for (let s = 0; s < SEGMENTS; s++) {
      const a = p * ligne + s, b = a + 1, c = a + ligne, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

/** Dôme de nourriture texturé : la photo est projetée vue de dessus. */
function dome(rayon = 0.1, base = 0.0085, sommet = 0.0145, anneaux = 24) {
  const pos = [], uv = [], idx = [];
  const ligne = SEGMENTS + 1;
  for (let k = 0; k <= anneaux; k++) {
    const f = k / anneaux;
    const r = rayon * f;
    // profil bombé, avec un bord qui redescend doucement sur l'assiette
    const y = base + (sommet - base) * Math.pow(1 - f * f, 0.35);
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = (s / SEGMENTS) * Math.PI * 2;
      const x = r * Math.cos(t), z = r * Math.sin(t);
      pos.push(x, y, z);
      uv.push(0.5 + (x / rayon) * 0.5, 0.5 + (z / rayon) * 0.5);
    }
  }
  for (let k = 0; k < anneaux; k++) {
    for (let s = 0; s < SEGMENTS; s++) {
      const a = k * ligne + s, b = a + 1, c = a + ligne, d = c + 1;
      idx.push(a, b, c, b, d, c); // même sens que l'assiette : faces tournées vers le haut
    }
  }
  return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

/** Photo recadrée en carré au centre, bords fondus pour se fondre dans l'assiette. */
async function texture(photo) {
  const taille = 1024;
  const masque = Buffer.from(
    `<svg width="${taille}" height="${taille}"><defs><radialGradient id="g"><stop offset="90%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="${taille / 2}" cy="${taille / 2}" r="${taille / 2}" fill="url(#g)"/></svg>`,
  );
  // Deux passes : sharp applique `flatten` avant `composite`, ce qui noircirait le bord fondu.
  const detoure = await sharp(photo)
    .resize(taille, taille, { fit: "cover", position: "attention" })
    .composite([{ input: masque, blend: "dest-in" }])
    .png()
    .toBuffer();
  return sharp(detoure)
    .flatten({ background: "#f4ede2" }) // couleur du creux de l'assiette sous le fondu
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

/**
 * Construit le fichier GLB (dimensions réelles en mètres → bonne taille en réalité augmentée).
 * @param {Buffer | Uint8Array | string} photo  image (contenu ou chemin de fichier)
 * @param {string} [nom]
 * @returns {Promise<Uint8Array>}
 */
export async function genererApercu3D(photo, nom = "plat") {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const acc = (type, arr) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buffer);
  const scene = doc.createScene(nom);

  // Assiette : céramique blanche cassée, légèrement brillante
  const ceramique = doc.createMaterial("ceramique").setBaseColorFactor([0.95, 0.93, 0.89, 1]).setRoughnessFactor(0.28).setMetallicFactor(0);
  const a = revolution(PROFIL_ASSIETTE);
  const assiette = doc.createPrimitive()
    .setAttribute("POSITION", acc("VEC3", a.pos))
    .setAttribute("NORMAL", acc("VEC3", normales(a.pos, a.idx)))
    .setIndices(acc("SCALAR", a.idx))
    .setMaterial(ceramique);

  // Nourriture : photo du plat
  const image = doc.createTexture("photo").setImage(await texture(photo)).setMimeType("image/jpeg");
  const nourriture = doc.createMaterial("plat").setBaseColorTexture(image).setRoughnessFactor(0.62).setMetallicFactor(0);
  const d = dome();
  const plat = doc.createPrimitive()
    .setAttribute("POSITION", acc("VEC3", d.pos))
    // Dôme presque plat : normales verticales → éclairage uniforme, sans bord sombre
    .setAttribute("NORMAL", acc("VEC3", new Float32Array(d.pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0))))
    .setAttribute("TEXCOORD_0", acc("VEC2", d.uv))
    .setIndices(acc("SCALAR", d.idx))
    .setMaterial(nourriture);

  scene.addChild(doc.createNode("assiette").setMesh(doc.createMesh("assiette").addPrimitive(assiette)));
  scene.addChild(doc.createNode("plat").setMesh(doc.createMesh("plat").addPrimitive(plat)));
  doc.getRoot().setDefaultScene(scene);

  return new NodeIO().writeBinary(doc);
}

