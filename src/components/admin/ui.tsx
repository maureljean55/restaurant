import type { ReactNode } from "react";
import { orderStatusLabel, reservationStatusLabel, type OrderStatus, type ReservationStatus } from "@/lib/domain/workflow";

/** Briques d'interface de l'espace du personnel (charte noir et or du site). */

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="surtitre text-champagne">{eyebrow}</p>
        <h1 className="mt-1 text-headline-lg-mobile text-or md:text-headline-lg">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-body-sm text-texte/65 md:text-body-md">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, eyebrow, actions, children, className = "" }: { title?: string; eyebrow?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-ligne bg-surface p-4 shadow-carte sm:p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            {eyebrow && <p className="surtitre text-champagne/80">{eyebrow}</p>}
            {title && <h2 className="text-headline-sm text-or">{title}</h2>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, unit, hint, icon, accent = false }: { label: string; value: ReactNode; unit?: string; hint?: ReactNode; icon?: ReactNode; accent?: boolean }) {
  return (
    <div className={`flex flex-col justify-between rounded-xl border p-4 shadow-carte sm:p-5 ${accent ? "border-or/50 bg-or-sombre" : "border-ligne bg-surface"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-label-sm text-texte/60 uppercase">{label}</p>
        {icon && <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-haute text-or">{icon}</span>}
      </div>
      <p className="prix mt-3 font-display text-[2rem] leading-none text-or sm:text-[2.25rem]">
        {value}
        {unit && <span className="ml-1.5 font-sans text-label-md text-champagne/80">{unit}</span>}
      </p>
      {hint && <p className="mt-2 text-body-sm text-texte/55">{hint}</p>}
    </div>
  );
}

const tons = {
  or: "bg-or/15 text-or ring-or/30",
  champagne: "bg-champagne/10 text-champagne ring-champagne/25",
  succes: "bg-succes/12 text-succes ring-succes/30",
  erreur: "bg-erreur/12 text-erreur ring-erreur/30",
  neutre: "bg-surface-haute text-texte/60 ring-ligne",
} as const;
export type Ton = keyof typeof tons;

export function Badge({ ton, children }: { ton: Ton; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm whitespace-nowrap ring-1 ${tons[ton]}`}>{children}</span>;
}

export const tonCommande: Record<OrderStatus, Ton> = {
  received: "or",
  accepted: "champagne",
  preparing: "champagne",
  ready: "succes",
  out_for_delivery: "champagne",
  completed: "neutre",
  cancelled: "erreur",
};
export const OrderBadge = ({ status }: { status: OrderStatus }) => <Badge ton={tonCommande[status]}>{orderStatusLabel[status]}</Badge>;

const tonResa: Record<ReservationStatus, Ton> = { pending: "or", confirmed: "succes", declined: "erreur", cancelled: "neutre" };
export const ReservationBadge = ({ status }: { status: ReservationStatus }) => <Badge ton={tonResa[status]}>{reservationStatusLabel[status]}</Badge>;

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ligne px-4 py-10 text-center">
      {icon && <span className="mb-3 grid size-12 place-items-center rounded-full bg-surface-haute text-or">{icon}</span>}
      <p className="text-title text-texte">{title}</p>
      {children && <p className="mt-1 max-w-sm text-body-sm text-texte/55">{children}</p>}
    </div>
  );
}

/** Lien de navigation interne stylé en onglet. */
export const ongletClasse = (actif: boolean) =>
  `inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-label-md whitespace-nowrap transition-colors ${
    actif ? "bg-or text-noir" : "border border-ligne bg-surface text-texte/75 hover:border-or/50 hover:text-or"
  }`;

export const compteurClasse = (actif: boolean) =>
  `prix grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${actif ? "bg-noir/20 text-noir" : "bg-surface-haute text-texte/70"}`;

/** Lien téléphone ivoirien (07 00 00 00 00 → +225…) et WhatsApp. */
export const telHref = (phone: string) => `tel:+225${phone}`;
export const whatsappHref = (phone: string, message = "") => `https://wa.me/225${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
export const formatPhone = (phone: string) => phone.replace(/(\d{2})(?=\d)/g, "$1 ");
