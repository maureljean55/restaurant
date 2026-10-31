-- ════════════════════════════════════════════════════════════════════════════
-- Espace de stockage « carte » : photos des plats et aperçus 3D (GLB) ajoutés
-- depuis l'administration. Lecture publique (site client) ; écriture uniquement
-- par le serveur après vérification du rôle administrateur (clé secrète).
-- ════════════════════════════════════════════════════════════════════════════
do $$
begin
  -- Le schéma storage n'existe que sur Supabase (absent des tests locaux)
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('carte', 'carte', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary'])
    on conflict (id) do update
      set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;
