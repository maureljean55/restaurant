import type { Metadata } from "next";
import { categories, demoDishes } from "@/data/demo-dishes";
import { MenuExplorer } from "./MenuExplorer";

export const metadata: Metadata = {
  title: "La carte",
  description: "Plats traditionnels ivoiriens, grillades, accompagnements et boissons. Commande en ligne.",
};

export default function MenuPage() {
  return <MenuExplorer dishes={demoDishes} categories={categories} />;
}
