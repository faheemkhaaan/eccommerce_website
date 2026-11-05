-- Delivery-route statuses require an assigned rider.
--
-- The admin board may still confirm and pack a parcel before assignment, but
-- the moment it moves onto the road (`out_for_delivery`, `attempted`,
-- `delivered`) there must be a rider on the order. Enforcing this in SQL keeps
-- stale UIs and direct RPC calls from bypassing the rule.

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

    if p_status in ('out_for_delivery', 'attempted', 'delivered') and v_order.driver_id is null then
        raise exception 'Assign a rider before sending this parcel out for delivery' using errcode = '22023';
    end if;

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
    'Moves an order along, requires a rider before delivery-route statuses, decrements stock on delivery, and appends the matching event.';
