import type { Metadata } from "next";
import { demoDishes } from "@/data/demo-dishes";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { DishCard } from "@/components/dish/DishCard";
import { DishPlate } from "@/components/dish/DishPlate";

export const metadata: Metadata = {
  title: "Planche de style",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "Ivoire chaud", hex: "#FFF8ED", cls: "bg-ivoire", role: "Fond dominant", ink: "text-charbon", ring: true },
  { name: "Vert profond", hex: "#174C38", cls: "bg-vert", role: "Navigation, titres, sections identitaires", ink: "text-ivoire" },
  { name: "Orange ivoirien", hex: "#F58220", cls: "bg-orange", role: "Actions principales uniquement — texte charbon", ink: "text-charbon" },
  { name: "Brun cacao", hex: "#4A2E24", cls: "bg-cacao", role: "Profondeur, bois, table", ink: "text-ivoire" },
  { name: "Terracotta", hex: "#B85C38", cls: "bg-terracotta", role: "Accents, surtitres, icônes", ink: "text-ivoire" },
  { name: "Or doux", hex: "#C6A15B", cls: "bg-or", role: "Filets, motifs — jamais pour du texte sur clair", ink: "text-charbon" },
  { name: "Beige sable", hex: "#E8D8C3", cls: "bg-sable", role: "Fonds alternés", ink: "text-cacao" },
  { name: "Vert sauge", hex: "#A8B7A0", cls: "bg-sauge", role: "Fonds secondaires, états doux", ink: "text-vert" },
  { name: "Noir charbon", hex: "#252522", cls: "bg-charbon", role: "Texte courant, pied de page", ink: "text-ivoire" },
  { name: "Blanc", hex: "#FFFFFF", cls: "bg-blanc", role: "Cartes, formulaires", ink: "text-charbon", ring: true },
];

const contrastes = [
  { label: "Charbon sur orange", ratio: "5,9:1", ok: true, sample: "bg-orange text-charbon" },
  { label: "Blanc sur orange", ratio: "2,6:1", ok: false, sample: "bg-orange text-blanc" },
  { label: "Ivoire sur vert", ratio: "9,4:1", ok: true, sample: "bg-vert text-ivoire" },
  { label: "Vert sur ivoire", ratio: "9,4:1", ok: true, sample: "bg-ivoire text-vert ring-1 ring-sable" },
  { label: "Terracotta sur ivoire", ratio: "4,3:1", ok: null, sample: "bg-ivoire text-terracotta ring-1 ring-sable" },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10";

export default function StyleBoardPage() {
  return (
    <main>
      <header className="bg-vert text-ivoire">
        <div className="bande-tissee opacity-60" aria-hidden />
        <div className={section}>
          <p className="surtitre text-or">Direction artistique · v1 à valider</p>
          <h1 className="titre-hero mt-4">Planche de style</h1>
          <p className="mt-4 max-w-xl text-ivoire/80">
            Signature : le plat vu de dessus, dans une assiette posée sur une table en bois. Toutes les photos
            officielles devront suivre ce cadrage.
          </p>
        </div>
      </header>

      <section className={section} aria-labelledby="couleurs">
        <h2 id="couleurs" className="titre-section text-vert">Couleurs</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {palette.map((c) => (
            <li key={c.hex} className="overflow-hidden rounded-2xl bg-blanc shadow-sm">
              <div className={`${c.cls} ${c.ink} ${c.ring ? "ring-1 ring-sable ring-inset" : ""} flex h-24 items-end p-3 font-display text-lg`}>
                Aa
              </div>
              <div className="p-3">
                <p className="font-bold">{c.name}</p>
                <p className="font-mono text-xs text-charbon/60">{c.hex}</p>
                <p className="mt-1 text-xs leading-snug text-charbon/75">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="mt-12 text-2xl text-cacao">Contrastes vérifiés</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contrastes.map((c) => (
            <li key={c.label} className="flex items-center gap-3 rounded-2xl bg-blanc p-3">
              <span className={`grid h-12 w-16 shrink-0 place-items-center rounded-xl font-bold ${c.sample}`}>Texte</span>
              <span className="text-sm">
                <strong>{c.label}</strong>
                <br />
                {c.ratio} — {c.ok === true ? "✅ conforme" : c.ok === false ? "❌ interdit" : "⚠️ grands textes seulement"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-blanc" aria-labelledby="typo">
        <div className={section}>
          <h2 id="typo" className="titre-section text-vert">Typographie</h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="surtitre text-terracotta">Titres — Young Serif</p>
              <p className="titre-hero mt-3 text-vert">Kedjenou</p>
              <p className="titre-section mt-2 text-cacao">Les saveurs d&apos;Abidjan</p>
              <p className="mt-2 font-display text-2xl">Poisson braisé & attiéké</p>
            </div>
            <div>
              <p className="surtitre text-terracotta">Texte — Manrope</p>
              <p className="mt-3 text-lg leading-relaxed">
                Corps de texte, 16 à 18 px, interlignage généreux pour une lecture confortable sur téléphone.
              </p>
              <p className="mt-3 text-sm text-charbon/75">Texte secondaire, 14 px.</p>
              <p className="surtitre mt-3 text-vert">Surtitre · 12 px · capitales espacées</p>
              <p className="mt-3 text-2xl font-bold text-cacao">3 500 FCFA</p>
            </div>
          </div>
        </div>
      </section>

      <section className={section} aria-labelledby="composants">
        <h2 id="composants" className="titre-section text-vert">Boutons et badges</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#">Commander</ButtonLink>
          <ButtonLink href="#" variant="secondary">Réserver une table</ButtonLink>
          <ButtonLink href="#" variant="outline">Voir le plat</ButtonLink>
          <ButtonLink href="#" size="sm">Ajouter</ButtonLink>
        </div>
        <div className="mt-6 inline-flex flex-wrap gap-3 rounded-2xl bg-cacao p-4">
          <ButtonLink href="#" variant="outlineLight">Voir en 3D</ButtonLink>
          <ButtonLink href="#">Voir sur ma table</ButtonLink>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="vert">3D</Badge>
          <Badge tone="sauge">Disponible</Badge>
          <Badge tone="sable">Épicé</Badge>
          <Badge tone="provisoire">Provisoire</Badge>
        </div>
      </section>

      <section className="bg-sable/60" aria-labelledby="cartes">
        <div className={section}>
          <h2 id="cartes" className="titre-section text-cacao">Cartes de plat et assiette</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {demoDishes.slice(0, 3).map((d) => (
              <DishCard key={d.slug} dish={{ ...d, has3d: d.slug === "garba" }} />
            ))}
            <div className="table-bois grid place-items-center rounded-3xl p-8">
              <DishPlate name="Assiette" photo={null} spin className="w-full max-w-56" />
            </div>
          </div>
          <div className="mt-10">
            <p className="surtitre text-cacao">Bande tissée — séparateur, toujours discrète</p>
            <div className="bande-tissee mt-3" aria-hidden />
            <div className="mt-3 rounded-xl bg-vert p-3">
              <div className="bande-tissee opacity-50" aria-hidden />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
