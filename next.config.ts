import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Photos et modèles 3D ajoutés depuis l'administration (Supabase Storage, espace « carte »)
  images: {
    remotePatterns: process.env.SUPABASE_URL ? [new URL(`${process.env.SUPABASE_URL}/storage/v1/object/public/carte/**`)] : [],
  },
  experimental: {
    // Photo compressée dans le navigateur (≈ 1 Mo) : 4 Mo laisse de la marge, sous la limite de Vercel (4,5 Mo)
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Adresses courtes vers la connexion du personnel
  redirects: async () => [
    { source: "/connexion", destination: "/admin/connexion", permanent: false },
    { source: "/personnel", destination: "/admin/connexion", permanent: false },
  ],
  turbopack: {
    // Un package-lock.json existe dans le dossier personnel : on fixe la racine du projet.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
