import { describe, expect, it } from "vitest";
import { canChangeOrder, canChangeReservation, orderTransitions, reservationTransitions } from "@/lib/domain/workflow";

describe("étapes d'une commande", () => {
  it("suit l'ordre reçue → acceptée → en cuisine → prête", () => {
    expect(orderTransitions("received", "pickup")[0].to).toBe("accepted");
    expect(orderTransitions("accepted", "pickup")[0].to).toBe("preparing");
    expect(orderTransitions("preparing", "pickup")[0].to).toBe("ready");
  });

  it("une commande prête part en livraison ou est remise selon le mode", () => {
    expect(orderTransitions("ready", "delivery")[0]).toMatchObject({ to: "out_for_delivery" });
    expect(orderTransitions("ready", "pickup")[0]).toMatchObject({ to: "completed", label: "Remise au client" });
    expect(canChangeOrder("ready", "out_for_delivery", "pickup")).toBe(false);
  });

  it("interdit les sauts d'étape et les retours en arrière", () => {
    expect(canChangeOrder("received", "ready", "pickup")).toBe(false);
    expect(canChangeOrder("completed", "received", "pickup")).toBe(false);
    expect(canChangeOrder("cancelled", "accepted", "delivery")).toBe(false);
    expect(canChangeOrder("out_for_delivery", "cancelled", "delivery")).toBe(false); // déjà partie
  });
});

describe("étapes d'une réservation", () => {
  it("une demande en attente est confirmée ou refusée, jamais automatiquement", () => {
    expect(reservationTransitions("pending").map((t) => t.to)).toEqual(["confirmed", "declined"]);
    expect(canChangeReservation("confirmed", "cancelled")).toBe(true);
    expect(canChangeReservation("declined", "confirmed")).toBe(false);
  });
});
