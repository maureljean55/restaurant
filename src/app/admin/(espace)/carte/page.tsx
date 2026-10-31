import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ActionButton } from "@/components/admin/client";
import { DishEditor } from "@/components/admin/DishEditor";
import { NewDishForm } from "@/components/admin/NewDishForm";
import { PhotoUpdater } from "@/components/admin/PhotoUpdater";
import { Badge, compteurClasse, EmptyState, Kpi, ongletClasse, PageHeader, Panel } from "@/components/admin/ui";
import { updateDish } from "@/lib/actions/admin";
import { requireStaff } from "@/lib/admin/session";
import type { Model3D, Spice } from "@/lib/catalogue/types";
import { spiceLabel } from "@/lib/catalogue/types";
import { formatFCFA } from "@/lib/format";
import { IconCarte, IconCube, IconInfo } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Carte & 3D" };

type Plat = {
  slug: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  badge: string | null;
  tags: string[];
  spice: Spice;
  available: boolean;
  prep_minutes: number | null;
  photo: string | null;
  photo_is_illustration: boolean;
  model: Model3D | null;
};

export default function CartePage({ searchParams }: PageProps<"/admin/carte">) {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement de la carte…</p>}>
      <Carte searchParams={searchParams} />
    </Suspense>
  );
}

