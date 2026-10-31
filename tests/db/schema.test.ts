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
  await db.exec(`create role anon; create role authenticated; create role service_role;`);
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
