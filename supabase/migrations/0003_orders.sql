-- The order pipeline: real orders, a COD status trail, and rider assignment.
--
-- Until now orders lived in the browser (localStorage, see lib/orders.ts), so no
-- device could see another device's order: no status board, no rider assignment, and
-- tracking that broke the moment the customer switched phone.
--
-- Three deliberate choices:
--
--   1. Writes go through `security definer` functions, never through table policies.
--      `create_order` recomputes every price from `product_packs`, so a tampered cart
--      cannot change what the customer owes on delivery. `set_order_status`,
--      `assign_driver` and `grant_role` decide for themselves who may call them.
--   2. Reading is governed by ordinary RLS: a customer sees their own orders, a rider
--      sees the ones assigned to them, staff see everything.
--   3. Guest tracking does NOT read these tables. `public.track_order()` returns a
--      deliberately masked projection, so knowing a mobile number is not enough to
--      obtain somebody else's street address.

create type public.order_status as enum (
    'pending',           -- placed; nobody has confirmed it yet
    'confirmed',         -- staff have answered and accepted it
    'packed',            -- sealed and boxed at the dairy
    'out_for_delivery',  -- with a rider
    'delivered',         -- handed over, cash collected
    'attempted',         -- rider reached the address and nobody could receive it
    'cancelled',         -- dropped before dispatch
    'returned'           -- came back to the dairy after a failed delivery
);

comment on type public.order_status is
    'Lifecycle of a COD parcel. The first five are the visible timeline; attempted/cancelled/returned are outcomes.';

create table public.orders (
    id text primary key,
    user_id uuid references auth.users (id) on delete set null,
    status public.order_status not null default 'pending',

    customer_name text not null,
    customer_phone text not null,
    city text not null,
    address text not null,
    notes text,

    subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
    shipping numeric(10, 2) not null default 0 check (shipping >= 0),
    total numeric(10, 2) not null default 0 check (total >= 0),

    driver_id uuid references auth.users (id) on delete set null,

    placed_at timestamptz not null default now(),
    eta_at timestamptz,
    delivered_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Last seven digits of the phone. A plain generated column rather than a
    -- functional index over regexp_replace: same lookup, far less to go wrong.
    phone_tail text generated always as (right(customer_phone, 7)) stored
);

comment on table public.orders is
    'One row per COD order. Amounts are recomputed server-side from the catalogue, never taken from the request.';
comment on column public.orders.driver_id is
    'Rider currently responsible for this parcel. Only an admin may set it.';
comment on column public.orders.phone_tail is
    'Generated. Lets guest tracking match a mobile number without exposing the full number to a public function.';

create index orders_user_id_idx on public.orders (user_id);
create index orders_driver_id_idx on public.orders (driver_id);
create index orders_status_idx on public.orders (status);
create index orders_phone_tail_idx on public.orders (phone_tail);
create index orders_placed_at_idx on public.orders (placed_at desc);

create table public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id text not null references public.orders (id) on delete cascade,
    product_id text,
    pack_label text not null,
    name text not null,
    qty integer not null check (qty > 0),
    price numeric(10, 2) not null check (price >= 0),
    image text,
    sort_order integer not null default 0
);

comment on table public.order_items is
    'Frozen copy of what was bought at the price that applied. Pack prices may change later; a placed order must not.';

create index order_items_order_id_idx on public.order_items (order_id);

create table public.order_events (
    id uuid primary key default gen_random_uuid(),
    order_id text not null references public.orders (id) on delete cascade,
    status public.order_status,
    note text,
    actor_id uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
);

comment on table public.order_events is
    'Append-only trail. status is null for events that are not a status change, such as a rider being assigned.';

create index order_events_order_id_idx on public.order_events (order_id, created_at);

create trigger orders_touch_updated_at
    before update on public.orders
    for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Reading
-- ---------------------------------------------------------------------------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

-- Definer so the check itself is not filtered by the policy it is called from
-- (which would recurse), and so order_items / order_events can ask the same
-- question without repeating the three-way rule.
create or replace function public.can_read_order(target text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.orders o
        where o.id = target
          and (
              o.user_id = auth.uid()
              or public.has_role(auth.uid(), 'admin')
              or (o.driver_id = auth.uid() and public.has_role(auth.uid(), 'driver'))
          )
    );
$$;

comment on function public.can_read_order(text) is
    'True when the caller is the customer, the assigned rider, or an admin.';

-- Every table below is read-only for clients. There is deliberately no insert,
-- update or delete policy anywhere: all writes go through the functions further
-- down, which is what keeps `orders.total` trustworthy.
create policy "read own or assigned orders"
    on public.orders
    for select
    to authenticated
    using (public.can_read_order(id));