async function Carte({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { membre, db } = await requireStaff();
  const admin = membre.role === "admin";
  const sp = await searchParams;
  const [plats, categories] = await Promise.all([
    db.from("dishes").select("slug, name, description, price, category, badge, tags, spice, available, prep_minutes, photo, photo_is_illustration, model").order("position").returns<Plat[]>(),
    db.from("categories").select("id, label").order("position").returns<{ id: string; label: string }[]>(),
  ]);
  const tous = plats.data ?? [];
  const cats = categories.data ?? [];
  const cat = cats.find((c) => c.id === sp.cat)?.id ?? "tous";
  const visibles = cat === "tous" ? tous : tous.filter((p) => p.category === cat);
  const avec3d = tous.filter((p) => p.model);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Carte & expérience 3D"
        title="Catalogue des plats"
        description={admin ? "Ajoutez vos plats avec leurs vraies photos : l'aperçu 3D est créé automatiquement et le plat apparaît tout de suite sur le site." : "Consultation de la carte. Seul un administrateur peut la modifier."}
        actions={admin ? <NewDishForm categories={cats} /> : undefined}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Plats à la carte" value={tous.length} hint={`${cats.length} catégories`} icon={<IconCarte width={18} height={18} />} />
        <Kpi label="Disponibles" value={tous.filter((p) => p.available).length} hint="Commandables en ligne" />
        <Kpi label="Avec aperçu 3D" value={avec3d.length} unit={`/ ${tous.length}`} hint={`${avec3d.filter((p) => !p.model?.isDemo).length} sur photo réelle`} icon={<IconCube width={18} height={18} />} />
        <Kpi accent label="Indisponibles" value={tous.filter((p) => !p.available).length} hint="Masqués à la commande" />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex w-max gap-2">
          {[{ id: "tous", label: "Tous" }, ...cats].map((c) => (
            <Link key={c.id} href={c.id === "tous" ? "/admin/carte" : `/admin/carte?cat=${c.id}`} className={ongletClasse(c.id === cat)}>
              {c.label} <span className={compteurClasse(c.id === cat)}>{c.id === "tous" ? tous.length : tous.filter((p) => p.category === c.id).length}</span>
            </Link>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState title="Aucun plat dans cette catégorie" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibles.map((p) => (
            <article key={p.slug} className={`flex flex-col overflow-hidden rounded-xl border bg-surface shadow-carte ${p.available ? "border-ligne" : "border-erreur/40"}`}>
              <div className="relative aspect-[4/3] bg-surface-haute">
                {p.photo && <Image src={p.photo} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className={`object-cover ${p.available ? "" : "opacity-40 grayscale"}`} />}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-transparent to-noir/30" />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-noir/75 backdrop-blur-sm">
                  {p.model ? <Badge ton={p.model.isDemo ? "or" : "succes"}>{p.model.isDemo ? "Aperçu 3D provisoire" : "3D · photo réelle"}</Badge> : <Badge ton="neutre">Sans 3D</Badge>}
                </span>
                {!p.available && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-noir/75 backdrop-blur-sm">
                    <Badge ton="erreur">Indisponible</Badge>
                  </span>
                )}
                <span className="absolute right-2.5 bottom-2 left-2.5 flex justify-between text-[11px] text-ivoire/80">
                  <span>{p.photo_is_illustration ? "Photo d'illustration" : "Photo du restaurant"}</span>
                  {p.prep_minutes !== null && <span>≈ {p.prep_minutes} min</span>}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-label-sm text-champagne uppercase">{cats.find((c) => c.id === p.category)?.label}</p>
                  <p className="prix shrink-0 text-body-md font-semibold text-or">{p.price === null ? "Prix à venir" : formatFCFA(p.price)}</p>
                </div>
                <h2 className="mt-1 font-display text-title text-ivoire">{p.name}</h2>
                <p className="mt-1 line-clamp-2 text-body-sm text-texte/60">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.badge && <Badge ton="or">{p.badge}</Badge>}
                  {p.tags.map((t) => (
                    <Badge key={t} ton="neutre">
                      {t}
                    </Badge>
                  ))}
                  <Badge ton="neutre">Piment {spiceLabel[p.spice].toLowerCase()}</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-ligne pt-3">
                  <span className={`flex items-center gap-1.5 text-label-sm uppercase ${p.available ? "text-succes" : "text-erreur"}`}>
                    <span className={`size-2 rounded-full ${p.available ? "bg-succes" : "bg-erreur"}`} />
                    {p.available ? "En vente" : "Retiré"}
                  </span>
                  {admin && (
                    <span className="flex items-center gap-2">
                      <ActionButton size="sm" tone={p.available ? "danger" : "secondaire"} action={updateDish.bind(null, p.slug, { available: !p.available })}>
                        {p.available ? "Retirer" : "Remettre"}
                      </ActionButton>
                      <PhotoUpdater slug={p.slug} nom={p.name} />
                      <DishEditor plat={p} />
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Panel eyebrow="Modèles 3D" title="Suivi des aperçus 3D et de la réalité augmentée">
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[40rem] text-left text-body-sm">
            <thead className="text-label-sm text-texte/50 uppercase">
              <tr className="border-b border-ligne">
                <th className="px-4 py-2 font-semibold sm:px-5">Plat</th>
                <th className="px-3 py-2 font-semibold">Formats</th>
                <th className="px-3 py-2 font-semibold">Poids</th>
                <th className="px-3 py-2 font-semibold">Statut</th>
                <th className="px-4 py-2 text-right font-semibold sm:px-5">Aperçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ligne/60">
              {avec3d.map((p) => (
                <tr key={p.slug}>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="block text-ivoire">{p.name}</span>
                    <span className="text-[12px] text-texte/50">{p.model!.label}</span>
                  </td>
                  <td className="px-3 py-3 text-texte/75">GLB{p.model!.usdz ? ", USDZ" : " (USDZ généré sur iPhone)"}</td>
                  <td className="prix px-3 py-3 text-texte/75">{(p.model!.sizeKb / 1024).toFixed(1).replace(".", ",")} Mo</td>
                  <td className="px-3 py-3">{p.model!.isDemo ? <Badge ton="or">Illustration</Badge> : <Badge ton="succes">Photo réelle</Badge>}</td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    <Link href={`/experience-3d?plat=${p.slug}`} target="_blank" className="text-label-md text-or underline">
                      Ouvrir ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex gap-2 text-[12px] text-texte/55">
          <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-champagne" />
          Chaque aperçu est une assiette modélisée en 3D avec la photo du plat posée dedans (ce n&apos;est pas un scan). Ajoutez une photo réelle avec « Nouveau plat » ou le bouton 3D d&apos;un plat : l&apos;aperçu est recréé automatiquement.
        </p>
      </Panel>
    </div>
  );
}
