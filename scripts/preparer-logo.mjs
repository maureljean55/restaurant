/**
 * Prépare les déclinaisons du logo LE-TCHE à partir de l'image source (or sur fond noir).
 *   node scripts/preparer-logo.mjs docs/brand/logo-le-tche-source.png
 * Produit :
 *   public/brand/le-tche-medaillon.png  médaillon rond noir et or, fond transparent (en-tête)
 *   public/brand/le-tche-or.png         emblème or seul, fond transparent (fonds sombres)
 *   src/app/icon.png, src/app/apple-icon.png  icônes d'onglet et d'écran d'accueil
 */
import sharp from "sharp";

const src = process.argv[2];
if (!src) throw new Error("Indiquez le chemin du logo source");

// Cadre carré autour de l'emblème circulaire (image source 1536 × 1024)
const crop = { left: 296, top: 8, width: 940, height: 940 };
const carre = await sharp(src).extract(crop).toBuffer();

const disque = (taille, marge = 0) =>
  Buffer.from(
    `<svg width="${taille}" height="${taille}"><circle cx="${taille / 2}" cy="${taille / 2}" r="${taille / 2 - marge}" fill="#fff"/></svg>`,
  );

// 1. Médaillon : on garde le fond noir, découpé en disque
const T = 512;
await sharp(carre)
  .resize(T, T)
  .ensureAlpha()
  .composite([{ input: disque(T), blend: "dest-in" }])
  .png({ compressionLevel: 9 })
  .toFile("public/brand/le-tche-medaillon.png");

// 2. Or seul : le noir devient transparent (opacité = luminosité, couleur « dé-mélangée » du noir)
const { data, info } = await sharp(carre).resize(T, T).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const m = Math.max(data[i], data[i + 1], data[i + 2]);
  const a = Math.min(255, Math.max(0, (m - 18) * 1.35));
  const k = a > 0 ? 255 / a : 0;
  out[j] = Math.min(255, data[i] * k);
  out[j + 1] = Math.min(255, data[i + 1] * k);
  out[j + 2] = Math.min(255, data[i + 2] * k);
  out[j + 3] = a;
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile("public/brand/le-tche-or.png");

// 3. Icônes
await sharp("public/brand/le-tche-medaillon.png").resize(256, 256).png().toFile("src/app/icon.png");
await sharp(carre).resize(180, 180).flatten({ background: "#000" }).png().toFile("src/app/apple-icon.png");

console.log("Logo prêt.");

// 4. Image de partage (WhatsApp, Facebook…) : emblème or sur le vert du site
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#174C38" } })
  .composite([{ input: await sharp("public/brand/le-tche-or.png").resize(540, 540).toBuffer(), left: 330, top: 45 }])
  .png({ compressionLevel: 9 })
  .toFile("src/app/opengraph-image.png");
console.log("Image de partage prête.");
