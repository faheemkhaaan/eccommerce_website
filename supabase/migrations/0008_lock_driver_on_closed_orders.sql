-- Closed parcels should not be re-assigned.
--
-- Once an order is delivered, cancelled or returned, changing the rider no
-- longer reflects any real-world operation. Enforce that in SQL so stale admin
-- pages and direct RPC calls cannot rewrite history.

create or replace function public.assign_driver(p_order_id text, p_driver_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid   uuid := auth.uid();
    v_email text;
    v_order public.orders;
begin
    if not public.has_role(v_uid, 'admin') then
        raise exception 'Not authorised' using errcode = '42501';
    end if;

    select * into v_order from public.orders where id = p_order_id;
    if not found then
        raise exception 'No such order' using errcode = 'P0002';
    end if;

    if v_order.status in ('delivered', 'cancelled', 'returned') then
        raise exception 'This order is already closed' using errcode = '22023';
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
    'Admin only. Pass null to unassign. Closed parcels cannot be re-assigned. Logged on the order trail.';
