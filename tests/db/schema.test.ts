/**
 * Exécute la migration Supabase dans un vrai Postgres embarqué (PGlite)
 * et vérifie les règles métier côté base : prix recalculés, capacité, statuts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

const dir = join(import.meta.dirname, "../../supabase/migrations");
const migrations = readdirSync(dir).sort().map((f) => readFileSync(join(dir, f), "utf8"));

let db: PGlite;

beforeEach(async () => {
  db = new PGlite();
  // Rôles fournis par Supabase en production
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    -- Mini Supabase Auth : auth.uid() lit l'identifiant de l'utilisateur « connecté »
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
  `);
  for (const sql of migrations) await db.exec(sql);
});

/** Date AAAA-MM-JJ à J+n (Abidjan = UTC). */
const jour = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

const reserver = (guests: number, date = jour(2), time = "20:00") =>
  db.query<{ id: string; reference: string }>(
    `select * from public.create_reservation($1, $2, $3, 'terrasse', 'Awa Koné', '0700123456', '', 'Anniversaire')`,
    [date, time, guests],
  );

const commander = (items: unknown, mode = "pickup", address: string | null = null) =>
  db.query<{ id: string; token: string; number: number; subtotal: number }>(
    `select * from public.create_order($1, 'Awa Koné', '0700123456', $2, '', $3::jsonb)`,
    [mode, address, JSON.stringify(items)],
  );

describe("réservations", () => {
  it("enregistre une demande en attente, jamais confirmée automatiquement", async () => {
    const { rows } = await reserver(4);
    expect(rows[0].reference).toMatch(/^R-[0-9A-F]{6}$/);
    const r = await db.query<{ status: string; service_id: string; email: string | null }>(
      `select status, service_id, email from public.reservations`,
    );
    expect(r.rows[0]).toEqual({ status: "pending", service_id: "diner", email: null });
  });

  it("accepte une heure libre dans la plage du service et un grand groupe", async () => {
    await expect(reserver(2, jour(3), "19:45")).resolves.toBeTruthy();
    await expect(reserver(25, jour(4), "12:10")).resolves.toBeTruthy();
    const r = await db.query<{ service_id: string }>(`select service_id from public.reservations order by date`);
    expect(r.rows.map((x) => x.service_id)).toEqual(["diner", "dejeuner"]);
  });

  it("accepte une date lointaine (jusqu'à un an)", async () => {
    await expect(reserver(2, jour(200))).resolves.toBeTruthy();
    await expect(reserver(2, jour(400))).rejects.toThrow("DATE_OUT_OF_RANGE");
  });

  it("refuse au-delà de la capacité et indique les places restantes", async () => {
    await reserver(20); // 20 couverts sur 30
    const err = await reserver(12).catch((e) => e);
    expect(err.message).toBe("SLOT_FULL");
    expect(err.detail).toBe("10");
    await expect(reserver(10)).resolves.toBeTruthy(); // 30 / 30
    // Le déjeuner du même jour reste libre
    await expect(reserver(2, jour(2), "12:30")).resolves.toBeTruthy();
  });

  it("donne les places restantes par service", async () => {
    await reserver(8);
    await reserver(4, jour(2), "12:00");
    await db.exec(`update public.reservations set status = 'declined' where guests = 4`);
    const { rows } = await db.query<{ service_id: string; remaining: number }>(
      `select service_id, remaining from public.reservation_availability($1)`,
      [jour(2)],
    );
    expect(rows).toEqual([
      { service_id: "dejeuner", remaining: 30 }, // la demande refusée libère les places
      { service_id: "diner", remaining: 22 },
    ]);
  });

  it("refuse les heures hors service, les dates passées et les effectifs invalides", async () => {
    await expect(reserver(2, jour(2), "17:00")).rejects.toThrow("SLOT_UNKNOWN");
    await expect(reserver(2, jour(2), "23:30")).rejects.toThrow("SLOT_UNKNOWN");
    await expect(reserver(2, jour(-1))).rejects.toThrow("DATE_OUT_OF_RANGE");
    await expect(reserver(0)).rejects.toThrow("GUESTS_OUT_OF_RANGE");
    await expect(reserver(101)).rejects.toThrow("GUESTS_OUT_OF_RANGE");
  });
});

