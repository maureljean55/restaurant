-- ════════════════════════════════════════════════════════════════════════════
-- Schéma initial : carte, réservations, commandes.
--
-- Sécurité :
--   • RLS activé partout. Le public (clé « publishable ») ne peut que LIRE la
--     carte et les services ; il ne voit ni les réservations ni les commandes.
--   • Les écritures passent par le serveur Next.js (clé secrète, jamais envoyée
--     au navigateur) qui appelle create_reservation / create_order.
--   • Les prix et totaux sont recalculés ICI, à partir de la table dishes :
--     le prix envoyé par le navigateur est ignoré.
--   • Une réservation est toujours créée « pending » : le restaurant confirme.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Carte ──────────────────────────────────────────────────────────────────
create table public.dishes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  category    text not null,
  -- Prix en FCFA ; null = non communiqué (le plat ne peut pas être commandé)
  price       integer check (price is null or price >= 0),
  available   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Services de réservation ────────────────────────────────────────────────
create table public.reservation_services (
  id          text primary key,
  label       text not null,
  slots       time[] not null,
  -- Nombre maximum de couverts par service (demandes en attente + confirmées)
  capacity    integer not null check (capacity >= 0),
  active      boolean not null default true
);

-- ─── Réservations ───────────────────────────────────────────────────────────
create type public.reservation_status as enum ('pending', 'confirmed', 'declined', 'cancelled');

create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  service_id  text not null references public.reservation_services (id),
  date        date not null,
  time        time not null,
  guests      integer not null check (guests between 1 and 50),
  zone        text,
  name        text not null check (length(name) between 2 and 80),
  phone       text not null check (phone ~ '^0[0-9]{9}$'),
  email       text check (email is null or length(email) <= 254),
  comment     text check (comment is null or length(comment) <= 500),
  status      public.reservation_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index reservations_date_service_idx on public.reservations (date, service_id);

