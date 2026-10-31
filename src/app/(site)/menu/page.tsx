import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/server";
import { MenuExplorer } from "./MenuExplorer";

export const metadata: Metadata = {
  title: "La carte",
  description: "Plats traditionnels ivoiriens, grillades, accompagnements et boissons. Commande en ligne.",
};

export default async function MenuPage() {
  const { dishes, categories } = await getCatalogue();
  return <MenuExplorer dishes={dishes} categories={categories} />;
}
