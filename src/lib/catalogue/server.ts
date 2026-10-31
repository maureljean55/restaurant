import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Catalogue, Dish, Settings } from "./types";

/** Étiquette de cache : à invalider (updateTag) quand l'administration modifie la carte ou les infos. */
export const CATALOGUE_TAG = "catalogue";

/**
 * Carte + informations du restaurant, lues dans Supabase.
 * Mises en cache et rafraîchies en arrière-plan chaque minute (profil « minutes »).
 */
export async function getCatalogue(): Promise<Catalogue> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOGUE_TAG);

  const url = process.env.SUPABASE_URL;
  // Données publiques : la clé publique suffit (RLS : lecture seule) ; à défaut, la clé serveur.
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase n'est pas configuré : renseignez SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY (voir .env.example).");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const [categories, dishes, settings, services] = await Promise.all([
    db.from("categories").select("id, label").order("position"),
    db
      .from("dishes")
      .select("slug, name, description, price, category, badge, tags, spice, available, popularity, prep_minutes, photo, photo_is_illustration, model, pairs_with")
      .order("position"),
    db.from("restaurant_settings").select("*").single(),
    db.from("reservation_services").select("id, label, starts, ends").order("starts"),
  ]);
  for (const r of [categories, dishes, settings, services]) if (r.error) throw new Error(`Lecture Supabase impossible : ${r.error.message}`);

  const s = settings.data!;
  return {
    categories: categories.data!,
    dishes: dishes.data!.map(
      (d): Dish => ({
        slug: d.slug,
        name: d.name,
        description: d.description,
        price: d.price,
        category: d.category,
        badge: d.badge,
        tags: d.tags,
        spice: d.spice,
        available: d.available,
        popularity: d.popularity,
        prepMinutes: d.prep_minutes,
        photo: d.photo,
        photoIsIllustration: d.photo_is_illustration,
        model: d.model,
        pairsWith: d.pairs_with,
      }),
    ),
    settings: {
      name: s.name,
      tagline: s.tagline,
      area: s.area,
      description: s.description,
      address: s.address,
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      hours: s.hours,
      social: s.social,
      images: s.images,
      policy: s.reservation_policy,
      groupFrom: s.group_from,
      daysAhead: s.days_ahead,
      closedWeekdays: s.closed_weekdays,
      zones: s.zones,
      services: services.data!.map((x) => ({ id: x.id, label: x.label, start: x.starts.slice(0, 5), end: x.ends.slice(0, 5) })),
      provisional: s.provisional,
      launched: s.launched,
    } satisfies Settings,
  };
}
