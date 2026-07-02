-- Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_net;

-- Optional private schema for integration secrets/config.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

-- Shared updated_at trigger helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Domain types
do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'order_status'
  ) then
    create type public.order_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
  end if;
end;
$$;

-- Clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  created_by uuid default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint clients_phone_unique unique (phone)
);

-- Orders table
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete restrict,
  service_type text not null,
  quantity integer not null check (quantity > 0),
  status public.order_status not null default 'pending',
  notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Ensure existing projects migrated from older schema versions allow anon inserts.
alter table if exists public.clients
  alter column created_by drop not null;

alter table if exists public.clients
  add column if not exists email text;

alter table if exists public.orders
  alter column created_by drop not null;

create index if not exists idx_clients_created_by on public.clients(created_by);
create index if not exists idx_orders_created_by on public.orders(created_by);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_client_id on public.orders(client_id);

drop trigger if exists trg_clients_set_updated_at on public.clients;
create trigger trg_clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- Integration settings (webhook target/token) protected in private schema.
create table if not exists private.integration_settings (
  id boolean primary key default true,
  is_enabled boolean not null default false,
  evolution_webhook_url text,
  evolution_token text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into private.integration_settings (id)
values (true)
on conflict (id) do nothing;

drop trigger if exists trg_integration_settings_set_updated_at on private.integration_settings;
create trigger trg_integration_settings_set_updated_at
before update on private.integration_settings
for each row
execute function public.set_updated_at();

-- Webhook notification when status changes to completed.
create or replace function public.notify_order_completed()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_url text;
  v_token text;
  v_enabled boolean;
  v_client_name text;
  v_client_phone text;
  v_client_email text;
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    select i.evolution_webhook_url, i.evolution_token, i.is_enabled
      into v_url, v_token, v_enabled
    from private.integration_settings i
    where i.id = true
    limit 1;

    if coalesce(v_enabled, false) and v_url is not null then
      select c.full_name, c.phone, c.email
        into v_client_name, v_client_phone, v_client_email
      from public.clients c
      where c.id = new.client_id;

      perform net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || coalesce(v_token, '')
        ),
        body := jsonb_build_object(
          'event', 'order.completed',
          'order_id', new.id,
          'client_id', new.client_id,
          'status', new.status,
          'recipient', jsonb_build_object(
            'name', v_client_name,
            'phone', v_client_phone,
            'email', v_client_email
          ),
          'message', format(
            'Hola %s, tu pedido %s está listo en Be Clean. ¡Te esperamos!',
            coalesce(v_client_name, 'cliente'),
            new.id::text
          )
        )
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_order_completed on public.orders;
create trigger trg_notify_order_completed
after update on public.orders
for each row
execute function public.notify_order_completed();

-- Public RPC used by cron keepalive jobs.
create or replace function public.healthcheck_keepalive()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object('ok', true, 'timestamp', timezone('utc', now()));
$$;

revoke all on function public.healthcheck_keepalive() from public;
grant execute on function public.healthcheck_keepalive() to anon;
grant execute on function public.healthcheck_keepalive() to authenticated;

-- RLS
alter table public.clients enable row level security;
alter table public.orders enable row level security;

drop policy if exists clients_select_own on public.clients;
drop policy if exists clients_insert_own on public.clients;
drop policy if exists clients_update_own on public.clients;
drop policy if exists clients_select_open on public.clients;
drop policy if exists clients_insert_open on public.clients;
drop policy if exists clients_update_open on public.clients;

create policy clients_select_open
on public.clients
for select
to anon, authenticated
using (true);

create policy clients_insert_open
on public.clients
for insert
to anon, authenticated
with check (true);

create policy clients_update_open
on public.clients
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists orders_select_own on public.orders;
drop policy if exists orders_insert_own on public.orders;
drop policy if exists orders_update_own on public.orders;
drop policy if exists orders_select_open on public.orders;
drop policy if exists orders_insert_open on public.orders;
drop policy if exists orders_update_open on public.orders;

create policy orders_select_open
on public.orders
for select
to anon, authenticated
using (true);

create policy orders_insert_open
on public.orders
for insert
to anon, authenticated
with check (true);

create policy orders_update_open
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

-- Optional read for dashboard metrics without opening write/delete.
drop policy if exists orders_delete_none on public.orders;