create policy "read items of visible orders"
    on public.order_items
    for select
    to authenticated
    using (public.can_read_order(order_id));

create policy "read events of visible orders"
    on public.order_events
    for select
    to authenticated
    using (public.can_read_order(order_id));

-- ---------------------------------------------------------------------------
-- Placing an order
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
    'Places an order for the signed-in customer. Items are [{product_id, label, qty}]; prices are resolved from product_packs.';

-- ---------------------------------------------------------------------------
-- Moving an order along
-- ---------------------------------------------------------------------------

create or replace function public.set_order_status(
    p_order_id text,
    p_status public.order_status,
    p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid   uuid := auth.uid();
    v_admin boolean := public.has_role(auth.uid(), 'admin');
    v_order public.orders;
begin
    select * into v_order from public.orders where id = p_order_id;
    if not found then
        raise exception 'No such order' using errcode = 'P0002';
    end if;

    if not v_admin then
        if not (public.has_role(v_uid, 'driver') and v_order.driver_id = v_uid) then
            raise exception 'Not authorised' using errcode = '42501';
        end if;
        -- A rider reports what happened at the door. Confirming, packing and
        -- cancelling stay with the shop.
        if p_status not in ('out_for_delivery', 'delivered', 'attempted') then
            raise exception 'A rider may only report delivery progress' using errcode = '42501';
        end if;
    end if;

    if v_order.status in ('delivered', 'cancelled', 'returned') then
        raise exception 'This order is already closed' using errcode = '22023';
    end if;

    update public.orders
       set status = p_status,
           delivered_at = case when p_status = 'delivered' then now() else delivered_at end
     where id = p_order_id;

    insert into public.order_events (order_id, status, note, actor_id)
    values (p_order_id, p_status, nullif(btrim(coalesce(p_note, '')), ''), v_uid);
end;
$$;

comment on function public.set_order_status(text, public.order_status, text) is
    'Moves an order along and appends the matching event. Admins may set any status; a rider only their own assigned order, and only out_for_delivery/delivered/attempted.';

create or replace function public.assign_driver(p_order_id text, p_driver_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid   uuid := auth.uid();
    v_email text;
begin
    if not public.has_role(v_uid, 'admin') then
        raise exception 'Not authorised' using errcode = '42501';
    end if;

    if not exists (select 1 from public.orders o where o.id = p_order_id) then
        raise exception 'No such order' using errcode = 'P0002';
    end if;

    if p_driver_id is null then
        update public.orders set driver_id = null where id = p_order_id;
        insert into public.order_events (order_id, status, note, actor_id)
        values (p_order_id, null, 'Rider unassigned', v_uid);
        return;
    end if;

    if not public.has_role(p_driver_id, 'driver') then
        raise exception 'That person is not a rider' using errcode = '22023';
    end if;

    select u.email::text into v_email from auth.users u where u.id = p_driver_id;

    update public.orders set driver_id = p_driver_id where id = p_order_id;

    insert into public.order_events (order_id, status, note, actor_id)
    values (p_order_id, null, 'Assigned to ' || coalesce(v_email, 'a rider'), v_uid);
end;
$$;

comment on function public.assign_driver(text, uuid) is
    'Admin only. Pass null to unassign. Logged on the order trail.';

-- ---------------------------------------------------------------------------
-- Public tracking
-- ---------------------------------------------------------------------------

-- Callable by anon on purpose: a guest tracks with the Order ID or the mobile
-- number they ordered with. The reply is masked — no street address, no full
-- name, no full number — so the lookup cannot be used to harvest addresses.
create or replace function public.track_order(p_query text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_q      text := btrim(coalesce(p_query, ''));
    v_digits text := regexp_replace(btrim(coalesce(p_query, '')), '\D', '', 'g');
    v_order  public.orders;
begin
    if length(v_q) < 4 then
        return null;
    end if;

    select * into v_order
      from public.orders o
     where upper(o.id) = upper(v_q)
        or (length(v_digits) >= 7 and o.phone_tail = right(v_digits, 7))
     order by (upper(o.id) = upper(v_q)) desc, o.placed_at desc
     limit 1;

    if not found then
        return null;
    end if;

    return jsonb_build_object(
        'id', v_order.id,
        'status', v_order.status,
        'placedAt', v_order.placed_at,
        'eta', v_order.eta_at,
        'city', v_order.city,
        'name', split_part(v_order.customer_name, ' ', 1),
        'phoneTail', v_order.phone_tail,
        'totals', jsonb_build_object(
            'subtotal', v_order.subtotal,
            'shipping', v_order.shipping,
            'total', v_order.total
        ),
        'items', coalesce((
            select jsonb_agg(jsonb_build_object(
                'name', i.name,
                'options', jsonb_build_array(i.pack_label),
                'qty', i.qty,
                'price', i.price,
                'image', i.image
            ) order by i.sort_order)
            from public.order_items i
            where i.order_id = v_order.id
        ), '[]'::jsonb),
        'events', coalesce((
            select jsonb_agg(jsonb_build_object(
                'status', e.status,
                'note', e.note,
                'at', e.created_at
            ) order by e.created_at)
            from public.order_events e
            where e.order_id = v_order.id
        ), '[]'::jsonb)
    );
end;
$$;

comment on function public.track_order(text) is
    'Guest lookup by Order ID or mobile number. Returns a masked projection — never the street address.';

-- ---------------------------------------------------------------------------
-- Staff: who exists, and who is a rider
-- ---------------------------------------------------------------------------

create or replace function public.list_users_with_roles(p_query text default null)
returns table (user_id uuid, email text, role public.app_role, joined_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_query text := btrim(coalesce(p_query, ''));
begin
    if not public.has_role(auth.uid(), 'admin') then
        raise exception 'Not authorised' using errcode = '42501';
    end if;

    return query
        select u.id, u.email::text, coalesce(r.role, 'customer'::public.app_role), u.created_at
          from auth.users u
          left join public.user_roles r on r.user_id = u.id
         where v_query = '' or u.email ilike '%' || v_query || '%'
         order by (r.role is not null) desc, u.created_at desc
         limit 100;
end;
$$;

comment on function public.list_users_with_roles(text) is
    'Admin only. Reads auth.users, which is why it is definer and not a policy.';

-- The only way a role is ever granted. `user_roles` has no write policy at all,
-- so without this function even an admin session could not promote anybody —
-- which is exactly the property that stops the client setting its own role.
create or replace function public.grant_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.has_role(auth.uid(), 'admin') then
        raise exception 'Not authorised' using errcode = '42501';
    end if;

    if p_user_id = auth.uid() and p_role <> 'admin' then
        raise exception 'You cannot take away your own admin role' using errcode = '22023';
    end if;

    if not exists (select 1 from auth.users u where u.id = p_user_id) then
        raise exception 'No such user' using errcode = 'P0002';
    end if;

    insert into public.user_roles (user_id, role)
    values (p_user_id, p_role)
    on conflict (user_id) do update
        set role = excluded.role,
            updated_at = now();
end;
$$;

comment on function public.grant_role(uuid, public.app_role) is
    'Admin only. Sets a user role, creating the row if needed.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke execute on function public.can_read_order(text) from public;
grant execute on function public.can_read_order(text) to authenticated;

revoke execute on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to authenticated;

revoke execute on function public.set_order_status(text, public.order_status, text) from public;
grant execute on function public.set_order_status(text, public.order_status, text) to authenticated;

revoke execute on function public.assign_driver(text, uuid) from public;
grant execute on function public.assign_driver(text, uuid) to authenticated;

revoke execute on function public.list_users_with_roles(text) from public;
grant execute on function public.list_users_with_roles(text) to authenticated;

revoke execute on function public.grant_role(uuid, public.app_role) from public;
grant execute on function public.grant_role(uuid, public.app_role) to authenticated;

revoke execute on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed: keep the sample parcel the tracking page demonstrates with
-- ---------------------------------------------------------------------------

-- user_id stays null, so RLS shows this to admins only. Guests reach it through
-- track_order(), which is a definer function and so is not filtered by RLS.
insert into public.orders (
    id, user_id, status, customer_name, customer_phone, city, address, notes,
    subtotal, shipping, total, placed_at, eta_at
) values (
    'OG-DEMO24', null, 'out_for_delivery',
    'Ayla Shireen', '+923001234567', 'Lahore',
    'House 24, Street 7, Gulberg III, near Liberty Market', 'Ring the bell twice.',
    3250, 0, 3250, now() - interval '8 minutes', now() + interval '47 hours'
);

insert into public.order_items (order_id, product_id, pack_label, name, qty, price, image, sort_order)
values (
    'OG-DEMO24', 'bilona-organic-ghee', '1 kg', 'Bilona Organic Ghee', 1, 3250,
    'https://images.unsplash.com/photo-1707425197254-266fec098cae?q=80&fm=jpg&fit=crop&w=900', 0
);

insert into public.order_events (order_id, status, note, created_at) values
    ('OG-DEMO24', 'pending',          'Order placed',                  now() - interval '8 minutes'),
    ('OG-DEMO24', 'confirmed',        'Confirmed by our team',         now() - interval '7 minutes'),
    ('OG-DEMO24', 'packed',           'Jar hand-checked and sealed',   now() - interval '5 minutes'),
    ('OG-DEMO24', 'out_for_delivery', 'Handed to the rider',           now() - interval '2 minutes');
