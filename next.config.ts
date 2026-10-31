import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
