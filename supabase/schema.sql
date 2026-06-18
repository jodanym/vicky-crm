-- ============================================================
-- Vicky CRM — Schema (idempotente, se puede correr múltiples veces)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------
-- Tabla: profiles
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  avatar_url   text,
  role         text not null default 'specialist' check (role in ('specialist', 'manager', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Managers can view all profiles" on public.profiles;
create policy "Managers can view all profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('manager', 'admin')
    )
  );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger para crear profile automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- Tabla: leads
-- ----------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  email           text,
  phone           text,
  budget          numeric(15, 2),
  development     text,
  stage           text not null default 'primer_contacto'
                    check (stage in ('primer_contacto', 'enganche', 'firma_contrato', 'cierre')),
  specialist_id   uuid references public.profiles(id) on delete set null,
  position        integer not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "Specialists see own leads" on public.leads;
create policy "Specialists see own leads"
  on public.leads for select using (
    specialist_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('manager', 'admin')
    )
  );

drop policy if exists "Specialists can insert leads" on public.leads;
create policy "Specialists can insert leads"
  on public.leads for insert with check (specialist_id = auth.uid());

drop policy if exists "Specialists can update own leads" on public.leads;
create policy "Specialists can update own leads"
  on public.leads for update using (
    specialist_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('manager', 'admin')
    )
  );

drop policy if exists "Managers can delete leads" on public.leads;
create policy "Managers can delete leads"
  on public.leads for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('manager', 'admin')
    )
  );

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------
-- Tabla: activities
-- ----------------------------------------------------------------
create table if not exists public.activities (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  type        text not null check (type in ('call', 'email', 'note', 'stage_change', 'reminder')),
  body        text not null,
  duration_s  integer,
  created_at  timestamptz not null default now()
);

alter table public.activities enable row level security;

drop policy if exists "Users see activities of visible leads" on public.activities;
create policy "Users see activities of visible leads"
  on public.activities for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          l.specialist_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('manager', 'admin')
          )
        )
    )
  );

drop policy if exists "Users can insert activities on visible leads" on public.activities;
create policy "Users can insert activities on visible leads"
  on public.activities for insert with check (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          l.specialist_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('manager', 'admin')
          )
        )
    )
  );
