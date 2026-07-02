-- Migration patch for existing projects.
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists pg_net;

alter table if exists public.clients
  add column if not exists email text;

alter table if exists public.orders
  add column if not exists service_mode text;

update public.orders
set service_mode = 'regular'
where service_mode is null;

alter table if exists public.orders
  alter column service_mode set default 'regular';

alter table if exists public.orders
  alter column service_mode set not null;

alter table if exists public.orders
  drop constraint if exists orders_service_mode_check;

alter table if exists public.orders
  add constraint orders_service_mode_check check (service_mode in ('regular', 'express'));

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
          'service_mode', new.service_mode,
          'recipient', jsonb_build_object(
            'name', v_client_name,
            'phone', v_client_phone,
            'email', v_client_email
          ),
          'message', format(
            'Hola %s, tu pedido %s está listo en Be Clin. ¡Te esperamos!',
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

notify pgrst, 'reload schema';
