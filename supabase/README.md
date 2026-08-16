# Supabase setup

Run the migration in `migrations/20260816000000_initial_backend.sql` with the Supabase CLI (`supabase db push`) or paste it into the Dashboard SQL Editor.

Then enable **Anonymous Sign-Ins** in Dashboard → Authentication → Providers → Anonymous Sign-Ins. Email/password sign-up is enabled by default; choose whether email confirmation is required under Authentication settings.

The migration creates:

- `profiles`, populated automatically whenever an Auth user is created
- `reports`, protected by RLS (owner-only; admins can access all rows)
- private Storage bucket `report-evidence`, limited to 10 MB and approved image/audio/PDF MIME types
- Storage RLS policies restricting each user to their own UUID folder

To promote an account, use the SQL Editor with a trusted administrator session:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

Never expose the Supabase `service_role` key to this frontend. Only `SUPABASE_URL` and the public `SUPABASE_ANON_KEY` belong in Vercel.
