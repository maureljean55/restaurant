/**
 * Réduit une photo dans le navigateur avant l'envoi (≤ 1600 px, JPEG) :
 * envoi rapide même en 3G/4G, et sous la limite d'envoi du serveur.
 */
export async function compresserPhoto(fichier: File, cote = 1600, qualite = 0.85): Promise<Blob> {
  const image = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  const echelle = Math.min(1, cote / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error("Compression impossible"))), "image/jpeg", qualite));
}
