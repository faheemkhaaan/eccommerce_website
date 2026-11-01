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

    update public.orders
       set status = p_status,
           delivered_at = case when p_status = 'delivered' then now() else delivered_at end
     where id = p_order_id;

    insert into public.order_events (order_id, status, note, actor_id)
    values (p_order_id, p_status, nullif(btrim(coalesce(p_note, '')), ''), v_uid);
end;
$$;