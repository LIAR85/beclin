-- Migration: add service_mode to orders and enforce allowed values.
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

notify pgrst, 'reload schema';
