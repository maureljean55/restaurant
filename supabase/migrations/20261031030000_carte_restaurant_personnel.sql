-- ════════════════════════════════════════════════════════════════════════════
-- Carte complète, informations du restaurant et comptes du personnel.
--
--   • categories + colonnes de présentation des plats (description, photo, 3D…)
--   • restaurant_settings : une seule ligne (nom, coordonnées, horaires, règles)
--   • staff : membres du personnel (rôle « staff » ou « admin »), liés à Supabase Auth
--
-- Lecture publique : carte, catégories, informations du restaurant, services.
-- Personnel connecté : lit et met à jour réservations et commandes.
-- Administrateurs : modifient aussi la carte et les informations du restaurant.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Catégories ─────────────────────────────────────────────────────────────
create table public.categories (
  id        text primary key check (id ~ '^[a-z0-9-]+$'),
  label     text not null,
  position  integer not null default 0
);
insert into public.categories (id, label, position) values
  ('plats', 'Plats traditionnels', 1),
  ('grillades', 'Grillades & poissons', 2),
  ('accompagnements', 'Accompagnements', 3),
  ('boissons', 'Boissons', 4);

-- ─── Plats : présentation complète ──────────────────────────────────────────
alter table public.dishes
  add column description           text not null default '',
  add column badge                 text,
  add column tags                  text[] not null default '{}',
  add column spice                 text not null default 'doux' check (spice in ('doux', 'moyen', 'fort')),
  add column popularity            integer not null default 0,
  add column prep_minutes          integer check (prep_minutes is null or prep_minutes between 0 and 600),
  -- Chemin (/demo/…) ou URL de la photo ; photo_is_illustration = pas une photo du restaurant
  add column photo                 text,
  add column photo_is_illustration boolean not null default true,
  -- Modèle 3D : {"glb", "usdz"?, "label", "isDemo", "sizeKb", "arEnabled"}
  add column model                 jsonb,
  -- Accompagnements / boissons suggérés (slugs), par ordre de préférence
  add column pairs_with            text[] not null default '{}',
  add column position              integer not null default 0,
  add constraint dishes_category_fkey foreign key (category) references public.categories (id) on update cascade;

