import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace du personnel", template: "%s · Espace du personnel" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-fond">{children}</div>;
}
