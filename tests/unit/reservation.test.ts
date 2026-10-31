import { describe, expect, it } from "vitest";
import { buildMonth, reservationSchema, serviceAt, slotIsPast, timeSuggestions, toIso } from "@/lib/domain/reservation";

describe("calendrier de réservation", () => {
  // Mercredi 28 octobre 2026
  const aujourdhui = new Date(2026, 9, 28, 10, 0);

  it("affiche des semaines complètes du lundi au dimanche", () => {
    const semaines = buildMonth(2026, 9, aujourdhui, 365, []);
    const jours = semaines.flat();
    expect(new Date(`${jours[0].iso}T12:00`).getDay()).toBe(1);
    expect(new Date(`${jours.at(-1)!.iso}T12:00`).getDay()).toBe(0);
    expect(semaines.every((s) => s.length === 7)).toBe(true);
    expect(jours.filter((d) => d.inMonth)).toHaveLength(31);
  });

  it("bloque les jours passés, hors du mois et au-delà d'un an", () => {
    const oct = buildMonth(2026, 9, aujourdhui, 365, []).flat();
    expect(oct.find((d) => d.iso === "2026-10-27")!.bookable).toBe(false);
    expect(oct.find((d) => d.iso === "2026-10-28")).toMatchObject({ bookable: true, isToday: true });
    expect(oct.find((d) => d.iso === "2026-11-01")!.bookable).toBe(false); // jour du mois suivant affiché en gris
    const juin = buildMonth(2027, 5, aujourdhui, 365, []).flat();
    expect(juin.find((d) => d.iso === "2027-06-15")!.bookable).toBe(true); // date lointaine
    const oct27 = buildMonth(2027, 9, aujourdhui, 365, []).flat();
    expect(oct27.find((d) => d.iso === "2027-10-28")!.bookable).toBe(true); // dans un an pile
    expect(oct27.find((d) => d.iso === "2027-10-29")!.bookable).toBe(false); // > 1 an
  });

  it("bloque les jours de fermeture", () => {
    const jours = buildMonth(2026, 10, aujourdhui, 365, [1]).flat(); // fermé le lundi
    expect(jours.filter((d) => new Date(`${d.iso}T12:00`).getDay() === 1).every((d) => !d.bookable)).toBe(true);
  });

  it("retire les heures trop proches ou passées aujourd'hui seulement", () => {
    expect(slotIsPast(toIso(aujourdhui), "10:30", aujourdhui)).toBe(true); // dans 30 min
    expect(slotIsPast(toIso(aujourdhui), "12:00", aujourdhui)).toBe(false);
    expect(slotIsPast("2026-10-29", "08:00", aujourdhui)).toBe(false);
  });
});

describe("heure libre", () => {
  const services = [
    { id: "dejeuner", start: "11:30", end: "15:00" },
    { id: "diner", start: "18:30", end: "22:30" },
  ];

  it("trouve le service correspondant, bornes comprises", () => {
    expect(serviceAt("11:30", services)?.id).toBe("dejeuner");
    expect(serviceAt("19:45", services)?.id).toBe("diner");
    expect(serviceAt("22:30", services)?.id).toBe("diner");
    expect(serviceAt("17:00", services)).toBeUndefined();
  });

  it("propose des heures rondes dans la plage", () => {
    expect(timeSuggestions("18:30", "20:00")).toEqual(["18:30", "19:00", "19:30", "20:00"]);
    expect(timeSuggestions("11:45", "13:00")).toEqual(["12:00", "12:30", "13:00"]);
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

  it("accepte de 1 à 100 convives saisis librement", () => {
    expect(reservationSchema.safeParse({ ...valide, guests: 37 }).success).toBe(true);
    expect(reservationSchema.safeParse({ ...valide, guests: 0 }).success).toBe(false);
    expect(reservationSchema.safeParse({ ...valide, guests: 101 }).success).toBe(false);
    expect(reservationSchema.safeParse({ ...valide, guests: 2.5 }).success).toBe(false);
    expect(reservationSchema.safeParse({ ...valide, guests: Number.NaN }).success).toBe(false);
  });

  it("accepte une heure libre valide seulement", () => {
    expect(reservationSchema.safeParse({ ...valide, time: "19:45" }).success).toBe(true);
    expect(reservationSchema.safeParse({ ...valide, time: "25:00" }).success).toBe(false);
  });
});
