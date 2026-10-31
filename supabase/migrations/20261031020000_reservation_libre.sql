-- ════════════════════════════════════════════════════════════════════════════
-- Réservation libre : nombre de convives saisi (1 à 100), toute date jusqu'à
-- un an, heure libre dans une plage de service (au lieu de créneaux fixes).
-- La capacité par service reste contrôlée ; la demande reste « pending ».
-- ════════════════════════════════════════════════════════════════════════════

-- Plages de service (heure d'arrivée possible) à la place des créneaux fixes
alter table public.reservation_services add column starts time, add column ends time;
update public.reservation_services set starts = '11:30', ends = '15:00' where id = 'dejeuner';
update public.reservation_services set starts = '18:30', ends = '22:30' where id = 'diner';
alter table public.reservation_services
  alter column starts set not null,
  alter column ends set not null,
  add constraint reservation_services_window_check check (starts < ends),
  drop column slots;

alter table public.reservations drop constraint reservations_guests_check;
alter table public.reservations add constraint reservations_guests_check check (guests between 1 and 100);

-- ─── Places restantes par service pour une date ─────────────────────────────
create function public.reservation_availability(p_date date)
returns table (service_id text, label text, starts time, ends time, capacity integer, remaining integer)
language sql stable security definer set search_path = '' as $$
  select s.id, s.label, s.starts, s.ends, s.capacity,
         greatest(s.capacity - coalesce(sum(r.guests) filter (where r.status in ('pending', 'confirmed')), 0), 0)::integer
    from public.reservation_services s
    left join public.reservations r on r.service_id = s.id and r.date = p_date
   where s.active
   group by s.id
   order by s.starts;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- create_reservation : mêmes paramètres qu'avant.
-- Erreurs : GUESTS_OUT_OF_RANGE, DATE_OUT_OF_RANGE, SLOT_UNKNOWN (heure hors
-- service), SLOT_PAST, SLOT_FULL (le détail contient les places restantes).
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.create_reservation(
  p_date date, p_time time, p_guests integer, p_zone text,
  p_name text, p_phone text, p_email text, p_comment text
) returns table (id uuid, reference text)
language plpgsql security definer set search_path = '' as $$
declare
  -- Abidjan : UTC+0 toute l'année
  v_now       timestamp := now() at time zone 'Africa/Abidjan';
  v_service   public.reservation_services%rowtype;
  v_remaining integer;
begin
  if p_guests is null or p_guests < 1 or p_guests > 100 then
    raise exception 'GUESTS_OUT_OF_RANGE';
  end if;
  if p_date is null or p_date < v_now::date or p_date > v_now::date + 365 then
    raise exception 'DATE_OUT_OF_RANGE';
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

revoke execute on function public.reservation_availability(date) from public, anon, authenticated;
grant execute on function public.reservation_availability(date) to service_role;
revoke execute on function public.create_reservation(date, time, integer, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_reservation(date, time, integer, text, text, text, text, text) to service_role;
