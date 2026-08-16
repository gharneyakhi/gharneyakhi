# همسایه‌یار

یک اپلیکیشن فارسی و راست‌به‌چپ برای ثبت محرمانه و پیگیری گزارش‌های مزاحمت همسایگی، با بک‌اند واقعی Supabase.

## امکانات

- ثبت‌نام و ورود با ایمیل/رمز عبور و ورود ناشناس با Supabase Auth
- ذخیره و به‌روزرسانی گزارش‌ها در Postgres (بدون `localStorage`)
- Row Level Security: هر کاربر فقط گزارش‌های خود را می‌بیند و ادمین همه گزارش‌ها را
- آپلود خصوصی تصویر، فایل صوتی یا PDF در Supabase Storage
- پروفایل کاربر و نقش `user`/`admin`
- رابط واکنش‌گرا برای دسکتاپ و موبایل

## راه‌اندازی Supabase

1. یک پروژه در [Supabase](https://supabase.com) بسازید.
2. فایل `supabase/migrations/20260816000000_initial_backend.sql` را در **SQL Editor** اجرا کنید؛ یا با CLI دستور `supabase db push` را اجرا کنید.
3. در **Authentication → Providers → Anonymous Sign-Ins** ورود ناشناس را فعال کنید.
4. تنظیمات Email provider و تأیید ایمیل را مطابق نیاز پروژه تنظیم کنید.
5. فایل env محلی را بسازید:

```bash
cp .env.example .env
```

سپس مقادیر عمومی پروژه را از **Project Settings → API** وارد کنید:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

> فقط anon key عمومی را در فرانت‌اند/Vercel قرار دهید؛ هرگز `service_role` key را افشا نکنید.

در Vercel نیز همین دو Environment Variable را برای محیط‌های موردنظر تعریف و پروژه را redeploy کنید.

## ساختار دیتابیس و امنیت

Migration موارد زیر را خودکار می‌سازد:

- `profiles`: پروفایل متناظر با هر کاربر Auth؛ از طریق trigger ساخته می‌شود.
- `reports`: شامل `id`, `user_id`, `category`, `description`, `location`, `evidence_urls`, `status`, `created_at` و metadata لازم رابط کاربری.
- bucket خصوصی `report-evidence`: حداکثر ۱۰ مگابایت برای تصویر، صدا و PDF.
- policyهای RLS برای مشاهده/ثبت/تغییر گزارش‌های خود و دسترسی سراسری ادمین.
- policyهای Storage که فایل هر کاربر را در پوشه UUID خودش محدود می‌کنند.

کاربر مهمان نیز در Supabase Auth یک UUID ناشناس دارد. کلید خصوصی `owner_id` فقط برای مالکیت امن و RLS استفاده می‌شود؛ برای گزارش ناشناس، `user_id` واقعاً `null` ذخیره می‌شود و `is_anonymous` نیز عدم افشای هویت را مشخص می‌کند.

برای ادمین کردن یک حساب، در SQL Editor و فقط توسط مدیر پروژه اجرا کنید:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

## اجرا

```bash
npm install
npm run dev
```

بررسی build:

```bash
npm run build
```
