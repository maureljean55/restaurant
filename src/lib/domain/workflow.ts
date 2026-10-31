/**
 * Étapes de traitement des commandes et des réservations — logique pure,
 * utilisée par l'interface (boutons proposés) et par le serveur (contrôle).
 */

export type OrderStatus = "received" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled";
export type OrderMode = "pickup" | "delivery";
export type ReservationStatus = "pending" | "confirmed" | "declined" | "cancelled";

export const orderStatusLabel: Record<OrderStatus, string> = {
  received: "En attente",
  accepted: "Acceptée",
  preparing: "En cuisine",
  ready: "Prête",
  out_for_delivery: "En livraison",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  declined: "Refusée",
  cancelled: "Annulée",
};

export type Transition<S> = { to: S; label: string; tone: "primaire" | "secondaire" | "danger" };

/** Actions possibles depuis un statut de commande (dans l'ordre d'affichage). */
export function orderTransitions(status: OrderStatus, mode: OrderMode): Transition<OrderStatus>[] {
  const annuler: Transition<OrderStatus> = { to: "cancelled", label: "Annuler", tone: "danger" };
  switch (status) {
    case "received":
      return [{ to: "accepted", label: "Accepter", tone: "primaire" }, annuler];
    case "accepted":
      return [{ to: "preparing", label: "Lancer en cuisine", tone: "primaire" }, annuler];
    case "preparing":
      return [{ to: "ready", label: "Marquer prête", tone: "primaire" }, annuler];
    case "ready":
      return mode === "delivery"
        ? [{ to: "out_for_delivery", label: "Départ en livraison", tone: "primaire" }, annuler]
        : [{ to: "completed", label: "Remise au client", tone: "primaire" }, annuler];
    case "out_for_delivery":
      return [{ to: "completed", label: "Livrée", tone: "primaire" }];
    default:
      return [];
  }
}

export const canChangeOrder = (from: OrderStatus, to: OrderStatus, mode: OrderMode) => orderTransitions(from, mode).some((t) => t.to === to);

export function reservationTransitions(status: ReservationStatus): Transition<ReservationStatus>[] {
  switch (status) {
    case "pending":
      return [
        { to: "confirmed", label: "Confirmer", tone: "primaire" },
        { to: "declined", label: "Refuser", tone: "danger" },
      ];
    case "confirmed":
      return [{ to: "cancelled", label: "Annuler", tone: "danger" }];
    default:
      return [];
  }
}

export const canChangeReservation = (from: ReservationStatus, to: ReservationStatus) => reservationTransitions(from).some((t) => t.to === to);

/** Commandes encore « vivantes » (à suivre par l'équipe). */
export const ACTIVE_ORDER: OrderStatus[] = ["received", "accepted", "preparing", "ready", "out_for_delivery"];

/** Minutes écoulées entre deux instants (arrondi inférieur). */
export const minutesBetween = (from: string | Date, to: Date) => Math.max(0, Math.floor((to.getTime() - new Date(from).getTime()) / 60_000));