describe("commandes", () => {
  it("recalcule le total à partir des prix en base et fusionne les doublons", async () => {
    const { rows } = await commander([
      { slug: "poisson-braise-attieke", qty: 1, price: 1 }, // le prix envoyé est ignoré
      { slug: "bissap", qty: 1 },
      { slug: "bissap", qty: 1 },
    ]);
    expect(rows[0].subtotal).toBe(6500 + 2 * 1500);
    expect(rows[0].number).toBe(1001);
    expect(rows[0].token).toMatch(/^[0-9a-f]{32}$/);

    const items = await db.query<{ name: string; qty: number; line_total: number }>(
      `select name, qty, line_total from public.order_items order by name`,
    );
    expect(items.rows).toEqual([
      { name: "Bissap", qty: 2, line_total: 3000 },
      { name: "Poisson braisé & attiéké", qty: 1, line_total: 6500 },
    ]);
    const o = await db.query<{ status: string; payment_status: string }>(`select status, payment_status from public.orders`);
    expect(o.rows[0]).toEqual({ status: "received", payment_status: "unpaid" });
  });

  it("refuse les plats inconnus ou indisponibles et les quantités invalides", async () => {
    await expect(commander([{ slug: "pizza", qty: 1 }])).rejects.toThrow("UNKNOWN_DISH");
    await expect(commander([{ slug: "sauce-feuille-foutou", qty: 1 }])).rejects.toThrow("DISH_UNAVAILABLE");
    await expect(commander([{ slug: "alloco", qty: 0 }])).rejects.toThrow("BAD_QTY");
    await expect(commander([{ slug: "alloco", qty: 15 }, { slug: "alloco", qty: 15 }])).rejects.toThrow("BAD_QTY");
    await expect(commander([])).rejects.toThrow("EMPTY_ORDER");
    const n = await db.query<{ n: number }>(`select count(*)::int as n from public.orders`);
    expect(n.rows[0].n).toBe(0);
  });

  it("exige une adresse pour la livraison", async () => {
    await expect(commander([{ slug: "alloco", qty: 1 }], "delivery")).rejects.toThrow("ADDRESS_REQUIRED");
    const { rows } = await commander([{ slug: "alloco", qty: 1 }], "delivery", "Cocody, Rue des Jardins");
    expect(rows[0].subtotal).toBe(2500);
  });
});

describe("sécurité", () => {
  it("le public lit la carte mais ni les commandes ni les réservations, et ne peut pas appeler les fonctions", async () => {
    await reserver(2);
    await commander([{ slug: "alloco", qty: 1 }]);
    await db.exec(`grant usage on schema public to anon; grant select on all tables in schema public to anon;`);
    await db.exec(`set role anon`);
    const plats = await db.query(`select * from public.dishes`);
    expect(plats.rows.length).toBe(10);
    expect((await db.query(`select * from public.orders`)).rows).toEqual([]);
    expect((await db.query(`select * from public.reservations`)).rows).toEqual([]);
    await expect(commander([{ slug: "alloco", qty: 1 }])).rejects.toThrow(/permission denied/);
  });
});

