-- The agent's own website (for the Connect your website step) and whether
-- website inquiries are emailed to them (applied 2026-10-12).
alter table public.organizations add column if not exists website_url text;
alter table public.organizations add column if not exists lead_alerts boolean not null default true;
