-- Each workspace's country, which sets its currency, time zone and labels
-- (applied 2026-10-12).
alter table public.organizations add column if not exists country text not null default 'US' check (country in ('US','JP'));