-- ─── Commandes ──────────────────────────────────────────────────────────────
create type public.order_status as enum (
  'received', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'
);
create type public.order_mode as enum ('pickup', 'delivery');

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  -- Numéro court affiché au client et en cuisine
  number          integer generated always as identity (start with 1001) unique,
  -- Jeton secret du lien de suivi (pas de compte client)
  token           text not null unique default replace(gen_random_uuid()::text, '-', ''),
  mode            public.order_mode not null,
  name            text not null check (length(name) between 2 and 80),
  phone           text not null check (phone ~ '^0[0-9]{9}$'),
  address         text check (address is null or length(address) <= 300),
  note            text check (note is null or length(note) <= 500),
  status          public.order_status not null default 'received',
  -- V1 : paiement sur place (retrait) ou à la livraison. Aucune donnée bancaire stockée.
  payment_method  text not null default 'on_site' check (payment_method in ('on_site')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  subtotal        integer not null check (subtotal >= 0),
  -- Frais de livraison : null tant que les zones ne sont pas définies (confirmés par le restaurant)
  delivery_fee    integer check (delivery_fee is null or delivery_fee >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (mode = 'pickup' or address is not null)
);
create index orders_created_at_idx on public.orders (created_at desc);

create table public.order_items (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  dish_id     uuid not null references public.dishes (id),
  -- Copie du nom et du prix au moment de la commande
  name        text not null,
  unit_price  integer not null check (unit_price >= 0),
  qty         integer not null check (qty between 1 and 20),
  line_total  integer generated always as (unit_price * qty) stored
);
create index order_items_order_idx on public.order_items (order_id);

-- ─── updated_at automatique ─────────────────────────────────────────────────
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger dishes_touch before update on public.dishes for each row execute function public.touch_updated_at();
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.dishes enable row level security;
alter table public.reservation_services enable row level security;
alter table public.reservations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Carte visible par tous" on public.dishes for select to anon, authenticated using (true);
create policy "Services visibles par tous" on public.reservation_services for select to anon, authenticated using (active);
-- Aucune politique sur reservations / orders / order_items : inaccessibles sans la clé secrète.

-- ════════════════════════════════════════════════════════════════════════════
-- create_reservation : vérifie le créneau et la capacité, puis enregistre une
-- demande « pending ». Erreurs : GUESTS_OUT_OF_RANGE, DATE_OUT_OF_RANGE,
-- SLOT_UNKNOWN, SLOT_PAST, SLOT_FULL.
-- Règles alignées sur src/config/site.ts (8 convives max, 21 jours, marge 60 min).
-- ════════════════════════════════════════════════════════════════════════════
create function public.create_reservation(
  p_date date, p_time time, p_guests integer, p_zone text,
  p_name text, p_phone text, p_email text, p_comment text
) returns table (id uuid, reference text)
language plpgsql security definer set search_path = '' as $$
declare
  -- Abidjan : UTC+0 toute l'année
  v_now     timestamp := now() at time zone 'Africa/Abidjan';
  v_service public.reservation_services%rowtype;
  v_booked  integer;
begin
  if p_guests is null or p_guests < 1 or p_guests > 8 then
    raise exception 'GUESTS_OUT_OF_RANGE';
  end if;
  if p_date is null or p_date < v_now::date or p_date > v_now::date + 21 then
    raise exception 'DATE_OUT_OF_RANGE';
  end if;

  select s.* into v_service from public.reservation_services s
   where s.active and p_time = any (s.slots) limit 1;
  if not found then
    raise exception 'SLOT_UNKNOWN';
  end if;
  if p_date + p_time < v_now + interval '60 minutes' then
    raise exception 'SLOT_PAST';
  end if;

  -- Un seul calcul de capacité à la fois par service et par date
  perform pg_advisory_xact_lock(hashtext('resa:' || p_date::text || ':' || v_service.id));

  select coalesce(sum(r.guests), 0) into v_booked from public.reservations r
   where r.date = p_date and r.service_id = v_service.id and r.status in ('pending', 'confirmed');
  if v_booked + p_guests > v_service.capacity then
    raise exception 'SLOT_FULL';
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

-- ════════════════════════════════════════════════════════════════════════════
-- create_order : recalcule tous les prix à partir de la carte et enregistre la
-- commande. p_items = [{"slug": "...", "qty": 2}, ...].
-- Erreurs : EMPTY_ORDER, TOO_MANY_LINES, BAD_QTY, UNKNOWN_DISH, DISH_UNAVAILABLE,
-- ADDRESS_REQUIRED.
-- ════════════════════════════════════════════════════════════════════════════
create function public.create_order(
  p_mode public.order_mode, p_name text, p_phone text, p_address text, p_note text, p_items jsonb
) returns table (id uuid, token text, number integer, subtotal integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_lines    integer;
  v_known    integer;
  v_orderable integer;
  v_order    public.orders%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'TOO_MANY_LINES';
  end if;
  if p_mode = 'delivery' and coalesce(trim(p_address), '') = '' then
    raise exception 'ADDRESS_REQUIRED';
  end if;

  create temp table tmp_lines on commit drop as
    select x.slug, sum(x.qty)::integer as qty
      from jsonb_to_recordset(p_items) as x (slug text, qty integer)
     group by x.slug;

  if exists (select 1 from tmp_lines l where l.qty is null or l.qty < 1 or l.qty > 20) then
    raise exception 'BAD_QTY';
  end if;

  select count(*), count(d.id), count(d.id) filter (where d.available and d.price is not null)
    into v_lines, v_known, v_orderable
    from tmp_lines l left join public.dishes d on d.slug = l.slug;
  if v_known < v_lines then
    raise exception 'UNKNOWN_DISH';
  end if;
  if v_orderable < v_lines then
    raise exception 'DISH_UNAVAILABLE';
  end if;

  insert into public.orders (mode, name, phone, address, note, subtotal)
  values (
    p_mode, p_name, p_phone,
    case when p_mode = 'delivery' then trim(p_address) end,
    nullif(trim(p_note), ''),
    (select sum(d.price * l.qty) from tmp_lines l join public.dishes d on d.slug = l.slug)
  )
  returning * into v_order;

  insert into public.order_items (order_id, dish_id, name, unit_price, qty)
  select v_order.id, d.id, d.name, d.price, l.qty
    from tmp_lines l join public.dishes d on d.slug = l.slug;

  return query select v_order.id, v_order.token, v_order.number, v_order.subtotal;
end $$;

-- Seul le serveur (clé secrète) peut appeler ces fonctions
revoke execute on function public.create_reservation(date, time, integer, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.create_order(public.order_mode, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_reservation(date, time, integer, text, text, text, text, text) to service_role;
grant execute on function public.create_order(public.order_mode, text, text, text, text, jsonb) to service_role;

-- ════════════════════════════════════════════════════════════════════════════
-- Données de départ PROVISOIRES (à remplacer par la carte et la capacité réelles)
-- ════════════════════════════════════════════════════════════════════════════
insert into public.reservation_services (id, label, slots, capacity) values
  ('dejeuner', 'Déjeuner', '{12:00,12:30,13:00,13:30}', 30),
  ('diner',    'Dîner',    '{19:00,19:30,20:00,20:30,21:00,21:30}', 30);

-- Prix d'EXEMPLE, identiques à src/data/demo-dishes.ts
insert into public.dishes (slug, name, category, price, available) values
  ('poisson-braise-attieke', 'Poisson braisé & attiéké', 'grillades',       6500, true),
  ('kedjenou-poulet',        'Kedjenou de poulet',       'plats',           8000, true),
  ('alloco',                 'Alloco',                   'accompagnements', 2500, true),
  ('sauce-graine',           'Sauce graine',             'plats',           7500, true),
  ('riz-gras-poulet',        'Riz gras au poulet',       'plats',           5000, true),
  ('sauce-feuille-foutou',   'Sauce feuille & foutou',   'plats',           7000, false),
  ('brochettes',             'Brochettes grillées',      'grillades',       4500, true),
  ('bissap',                 'Bissap',                   'boissons',        1500, true),
  ('banane-braisee',         'Banane braisée',           'accompagnements', 2000, true),
  ('gnamakoudji',            'Gnamakoudji',              'boissons',        1500, true);
