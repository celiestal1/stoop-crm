-- Each agent's own settings, starting with their existing business phone
-- number (Stoop no longer provides Twilio numbers).
create table if not exists public.agent_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  business_phone text,
  business_phone_type text not null default 'cell'
    check (business_phone_type in ('cell', 'office', 'voip', 'other')),
  updated_at timestamptz not null default now()
);

alter table public.agent_settings enable row level security;

create policy "team sees agent settings" on public.agent_settings
  for select using (private.is_member(org_id));

create policy "agents add their own settings" on public.agent_settings
  for insert with check (user_id = (select auth.uid()) and private.is_member(org_id));

create policy "agents edit their own settings" on public.agent_settings
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and private.is_member(org_id));

create trigger agent_settings_updated_at before update on public.agent_settings
  for each row execute function public.set_updated_at();
