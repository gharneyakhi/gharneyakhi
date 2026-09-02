# Supabase setup

Run the migrations in `migrations/` in order — with the Supabase CLI (`supabase db push`) or by pasting them into the Dashboard SQL Editor:

1. `20260816000000_initial_backend.sql` — `profiles`, the `handle_new_user` trigger, `set_updated_at()`.
2. `20260902000000_invoice_maker.sql` — the فاکتور ساز tables, RLS policies and the logo bucket.

Then enable **Anonymous Sign-Ins** in Dashboard → Authentication → Providers → Anonymous Sign-Ins. Email/password sign-up is enabled by default; choose whether email confirmation is required under Authentication settings.

The invoice migration creates:

- `business_profiles`, one row per Auth user — every letterhead field, `logo_path`, accent colour, currency, default VAT rate and the boilerplate texts
- `invoices`, protected by RLS (owner-only select/insert/update/delete), with `items` and `customer` as `jsonb` and denormalised money columns for dashboard aggregates
- private Storage bucket `invoice-assets`, limited to 3 MB and `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`
- Storage RLS policies restricting each user to their own UUID folder

The frontend reads a logo by exchanging `logo_path` for a signed URL and then converting it to a `data:` URL, so the bucket never needs to be public and the letterhead renders identically on screen, in the print portal and in the JPG export.

Never expose the Supabase `service_role` key to this frontend. Only `SUPABASE_URL` and the public `SUPABASE_ANON_KEY` belong in Vercel.

## Removing the old neighbour-reporting tables

This project replaced the همسایه‌یار app. Its `reports` table and `report-evidence` bucket are still created by the first migration and are left untouched. If you no longer need that data, uncomment the cleanup block at the end of `20260902000000_invoice_maker.sql` — it is destructive and cannot be undone.
