-- ════════════════════════════════════════════════════════════════════════════
-- Administration : historique des statuts de commande, livreur, droits fins.
-- ════════════════════════════════════════════════════════════════════════════

-- Livreur (nom libre, en attendant une vraie gestion de flotte)
alter table public.orders add column courier_name text check (courier_name is null or length(courier_name) <= 80);

-- ─── Historique des statuts (frise de suivi, temps de préparation réels) ────
create table public.order_status_log (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      public.order_status not null,
  changed_at  timestamptz not null default now(),
  -- Membre du personnel à l'origine du changement (null = client / système)
  changed_by  uuid references auth.users (id) on delete set null
);
create index order_status_log_order_idx on public.order_status_log (order_id, changed_at);

create function public.log_order_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_log (order_id, status, changed_by) values (new.id, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger orders_log_status after insert or update of status on public.orders
  for each row execute function public.log_order_status();

-- Commandes déjà enregistrées : point de départ de l'historique
insert into public.order_status_log (order_id, status, changed_at)
select o.id, 'received', o.created_at from public.orders o;

alter table public.order_status_log enable row level security;
create policy "Personnel : lit l'historique" on public.order_status_log for select to authenticated using ((select public.is_staff()));

-- ─── Droits fins : le personnel ne change que ce qui relève de son travail ──
-- (le RLS dit « qui » ; ces droits disent « quelles colonnes »)
revoke update on public.orders from anon, authenticated;
grant update (status, payment_status, delivery_fee, courier_name) on public.orders to authenticated;

revoke update on public.reservations from anon, authenticated;
grant update (status) on public.reservations to authenticated;

revoke insert, update, delete on public.order_items, public.order_status_log from anon, authenticated;
revoke insert, delete on public.orders, public.reservations from anon, authenticated;
