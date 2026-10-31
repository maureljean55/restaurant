"use server";

import { refresh, updateTag } from "next/cache";
import sharp from "sharp";
import { CATALOGUE_TAG } from "@/lib/catalogue/server";
import type { Model3D } from "@/lib/catalogue/types";
import { libelleApercu, nouveauPlatSchema, PHOTO_MAX_OCTETS, PHOTO_TYPES, slugify, uniqueSlug } from "@/lib/domain/plat";
import { getStaff, supabaseSession } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { genererApercu3D } from "@/lib/three/apercu-3d.mjs";

export type CarteResult = { ok: true; slug: string } | { ok: false; error: string };

const BUCKET = "carte";

/** Vérifie la photo envoyée, la normalise (orientation, 1600 px, JPEG) et la renvoie. */
async function preparerPhoto(fichier: FormDataEntryValue | null): Promise<Buffer | string> {
  if (!(fichier instanceof File) || fichier.size === 0) return "Ajoutez une photo du plat.";
  if (!(PHOTO_TYPES as readonly string[]).includes(fichier.type)) return "Format accepté : JPEG, PNG ou WebP.";
  if (fichier.size > PHOTO_MAX_OCTETS) return "Photo trop lourde (4 Mo maximum).";
  try {
    return await sharp(Buffer.from(await fichier.arrayBuffer()))
      .rotate() // respecte l'orientation du téléphone
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    return "Cette image n'a pas pu être lue. Essayez une autre photo.";
  }
}

/** Envoie la photo (et l'aperçu 3D) dans le stockage ; renvoie les adresses publiques. */
async function televerser(slug: string, photo: Buffer, photoReelle: boolean, avec3d: boolean) {
  const stockage = supabaseAdmin()?.storage.from(BUCKET);
  if (!stockage) throw new Error("Stockage indisponible");
  const version = Date.now().toString(36);

  const cheminPhoto = `photos/${slug}-${version}.jpg`;
  const p = await stockage.upload(cheminPhoto, photo, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (p.error) throw p.error;
  const photoUrl = stockage.getPublicUrl(cheminPhoto).data.publicUrl;

  let model: Model3D | null = null;
  if (avec3d) {
    const glb = await genererApercu3D(photo, slug);
    const cheminModele = `modeles/${slug}-${version}.glb`;
    const m = await stockage.upload(cheminModele, glb, { contentType: "model/gltf-binary", cacheControl: "31536000" });
    if (m.error) throw m.error;
    model = {
      glb: stockage.getPublicUrl(cheminModele).data.publicUrl,
      label: libelleApercu(photoReelle),
      isDemo: !photoReelle,
      sizeKb: Math.round(glb.byteLength / 1024),
      arEnabled: true,
    };
  }
  return { photoUrl, model };
}

const lireCase = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

/** Ajoute un plat à la carte avec sa photo et, si demandé, son aperçu 3D (administrateurs). */
export async function createDish(form: FormData): Promise<CarteResult> {
  const membre = await getStaff();
  if (!membre) return { ok: false, error: "Session expirée : reconnectez-vous." };
  if (membre.role !== "admin") return { ok: false, error: "Seul un administrateur peut ajouter un plat." };

  const parsed = nouveauPlatSchema.safeParse({
    name: form.get("name"),
    category: form.get("category"),
    description: form.get("description") ?? "",
    price: form.get("price") ?? "",
    spice: form.get("spice") || undefined,
    prepMinutes: form.get("prepMinutes") ?? "",
    badge: form.get("badge") ?? "",
    tags: form.get("tags") ?? "",
    available: lireCase(form, "available"),
    photoReelle: lireCase(form, "photoReelle"),
    avec3d: lireCase(form, "avec3d"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const photo = await preparerPhoto(form.get("photo"));
  if (typeof photo === "string") return { ok: false, error: photo };

  const db = await supabaseSession();
  const { data: existants } = await db.from("dishes").select("slug, position");
  const slug = uniqueSlug(slugify(d.name), (existants ?? []).map((x) => x.slug));
  const position = Math.max(0, ...(existants ?? []).map((x) => x.position)) + 1;

  let medias;
  try {
    medias = await televerser(slug, photo, d.photoReelle, d.avec3d);
  } catch (e) {
    console.error("createDish/stockage", e);
    return { ok: false, error: "L'envoi de la photo a échoué. Réessayez." };
  }

  const { error } = await db.from("dishes").insert({
    slug,
    name: d.name,
    category: d.category,
    description: d.description,
    price: d.price,
    spice: d.spice,
    prep_minutes: d.prepMinutes,
    badge: d.badge,
    tags: d.tags,
    available: d.available,
    photo: medias.photoUrl,
    photo_is_illustration: !d.photoReelle,
    model: medias.model,
    position,
  });
  if (error) {
    console.error("createDish/insert", error);
    return { ok: false, error: "Le plat n'a pas pu être enregistré." };
  }
  updateTag(CATALOGUE_TAG);
  refresh();
  return { ok: true, slug };
}

/** Remplace la photo d'un plat et régénère son aperçu 3D (administrateurs). */
export async function updateDishPhoto(slug: string, form: FormData): Promise<CarteResult> {
  const membre = await getStaff();
  if (!membre) return { ok: false, error: "Session expirée : reconnectez-vous." };
  if (membre.role !== "admin") return { ok: false, error: "Seul un administrateur peut changer une photo." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { ok: false, error: "Plat introuvable." };

  const photo = await preparerPhoto(form.get("photo"));
  if (typeof photo === "string") return { ok: false, error: photo };
  const photoReelle = lireCase(form, "photoReelle");
  const avec3d = lireCase(form, "avec3d");

  let medias;
  try {
    medias = await televerser(slug, photo, photoReelle, avec3d);
  } catch (e) {
    console.error("updateDishPhoto/stockage", e);
    return { ok: false, error: "L'envoi de la photo a échoué. Réessayez." };
  }
  const db = await supabaseSession();
  const { data, error } = await db
    .from("dishes")
    .update({ photo: medias.photoUrl, photo_is_illustration: !photoReelle, model: medias.model })
    .eq("slug", slug)
    .select("slug");
  if (error || !data?.length) return { ok: false, error: "La photo n'a pas pu être enregistrée." };
  updateTag(CATALOGUE_TAG);
  refresh();
  return { ok: true, slug };
}
