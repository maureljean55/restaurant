-- create_order sans table temporaire (plus lisible pour l'analyseur Supabase, même comportement).
create or replace function public.create_order(
  p_mode public.order_mode, p_name text, p_phone text, p_address text, p_note text, p_items jsonb
) returns table (id uuid, token text, number integer, subtotal integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_lines     jsonb;  -- lignes regroupées par plat : [{"slug": "...", "qty": n}]
  v_count     integer;
  v_known     integer;
  v_orderable integer;
  v_order     public.orders%rowtype;
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

  select jsonb_agg(jsonb_build_object('slug', g.slug, 'qty', g.qty)) into v_lines
    from (select x.slug, sum(x.qty)::integer as qty
            from jsonb_to_recordset(p_items) as x (slug text, qty integer)
           group by x.slug) g;

  if exists (select 1 from jsonb_to_recordset(v_lines) as l (slug text, qty integer)
              where l.qty is null or l.qty < 1 or l.qty > 20) then
    raise exception 'BAD_QTY';
  end if;

  select count(*), count(d.id), count(d.id) filter (where d.available and d.price is not null)
    into v_count, v_known, v_orderable
    from jsonb_to_recordset(v_lines) as l (slug text, qty integer)
    left join public.dishes d on d.slug = l.slug;
  if v_known < v_count then
    raise exception 'UNKNOWN_DISH';
  end if;
  if v_orderable < v_count then
    raise exception 'DISH_UNAVAILABLE';
  end if;

  insert into public.orders (mode, name, phone, address, note, subtotal)
  values (
    p_mode, p_name, p_phone,
    case when p_mode = 'delivery' then trim(p_address) end,
    nullif(trim(p_note), ''),
    (select sum(d.price * l.qty)
       from jsonb_to_recordset(v_lines) as l (slug text, qty integer)
       join public.dishes d on d.slug = l.slug)
  )
  returning * into v_order;

  insert into public.order_items (order_id, dish_id, name, unit_price, qty)
  select v_order.id, d.id, d.name, d.price, l.qty
    from jsonb_to_recordset(v_lines) as l (slug text, qty integer)
    join public.dishes d on d.slug = l.slug;

  return query select v_order.id, v_order.token, v_order.number, v_order.subtotal;
end $$;

-- « create or replace » conserve les droits ; on les réaffirme par sécurité
revoke execute on function public.create_order(public.order_mode, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(public.order_mode, text, text, text, text, jsonb) to service_role;
