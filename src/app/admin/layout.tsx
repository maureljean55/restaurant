import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/config/site";

export const metadata: Metadata = {
  title: { default: "Espace du personnel", template: "%s · Espace du personnel" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-fond">
      <header className="border-b border-ligne">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 md:px-8">
          <Image src={brand.logo.medaillon} alt="" width={36} height={36} className="size-9" />
          <p className="font-display text-title tracking-[0.08em] text-or">LE-TCHE</p>
          <span className="text-label-sm text-texte/55 uppercase">· Personnel</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
