-- Fix: recursión infinita en políticas RLS
-- Pega este SQL completo en el SQL Editor de Supabase y presiona Run

create or replace function public.get_my_role()
returns text language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- profiles
drop policy if exists "Managers can view all profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "View own profile" on public.profiles;
drop policy if exists "Managers view all profiles" on public.profiles;
drop policy if exists "Update own profile" on public.profiles;

create policy "View own profile" on public.profiles for select using (auth.uid() = id);
create policy "Managers view all profiles" on public.profiles for select using (public.get_my_role() in ('manager','admin'));
create policy "Update own profile" on public.profiles for update using (auth.uid() = id);

-- leads
drop policy if exists "Specialists see own leads" on public.leads;
drop policy if exists "Specialists can insert leads" on public.leads;
drop policy if exists "Specialists can update own leads" on public.leads;
drop policy if exists "Managers can delete leads" on public.leads;
drop policy if exists "Select leads" on public.leads;
drop policy if exists "Insert leads" on public.leads;
drop policy if exists "Update leads" on public.leads;
drop policy if exists "Delete leads" on public.leads;

create policy "Select leads" on public.leads for select using (specialist_id = auth.uid() or public.get_my_role() in ('manager','admin'));
create policy "Insert leads" on public.leads for insert with check (specialist_id = auth.uid());
create policy "Update leads" on public.leads for update using (specialist_id = auth.uid() or public.get_my_role() in ('manager','admin'));
create policy "Delete leads" on public.leads for delete using (public.get_my_role() in ('manager','admin'));

-- activities
drop policy if exists "Users see activities of visible leads" on public.activities;
drop policy if exists "Users can insert activities on visible leads" on public.activities;
drop policy if exists "Select activities" on public.activities;
drop policy if exists "Insert activities" on public.activities;

create policy "Select activities" on public.activities for select using (
  exists (select 1 from public.leads l where l.id = lead_id and (l.specialist_id = auth.uid() or public.get_my_role() in ('manager','admin')))
);
create policy "Insert activities" on public.activities for insert with check (
  exists (select 1 from public.leads l where l.id = lead_id and (l.specialist_id = auth.uid() or public.get_my_role() in ('manager','admin')))
);
