-- Phone verification, enforced where it actually counts.
--
-- The checkout UI can *ask* a customer to confirm a number, but a UI is not a boundary: anyone
-- can call PostgREST directly. These two statements make the Cash-on-Delivery rule real:
--
--   1. `verified_phone()` returns the digits of the caller's SMS-confirmed mobile number, or
--      null when there is none. It must be `security definer` because `auth.users` is not
--      readable by the `authenticated` role.
--   2. `create_order` now refuses to place an order unless the number printed on the parcel is
--      that same confirmed number. The rider rings it at the door, so it has to be genuine.
--
-- Applied by hand in the Supabase SQL Editor (see PROGRESS.md §3).

create or replace function public.verified_phone() returns text
language sql
stable
security definer
set search_path = ''
as $$
    select case when phone_confirmed_at is not null
                then nullif(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), '')
           end
    from auth.users
    where id = auth.uid();
$$;

comment on function public.verified_phone() is
    'Digits of the caller''s SMS-confirmed mobile number, or null when nothing is confirmed.';

-- Nobody anonymous may ask about a number; only a signed-in caller about their own.
revoke execute on function public.verified_phone() from public, anon;
grant execute on function public.verified_phone() to authenticated;

-- ---------------------------------------------------------------------------
-- create_order, unchanged except for the phone guard at the top
-- ---------------------------------------------------------------------------

create or replace function public.create_order(p_items jsonb, p_recipient jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid      uuid := auth.uid();
    v_chars    text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I/O/0/1: read out over the phone
    v_id       text;
    v_try      integer;
    v_i        integer;
    v_placed   timestamptz := now();
    v_eta      timestamptz;
    v_name     text := btrim(coalesce(p_recipient ->> 'name', ''));
    v_phone    text := btrim(coalesce(p_recipient ->> 'phone', ''));
    v_city     text := btrim(coalesce(p_recipient ->> 'city', ''));
    v_address  text := btrim(coalesce(p_recipient ->> 'address', ''));
    v_notes    text := nullif(btrim(coalesce(p_recipient ->> 'notes', '')), '');
    v_item     jsonb;
    v_pack     record;
    v_qty      integer;
    v_items    jsonb := '[]'::jsonb;
    v_subtotal numeric(10, 2) := 0;
    v_shipping numeric(10, 2);
    v_total    numeric(10, 2);
begin
    if v_uid is null then
        raise exception 'Sign in before placing an order' using errcode = '42501';
    end if;

    -- A COD parcel is only deliverable if the rider can ring the number on it, so the order
    -- must be placed from a number this account confirmed by SMS, and it must be that number.
    if public.verified_phone() is null then
        raise exception 'Phone not verified' using errcode = '42501';
    end if;

    if public.verified_phone() is distinct from regexp_replace(v_phone, '\D', '', 'g') then
        raise exception 'Order phone must match the verified phone' using errcode = '42501';
    end if;

    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
        raise exception 'An order needs at least one item' using errcode = '22023';
    end if;

    if v_name = '' or v_phone = '' or v_city = '' or v_address = '' then
        raise exception 'Delivery details are incomplete' using errcode = '22023';
    end if;

    -- Resolve every line against the live catalogue. Prices come from the database,
    -- not from the request, so the amount quoted at checkout is the amount owed.
    for v_item in select * from jsonb_array_elements(p_items) loop
        v_qty := coalesce((v_item ->> 'qty')::integer, 0);
        if v_qty < 1 or v_qty > 99 then
            raise exception 'Quantity out of range' using errcode = '22023';
        end if;

        select pp.product_id, pp.label, pp.price, p.name, p.image
          into v_pack
          from public.product_packs pp
          join public.products p on p.id = pp.product_id
         where pp.product_id = v_item ->> 'product_id'
           and pp.label = v_item ->> 'label'
           and p.is_active;

        if not found then
            raise exception 'That jar size is no longer on sale' using errcode = '22023';
        end if;

        v_items := v_items || jsonb_build_object(
            'product_id', v_pack.product_id,
            'pack_label', v_pack.label,
            'name', v_pack.name,
            'qty', v_qty,
            'price', v_pack.price,
            'image', v_pack.image
        );
        v_subtotal := v_subtotal + v_pack.price * v_qty;
    end loop;

    -- Mirrors FREE_DELIVERY_FROM / DELIVERY_FLAT in lib/cart-math.ts. Duplicated on
    -- purpose: the client's copy is a hint, this one is the one that bills.
    v_shipping := case when v_subtotal >= 5000 then 0 else 250 end;
    v_total := v_subtotal + v_shipping;
    v_eta := v_placed + interval '48 hours';

    for v_try in 1..200 loop
        v_id := 'OG-';
        for v_i in 1..6 loop
            v_id := v_id || substr(v_chars, 1 + floor(random() * length(v_chars))::integer, 1);
        end loop;
        exit when not exists (select 1 from public.orders o where o.id = v_id);
    end loop;

    insert into public.orders (
        id, user_id, status, customer_name, customer_phone, city, address, notes,
        subtotal, shipping, total, placed_at, eta_at
    ) values (
        v_id, v_uid, 'pending', v_name, v_phone, v_city, v_address, v_notes,
        v_subtotal, v_shipping, v_total, v_placed, v_eta
    );

    insert into public.order_items (
        order_id, product_id, pack_label, name, qty, price, image, sort_order
    )
    select v_id,
           x ->> 'product_id',
           x ->> 'pack_label',
           x ->> 'name',
           (x ->> 'qty')::integer,
           (x ->> 'price')::numeric,
           x ->> 'image',
           (ord - 1)::integer
      from jsonb_array_elements(v_items) with ordinality as t(x, ord);

    insert into public.order_events (order_id, status, note, actor_id)
    values (v_id, 'pending', 'Order placed', v_uid);

    -- Shaped like the Order type in lib/orders.ts so the confirmation screen can
    -- render straight from the reply.
    return jsonb_build_object(
        'id', v_id,
        'placedAt', v_placed,
        'eta', v_eta,
        'recipient', jsonb_build_object(
            'name', v_name, 'phone', v_phone, 'city', v_city,
            'address', v_address, 'notes', coalesce(v_notes, '')
        ),
        'items', (
            select coalesce(jsonb_agg(jsonb_build_object(
                'name', x ->> 'name',
                'options', jsonb_build_array(x ->> 'pack_label'),
                'qty', (x ->> 'qty')::integer,
                'price', (x ->> 'price')::numeric,
                'image', x ->> 'image'
            ) order by ord), '[]'::jsonb)
            from jsonb_array_elements(v_items) with ordinality as t(x, ord)
        ),
        'totals', jsonb_build_object(
            'subtotal', v_subtotal, 'shipping', v_shipping, 'total', v_total
        )
    );
end;
$$;

comment on function public.create_order(jsonb, jsonb) is
    'Places an order for the signed-in customer. Requires an SMS-confirmed phone that matches the order phone.';
