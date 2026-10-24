-- Role-based access control for the storefront, admin dashboard and driver app.
--
-- Roles live in a table rather than in `auth.users.raw_user_meta_data` because
-- user metadata is writable by the client: any signed-up customer could set
-- role = 'admin' on themselves with a single update call.

create type public.app_role as enum ('customer', 'admin', 'driver');

create table public.user_roles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    role public.app_role not null default 'customer',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.user_roles is
    'One row per user holding their application role. Written only by the service role.';

alter table public.user_roles enable row level security;

-- A user may read their own role so the app can render role-aware chrome.
-- There is deliberately no insert/update/delete policy: only the service role
-- (which bypasses RLS) and SQL run as the database owner can grant a role.
create policy "read own role"
    on public.user_roles
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

-- Security definer so policies on other tables can call this without the caller
-- needing select rights on user_roles. Empty search_path forces fully qualified
-- names, which is what keeps a definer function from being hijacked.
create or replace function public.has_role(uid uuid, wanted public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.user_roles
        where user_id = uid
          and role = wanted
    );
$$;

comment on function public.has_role(uuid, public.app_role) is
    'True when the given user holds the given role. Safe to call from RLS policies.';

revoke execute on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon;

-- Keep updated_at honest without trusting the caller to set it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger user_roles_touch_updated_at
    before update on public.user_roles
    for each row execute function public.touch_updated_at();
