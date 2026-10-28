import type { Metadata } from "next";
import { ReservationForm } from "./ReservationForm";

export const metadata: Metadata = {
  title: "Réserver une table",
  description: "Réservez votre table : nombre de convives, date et créneau. Confirmation par le restaurant.",
};

export default function ReservationPage() {
  return <ReservationForm />;
}
