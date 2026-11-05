-- Delivered orders become real sales here.
--
-- The UI can show "delivered", but the database needs to make that mean
-- something operational too:
--
--   1. The order's cash is now genuinely received, so dashboard revenue can be
--      derived from `orders.total where status = 'delivered'`.
--   2. The sold pack quantities must come out of `product_packs.stock`, or the
--      admin stock view and the storefront stay inflated after handover.
--
-- `stock_deducted_at` makes the inventory mutation idempotent: this migration can
-- backfill old delivered orders once, and future `delivered` transitions can do it
-- in the same transaction as the status change without ever double-deducting.

alter table public.orders
    add column if not exists stock_deducted_at timestamptz;

comment on column public.orders.stock_deducted_at is
    'When inventory was deducted for this order. Null until a delivered parcel has reduced stock.';

do $$
declare
    v_order record;
    v_item  record;
begin
    -- Backfill historical delivered orders exactly once.
    for v_order in
        select id, delivered_at
          from public.orders
         where status = 'delivered'
           and stock_deducted_at is null
    loop
        for v_item in
            select oi.product_id, oi.pack_label, sum(oi.qty)::integer as qty
              from public.order_items oi
             where oi.order_id = v_order.id
             group by oi.product_id, oi.pack_label
        loop
            update public.product_packs
               set stock = stock - v_item.qty
             where product_id = v_item.product_id
               and label = v_item.pack_label
               and stock >= v_item.qty;

            if not found then
                raise exception 'Not enough stock remains to backfill delivered order % (%).', v_order.id, v_item.pack_label
                    using errcode = '22023';
            end if;
        end loop;

        update public.orders
           set stock_deducted_at = coalesce(stock_deducted_at, v_order.delivered_at, now())
         where id = v_order.id;
    end loop;
end
$$;

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
    v_item  record;
begin
    select * into v_order from public.orders where id = p_order_id;
    if not found then
        raise exception 'No such order' using errcode = 'P0002';
    end if;

    if not v_admin then
        if not (public.has_role(v_uid, 'driver') and v_order.driver_id = v_uid) then
            raise exception 'Not authorised' using errcode = '42501';
        end if;
        if not (
            (v_order.status = 'packed'           and p_status = 'out_for_delivery') or
            (v_order.status = 'out_for_delivery' and p_status in ('delivered', 'attempted')) or
            (v_order.status = 'attempted'        and p_status in ('out_for_delivery', 'delivered'))
        ) then
            raise exception 'A rider may only report delivery progress' using errcode = '42501';
        end if;
    end if;

    if v_order.status in ('delivered', 'cancelled', 'returned') then
        raise exception 'This order is already closed' using errcode = '22023';
    end if;

    -- Once the parcel is actually handed over, those jars are no longer on the
    -- shelf. Deduct each ordered pack exactly once, in the same transaction as
    -- the status update, so driver-reported deliveries update inventory too.
    if p_status = 'delivered' then
        if v_order.stock_deducted_at is null then
            for v_item in
                select oi.product_id, oi.pack_label, sum(oi.qty)::integer as qty
                  from public.order_items oi
                 where oi.order_id = p_order_id
                 group by oi.product_id, oi.pack_label
            loop
                update public.product_packs
                   set stock = stock - v_item.qty
                 where product_id = v_item.product_id
                   and label = v_item.pack_label
                   and stock >= v_item.qty;

                if not found then
                    raise exception 'Not enough stock remains for %', v_item.pack_label using errcode = '22023';
                end if;
            end loop;
        end if;
    end if;

    update public.orders
       set status = p_status,
           delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
           stock_deducted_at = case
               when p_status = 'delivered' and stock_deducted_at is null then now()
               else stock_deducted_at
           end
     where id = p_order_id;

    insert into public.order_events (order_id, status, note, actor_id)
    values (p_order_id, p_status, nullif(btrim(coalesce(p_note, '')), ''), v_uid);
end;
$$;

comment on function public.set_order_status(text, public.order_status, text) is
    'Moves an order along, decrements stock when it becomes delivered, and appends the matching event.';
