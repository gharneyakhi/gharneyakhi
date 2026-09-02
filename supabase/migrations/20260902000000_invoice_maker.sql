-- فاکتور ساز backend: per-business letterhead profile, invoices, RLS and logo storage.
-- Builds on top of the initial migration (auth.users -> public.profiles trigger, set_updated_at()).

-- Re-declared defensively so this file also works when applied on its own.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- business_profiles — one row per user: everything that becomes the letterhead.
-- ---------------------------------------------------------------------------
create table public.business_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null default '',
  business_name_en text not null default '',
  slogan text not null default '',
  logo_path text,
  accent text not null default '#123f34',

  national_id text not null default '',
  economic_code text not null default '',
  registration_no text not null default '',
  postal_code text not null default '',

  phone text not null default '',
  mobile text not null default '',
  email text not null default '',
  website text not null default '',
  address text not null default '',

  bank_name text not null default '',
  bank_branch text not null default '',
  account_owner text not null default '',
  account_number text not null default '',
  card_number text not null default '',
  iban text not null default '',

  invoice_title text not null default 'فاکتور فروش',
  invoice_prefix text not null default 'INV',
  next_number integer not null default 1 check (next_number >= 1),
  currency text not null default 'toman' check (currency in ('toman', 'rial')),
  vat_enabled boolean not null default true,
  vat_rate numeric not null default 10 check (vat_rate >= 0 and vat_rate <= 100),
  show_logo boolean not null default true,
  show_amount_words boolean not null default true,
  show_bank_info boolean not null default true,
  signature_name text not null default '',
  thanks_note text not null default '',
  terms text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- invoices — items and customer travel as jsonb so any business can shape them.
-- Money columns are stored pre-computed so the dashboard can aggregate cheaply.
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  number text not null,
  serial integer not null default 1 check (serial >= 1),
  issue_date text not null default '',
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid')),

  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,

  currency text not null default 'toman' check (currency in ('toman', 'rial')),
  vat_enabled boolean not null default true,
  vat_rate numeric not null default 0 check (vat_rate >= 0 and vat_rate <= 100),
  discount_percent numeric not null default 0 check (discount_percent >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  paid_amount numeric not null default 0 check (paid_amount >= 0),
  notes text not null default '',
  terms text not null default '',

  subtotal numeric not null default 0,
  vat_amount numeric not null default 0,
  total_amount numeric not null default 0,
  due_amount numeric not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_owner_serial_idx on public.invoices (owner_id, serial desc);
create index invoices_owner_created_at_idx on public.invoices (owner_id, created_at desc);
create index invoices_owner_status_idx on public.invoices (owner_id, status);

create trigger business_profiles_set_updated_at before update on public.business_profiles
for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.business_profiles enable row level security;
alter table public.invoices enable row level security;

create policy "business_profile_select_own" on public.business_profiles
for select to authenticated
using (id = auth.uid());
create policy "business_profile_insert_own" on public.business_profiles
for insert to authenticated
with check (id = auth.uid());
create policy "business_profile_update_own" on public.business_profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "invoices_select_own" on public.invoices
for select to authenticated
using (owner_id = auth.uid());
create policy "invoices_insert_own" on public.invoices
for insert to authenticated
with check (owner_id = auth.uid());
create policy "invoices_update_own" on public.invoices
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
create policy "invoices_delete_own" on public.invoices
for delete to authenticated
using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Private logo storage. The frontend turns objects into signed-URL data URLs,
-- so the bucket never has to be public.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoice-assets',
  'invoice-assets',
  false,
  3145728,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "invoice_assets_insert_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'invoice-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "invoice_assets_select_own_folder" on storage.objects
for select to authenticated
using (
  bucket_id = 'invoice-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "invoice_assets_delete_own_folder" on storage.objects
for delete to authenticated
using (
  bucket_id = 'invoice-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

grant usage on schema public to authenticated;
revoke all on public.business_profiles from anon, authenticated;
grant select, insert, update on public.business_profiles to authenticated;
revoke all on public.invoices from anon, authenticated;
grant select, insert, update, delete on public.invoices to authenticated;

comment on column public.business_profiles.logo_path is
  'Private object path in the invoice-assets bucket. The frontend exchanges it for a signed URL, then a data URL.';
comment on column public.invoices.items is
  'Array of {id, title, note, unit, qty, unit_price, discount_percent}. Line maths happens in the client.';
comment on column public.invoices.total_amount is
  'Denormalised subtotal - discount + VAT, stored so dashboard aggregates stay a single query.';

-- ---------------------------------------------------------------------------
-- Optional cleanup: this project replaced the neighbour-reporting app.
-- Uncomment only if you no longer need that data — it is destructive.
-- ---------------------------------------------------------------------------
-- drop table if exists public.reports;
-- drop policy if exists "evidence_insert_own_folder" on storage.objects;
-- drop policy if exists "evidence_select_own_or_admin" on storage.objects;
-- drop policy if exists "evidence_delete_own_or_admin" on storage.objects;
-- delete from storage.buckets where id = 'report-evidence';