describe("carte et informations du restaurant", () => {
  it("contient la carte complète, triée et rattachée aux catégories", async () => {
    const { rows } = await db.query<{ slug: string; category: string; description: string; photo: string; model: { glb: string } | null; pairs_with: string[] }>(
      `select slug, category, description, photo, model, pairs_with from public.dishes order by position`,
    );
    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ slug: "poisson-braise-attieke", category: "grillades", pairs_with: ["alloco", "bissap"] });
    expect(rows[0].model?.glb).toBe("/models/apercus/poisson-braise-attieke.glb");
    expect(rows.every((d) => d.description.length > 10 && d.photo.startsWith("/demo/"))).toBe(true);
    await expect(db.exec(`update public.dishes set category = 'inconnue' where slug = 'alloco'`)).rejects.toThrow(/foreign key/);
  });

  it("a une seule ligne d'informations, marquée provisoire", async () => {
    const { rows } = await db.query<{ name: string; provisional: string[]; launched: boolean }>(`select name, provisional, launched from public.restaurant_settings`);
    expect(rows).toEqual([expect.objectContaining({ name: "LE-TCHE", launched: false })]);
    expect(rows[0].provisional).toContain("address");
    await expect(db.exec(`insert into public.restaurant_settings (id, name, tagline, area, description, address, phone, email, reservation_policy) values (false, 'x','x','x','x','x','x','x','x')`)).rejects.toThrow(/check/);
  });

  it("refuse les jours de fermeture définis par le restaurant", async () => {
    const date = jour(3);
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
    await db.exec(`update public.restaurant_settings set closed_weekdays = '{${dow}}'`);
    await expect(reserver(2, date)).rejects.toThrow("DAY_CLOSED");
  });
});

describe("personnel", () => {
  const ADMIN = "00000000-0000-0000-0000-00000000000a";
  const SERVEUR = "00000000-0000-0000-0000-00000000000b";
  const INCONNU = "00000000-0000-0000-0000-00000000000c";

  beforeEach(async () => {
    await db.exec(`
      insert into auth.users values ('${ADMIN}'), ('${SERVEUR}'), ('${INCONNU}');
      insert into public.staff (user_id, name, role) values ('${ADMIN}', 'Gérant', 'admin'), ('${SERVEUR}', 'Serveur', 'staff');
      grant usage on schema public to anon, authenticated;
      grant select, insert, update, delete on all tables in schema public to anon, authenticated;
    `);
    await reserver(2);
    await commander([{ slug: "alloco", qty: 1 }]);
  });

  /** Exécute une requête en tant qu'utilisateur connecté. */
  async function enTantQue<T>(userId: string, sql: string) {
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${userId}', false);`);
    try {
      return await db.query<T>(sql);
    } finally {
      await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
    }
  }

  it("le personnel voit et traite réservations et commandes", async () => {
    expect((await enTantQue(SERVEUR, `select * from public.reservations`)).rows).toHaveLength(1);
    expect((await enTantQue(SERVEUR, `select * from public.orders`)).rows).toHaveLength(1);
    await enTantQue(SERVEUR, `update public.reservations set status = 'confirmed'`);
    const r = await db.query<{ status: string }>(`select status from public.reservations`);
    expect(r.rows[0].status).toBe("confirmed");
  });

  it("le personnel ne modifie pas la carte ; l'administrateur oui", async () => {
    await enTantQue(SERVEUR, `update public.dishes set price = 1 where slug = 'alloco'`);
    expect((await db.query<{ price: number }>(`select price from public.dishes where slug = 'alloco'`)).rows[0].price).toBe(2500);
    await enTantQue(ADMIN, `update public.dishes set price = 3000 where slug = 'alloco'`);
    expect((await db.query<{ price: number }>(`select price from public.dishes where slug = 'alloco'`)).rows[0].price).toBe(3000);
  });

  it("un compte qui n'est pas du personnel ne voit rien", async () => {
    expect((await enTantQue(INCONNU, `select * from public.reservations`)).rows).toEqual([]);
    expect((await enTantQue(INCONNU, `select * from public.orders`)).rows).toEqual([]);
    expect((await enTantQue(INCONNU, `select * from public.staff`)).rows).toEqual([]);
    await enTantQue(INCONNU, `insert into public.staff (user_id, name, role) values ('${INCONNU}', 'Pirate', 'admin')`).catch(() => {});
    expect((await db.query(`select * from public.staff where user_id = '${INCONNU}'`)).rows).toEqual([]);
  });

  it("le personnel voit sa fiche, l'administrateur toute l'équipe", async () => {
    expect((await enTantQue(SERVEUR, `select name from public.staff`)).rows).toEqual([{ name: "Serveur" }]);
    expect((await enTantQue(ADMIN, `select name from public.staff order by name`)).rows).toHaveLength(2);
  });
});