-- Contenu de démonstration (identique à l'ancien src/data/demo-dishes.ts)
update public.dishes set description = 'Poisson grillé au feu de bois, attiéké, alloco, oignons et piment frais.', badge = 'Signature', tags = array['Attiéké', 'Feu de bois']::text[], spice = 'moyen', popularity = 98, prep_minutes = 25, photo = '/demo/poisson-braise-alloco.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/poisson-braise-attieke.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":325,"arEnabled":true}'::jsonb, pairs_with = array['alloco', 'bissap']::text[], position = 1 where slug = 'poisson-braise-attieke';
update public.dishes set description = 'Poulet mijoté à l''étouffée avec légumes et épices, cuit au canari.', badge = 'Cuisson canari', tags = array['Étouffée', 'Poulet']::text[], spice = 'doux', popularity = 95, prep_minutes = 30, photo = '/demo/kedjenou.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/kedjenou-poulet.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":300,"arEnabled":true}'::jsonb, pairs_with = array['banane-braisee', 'gnamakoudji']::text[], position = 2 where slug = 'kedjenou-poulet';
update public.dishes set description = 'Banane plantain mûre frite, sauce tomate pimentée.', badge = 'Partage', tags = array['Plantain mûr', 'Sauce maison']::text[], spice = 'moyen', popularity = 97, prep_minutes = 10, photo = '/demo/alloco.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/alloco.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":283,"arEnabled":true}'::jsonb, pairs_with = array['bissap']::text[], position = 3 where slug = 'alloco';
update public.dishes set description = 'Sauce à la noix de palme, viande et poisson fumé, servie avec riz ou foutou.', badge = null, tags = array['Noix de palme', 'Poisson fumé']::text[], spice = 'moyen', popularity = 90, prep_minutes = 20, photo = '/demo/sauce-graine.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/sauce-graine.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":427,"arEnabled":true}'::jsonb, pairs_with = array['banane-braisee', 'bissap']::text[], position = 4 where slug = 'sauce-graine';
update public.dishes set description = 'Riz cuit dans une sauce tomate parfumée, poulet doré.', badge = null, tags = array['Riz', 'Poulet']::text[], spice = 'doux', popularity = 88, prep_minutes = 20, photo = '/demo/riz-gras-poulet.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/riz-gras-poulet.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":338,"arEnabled":true}'::jsonb, pairs_with = array['alloco', 'gnamakoudji']::text[], position = 5 where slug = 'riz-gras-poulet';
update public.dishes set description = 'Sauce aux feuilles, viande et poisson fumé, foutou banane.', badge = 'Tradition', tags = array['Feuilles', 'Foutou banane']::text[], spice = 'doux', popularity = 84, prep_minutes = 25, photo = '/demo/sauce-feuille-foutou.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/sauce-feuille-foutou.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":274,"arEnabled":true}'::jsonb, pairs_with = array['gnamakoudji']::text[], position = 6 where slug = 'sauce-feuille-foutou';
update public.dishes set description = 'Viandes marinées grillées au charbon, piment et légumes.', badge = null, tags = array['Charbon', 'Marinade']::text[], spice = 'fort', popularity = 86, prep_minutes = 15, photo = '/demo/brochettes.jpg', photo_is_illustration = true, model = '{"glb":"/models/apercus/brochettes.glb","label":"Aperçu 3D généré à partir de la photo","isDemo":true,"sizeKb":390,"arEnabled":true}'::jsonb, pairs_with = array['alloco', 'banane-braisee', 'bissap']::text[], position = 7 where slug = 'brochettes';
update public.dishes set description = 'Infusion de fleurs d''hibiscus, servie bien fraîche.', badge = null, tags = array['Hibiscus', 'Fait maison']::text[], spice = 'doux', popularity = 80, prep_minutes = null, photo = '/demo/bissap.jpg', photo_is_illustration = true, model = null, pairs_with = '{}', position = 8 where slug = 'bissap';
update public.dishes set description = 'Banane plantain mûre grillée sur la braise, fondante et caramélisée.', badge = null, tags = array['Plantain', 'Braise']::text[], spice = 'doux', popularity = 82, prep_minutes = 12, photo = '/demo/banane-braisee.jpg', photo_is_illustration = true, model = null, pairs_with = '{}', position = 9 where slug = 'banane-braisee';
update public.dishes set description = 'Jus de gingembre frais, citron et une touche d''ananas, bien glacé.', badge = null, tags = array['Gingembre', 'Fait maison']::text[], spice = 'doux', popularity = 78, prep_minutes = null, photo = '/demo/gnamakoudji.jpg', photo_is_illustration = true, model = null, pairs_with = '{}', position = 10 where slug = 'gnamakoudji';

-- ─── Informations du restaurant (une seule ligne) ───────────────────────────
create table public.restaurant_settings (
  id                  boolean primary key default true check (id),
  name                text not null,
  tagline             text not null,
  area                text not null,
  description         text not null,
  address             text not null,
  phone               text not null,
  -- Numéro WhatsApp international sans « + » ni espace (vide = pas de bouton WhatsApp)
  whatsapp            text not null default '',
  email               text not null,
  -- [{"days": "Lundi – Vendredi", "time": "12h – 23h"}]
  hours               jsonb not null default '[]',
  social              jsonb not null default '{}',
  -- Visuels d'ambiance : {"hero": "/demo/…", "partage": "/demo/…"}
  images              jsonb not null default '{}',
  reservation_policy  text not null,
  group_from          integer not null default 12 check (group_from between 2 and 100),
  days_ahead          integer not null default 365 check (days_ahead between 1 and 730),
  -- Jours fermés : 0 = dimanche … 6 = samedi
  closed_weekdays     integer[] not null default '{}',
  -- [{"id": "terrasse", "label": "Terrasse", "detail": "…"}]
  zones               jsonb not null default '[]',
  -- Champs encore provisoires (affichés comme tels sur le site)
  provisional         text[] not null default '{}',
  -- false = site en préparation (non indexé par les moteurs de recherche)
  launched            boolean not null default false,
  updated_at          timestamptz not null default now()
);
create trigger restaurant_settings_touch before update on public.restaurant_settings
  for each row execute function public.touch_updated_at();

insert into public.restaurant_settings (
  name, tagline, area, description, address, phone, email, hours, images,
  reservation_policy, zones, provisional
) values (
  'LE-TCHE',
  'Cuisine ivoirienne · Abidjan',
  'Abidjan',
  'Restaurant de cuisine ivoirienne à Abidjan. Commande en ligne, réservation de table et plats à découvrir en 3D.',
  'Adresse à venir, Abidjan',
  '+225 00 00 00 00 00',
  'contact@exemple.ci',
  '[{"days": "Lundi – Vendredi", "time": "À définir"}, {"days": "Samedi – Dimanche", "time": "À définir"}]',
  '{"hero": "/demo/hero-poisson-feuille.jpg", "partage": "/demo/table-partage.jpg"}',
  'Conditions d''annulation et de retard à définir par le restaurant.',
  '[{"id": "indifferent", "label": "Sans préférence", "detail": "Nous vous plaçons au mieux"}, {"id": "interieur", "label": "Salle intérieure", "detail": "À confirmer"}, {"id": "terrasse", "label": "Terrasse", "detail": "À confirmer"}]',
  '{address, phone, email, hours, social, services, zones, policy, prices, images}'
);

-- ─── Personnel ──────────────────────────────────────────────────────────────
create type public.staff_role as enum ('staff', 'admin');

create table public.staff (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  name        text not null check (length(name) between 2 and 80),
  role        public.staff_role not null default 'staff',
  created_at  timestamptz not null default now()
);

create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()));
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()) and s.role = 'admin');
$$;

revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.staff enable row level security;

create policy "Catégories visibles par tous" on public.categories for select to anon, authenticated using (true);
create policy "Infos du restaurant visibles par tous" on public.restaurant_settings for select to anon, authenticated using (true);

-- Personnel : chacun voit sa fiche ; l'admin voit et gère toute l'équipe
create policy "Personnel : sa fiche" on public.staff for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admin : gère l'équipe" on public.staff for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Réservations et commandes : lecture et mise à jour par le personnel
create policy "Personnel : lit les réservations" on public.reservations for select to authenticated using ((select public.is_staff()));
create policy "Personnel : traite les réservations" on public.reservations for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "Personnel : lit les commandes" on public.orders for select to authenticated using ((select public.is_staff()));
create policy "Personnel : traite les commandes" on public.orders for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "Personnel : lit le détail des commandes" on public.order_items for select to authenticated using ((select public.is_staff()));

-- Carte, services et informations : modifiables par les administrateurs
create policy "Admin : gère la carte" on public.dishes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin : gère les catégories" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin : gère les services" on public.reservation_services for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin : gère les infos du restaurant" on public.restaurant_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ════════════════════════════════════════════════════════════════════════════
-- create_reservation : la période réservable et les jours fermés viennent
-- désormais de restaurant_settings. Nouvelle erreur : DAY_CLOSED.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.create_reservation(
  p_date date, p_time time, p_guests integer, p_zone text,
  p_name text, p_phone text, p_email text, p_comment text
) returns table (id uuid, reference text)
language plpgsql security definer set search_path = '' as $$
declare
  -- Abidjan : UTC+0 toute l'année
  v_now       timestamp := now() at time zone 'Africa/Abidjan';
  v_settings  public.restaurant_settings%rowtype;
  v_service   public.reservation_services%rowtype;
  v_remaining integer;
begin
  select * into v_settings from public.restaurant_settings limit 1;

  if p_guests is null or p_guests < 1 or p_guests > 100 then
    raise exception 'GUESTS_OUT_OF_RANGE';
  end if;
  if p_date is null or p_date < v_now::date or p_date > v_now::date + coalesce(v_settings.days_ahead, 365) then
    raise exception 'DATE_OUT_OF_RANGE';
  end if;
  if extract(dow from p_date)::integer = any (coalesce(v_settings.closed_weekdays, '{}')) then
    raise exception 'DAY_CLOSED';
  end if;

  select s.* into v_service from public.reservation_services s
   where s.active and p_time between s.starts and s.ends
   order by s.starts limit 1;
  if not found then
    raise exception 'SLOT_UNKNOWN';
  end if;
  if p_date + p_time < v_now + interval '60 minutes' then
    raise exception 'SLOT_PAST';
  end if;

  -- Un seul calcul de capacité à la fois par service et par date
  perform pg_advisory_xact_lock(hashtext('resa:' || p_date::text || ':' || v_service.id));

  select v_service.capacity - coalesce(sum(r.guests), 0) into v_remaining from public.reservations r
   where r.date = p_date and r.service_id = v_service.id and r.status in ('pending', 'confirmed');
  if p_guests > v_remaining then
    raise exception 'SLOT_FULL' using detail = greatest(v_remaining, 0)::text;
  end if;

  return query
  insert into public.reservations as r (reference, service_id, date, time, guests, zone, name, phone, email, comment)
  values (
    'R-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    v_service.id, p_date, p_time, p_guests, nullif(p_zone, ''),
    p_name, p_phone, nullif(p_email, ''), nullif(p_comment, '')
  )
  returning r.id, r.reference;
end $$;

revoke execute on function public.create_reservation(date, time, integer, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_reservation(date, time, integer, text, text, text, text, text) to service_role;
