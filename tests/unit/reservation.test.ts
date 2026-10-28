import { describe, expect, it } from "vitest";
import { buildCalendar, reservationSchema, slotIsPast, toIso } from "@/lib/domain/reservation";

describe("calendrier de réservation", () => {
  // Mercredi 28 octobre 2026
  const aujourdhui = new Date(2026, 9, 28, 10, 0);

  it("commence un lundi et finit un dimanche", () => {
    const semaines = buildCalendar(aujourdhui, 21, []);
    const jours = semaines.flat();
    expect(new Date(`${jours[0].iso}T12:00`).getDay()).toBe(1);
    expect(new Date(`${jours.at(-1)!.iso}T12:00`).getDay()).toBe(0);
    expect(semaines.every((s) => s.length === 7)).toBe(true);
  });

  it("bloque les jours passés et ceux au-delà de la période", () => {
    const jours = buildCalendar(aujourdhui, 21, []).flat();
    expect(jours.find((d) => d.iso === "2026-10-27")!.bookable).toBe(false);
    expect(jours.find((d) => d.iso === "2026-10-28")).toMatchObject({ bookable: true, isToday: true });
    expect(jours.find((d) => d.iso === "2026-11-18")!.bookable).toBe(true);
    expect(jours.find((d) => d.iso === "2026-11-19")!.bookable).toBe(false);
  });

  it("bloque les jours de fermeture", () => {
    const jours = buildCalendar(aujourdhui, 21, [1]).flat(); // fermé le lundi
    expect(jours.filter((d) => new Date(`${d.iso}T12:00`).getDay() === 1).every((d) => !d.bookable)).toBe(true);
  });

  it("retire les créneaux trop proches ou passés aujourd'hui seulement", () => {
    expect(slotIsPast(toIso(aujourdhui), "10:30", aujourdhui)).toBe(true); // dans 30 min
    expect(slotIsPast(toIso(aujourdhui), "12:00", aujourdhui)).toBe(false);
    expect(slotIsPast("2026-10-29", "08:00", aujourdhui)).toBe(false);
  });
});

describe("validation du formulaire", () => {
  const valide = { guests: 2, date: "2026-10-30", time: "20:00", name: "Aya Kouamé", phone: "07 00 12 34 56", email: "", comment: "" };

  it("accepte une demande complète et normalise le téléphone", () => {
    const r = reservationSchema.safeParse({ ...valide, phone: "+225 07.00.12.34.56" });
    expect(r.success).toBe(true);
    expect(r.success && r.data.phone).toBe("0700123456");
  });

  it("refuse les champs manquants ou invalides avec un message en français", () => {
    const r = reservationSchema.safeParse({ ...valide, date: "", time: "", name: "A", phone: "123", email: "pas-un-email" });
    expect(r.success).toBe(false);
    const champs = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(champs).toEqual(expect.arrayContaining(["date", "time", "name", "phone", "email"]));
  });

  it("refuse un nombre de convives nul", () => {
    expect(reservationSchema.safeParse({ ...valide, guests: 0 }).success).toBe(false);
  });
});
