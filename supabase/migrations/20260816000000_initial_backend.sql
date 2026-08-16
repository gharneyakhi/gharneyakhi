-- Hamsayehyar initial Supabase backend: auth profiles, reports, RLS and evidence storage.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  building_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  -- owner_id is private authorization metadata; user_id is the discloseable reporter link.
  owner_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('noise', 'parking', 'common', 'pet', 'other')),
  title text not null,
  description text not null check (char_length(description) between 1 and 500),
  location text not null,
  evidence_urls text[] not null default '{}',
  status text not null default 'reviewing' check (status in ('reviewing', 'answered', 'resolved')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  is_anonymous boolean not null default true,
  occurred_date text,
  occurred_time text,
  updates_count integer not null default 0 check (updates_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_owner_id_created_at_idx on public.reports (owner_id, created_at desc);
create index reports_user_id_idx on public.reports (user_id);
create index reports_status_idx on public.reports (status);

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = check_user_id and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', case when new.is_anonymous then 'کاربر مهمان' else '' end)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.reports enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "reports_select_own_or_admin" on public.reports
for select to authenticated
using (owner_id = auth.uid() or public.is_admin());
create policy "reports_insert_own_or_admin" on public.reports
for insert to authenticated
with check (owner_id = auth.uid() or public.is_admin());
create policy "reports_update_own_or_admin" on public.reports
for update to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());
create policy "reports_delete_admin_only" on public.reports
for delete to authenticated
using (public.is_admin());

-- Keep the bucket private. evidence_urls stores object paths, not public URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-evidence',
  'report-evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "evidence_insert_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'report-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "evidence_select_own_or_admin" on storage.objects
for select to authenticated
using (
  bucket_id = 'report-evidence'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
create policy "evidence_delete_own_or_admin" on storage.objects
for delete to authenticated
using (
  bucket_id = 'report-evidence'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

grant usage on schema public to authenticated;
revoke all on public.reports from anon, authenticated;
grant select, insert, update, delete on public.reports to authenticated;
-- Users may edit their own profile fields, but can never insert/delete a profile or promote their own role.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, building_name) on public.profiles to authenticated;

comment on column public.reports.owner_id is
  'Private ownership key used by RLS for both registered and anonymous Auth users.';
comment on column public.reports.user_id is
  'Nullable discloseable reporter link. It is null for anonymous reports; owner_id still allows secure owner-only access.';
comment on column public.reports.evidence_urls is
  'Private object paths in the report-evidence bucket. Generate signed URLs only after an authorized read.';
