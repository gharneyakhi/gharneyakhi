import { requireSupabase } from '../lib/supabase';
import { emptyBusiness, createId } from '../lib/invoice';
import { parseNumber } from '../lib/format';

const BUCKET = 'invoice-assets';

const TEXT_FIELDS = [
  'business_name', 'business_name_en', 'slogan',
  'national_id', 'economic_code', 'registration_no', 'postal_code',
  'phone', 'mobile', 'email', 'website', 'address',
  'bank_name', 'bank_branch', 'account_owner', 'account_number', 'card_number', 'iban',
  'invoice_title', 'invoice_prefix', 'signature_name', 'thanks_note', 'terms',
];

const BOOL_FIELDS = ['vat_enabled', 'show_logo', 'show_amount_words', 'show_bank_info'];

function toProfile(row) {
  const base = emptyBusiness();
  if (!row) return base;
  TEXT_FIELDS.forEach((key) => { base[key] = row[key] ?? base[key]; });
  BOOL_FIELDS.forEach((key) => { base[key] = row[key] ?? base[key]; });
  base.accent = row.accent || base.accent;
  base.logo_path = row.logo_path || '';
  base.next_number = Math.max(1, Math.round(parseNumber(row.next_number) || 1));
  base.vat_rate = parseNumber(row.vat_rate) || 0;
  base.currency = row.currency === 'rial' ? 'rial' : 'toman';
  return base;
}

function toRow(profile) {
  const row = {
    accent: profile.accent || '#123f34',
    logo_path: profile.logo_path || null,
    next_number: Math.max(1, Math.round(parseNumber(profile.next_number) || 1)),
    vat_rate: parseNumber(profile.vat_rate) || 0,
    currency: profile.currency === 'rial' ? 'rial' : 'toman',
  };
  TEXT_FIELDS.forEach((key) => { row[key] = String(profile[key] ?? '').trim(); });
  BOOL_FIELDS.forEach((key) => { row[key] = Boolean(profile[key]); });
  return row;
}

/** Loads the signed-in user's business profile, creating a blank one on first use. */
export async function fetchBusiness() {
  const { data: { user } } = await requireSupabase().auth.getUser();
  if (!user) throw new Error('برای ذخیره تنظیم فاکتور باید وارد حساب شوید.');

  const { data, error } = await requireSupabase()
    .from('business_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;

  if (data) return toProfile(data);

  const fresh = toProfile(null);
  const { data: created, error: insertError } = await requireSupabase()
    .from('business_profiles')
    .insert({ id: user.id, ...toRow(fresh) })
    .select()
    .single();
  // A concurrent first-run insert is fine — fall back to reading the row back.
  if (insertError) {
    const { data: retry, error: retryError } = await requireSupabase()
      .from('business_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (retryError) throw retryError;
    return toProfile(retry);
  }
  return toProfile(created);
}

export async function saveBusiness(profile) {
  const { data: { user } } = await requireSupabase().auth.getUser();
  if (!user) throw new Error('برای ذخیره تنظیم فاکتور باید وارد حساب شوید.');

  const { data, error } = await requireSupabase()
    .from('business_profiles')
    .upsert({ id: user.id, ...toRow(profile) }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return toProfile(data);
}

const LOGO_LIMIT = 3 * 1024 * 1024;

export async function uploadLogo(file) {
  if (!file) throw new Error('فایلی انتخاب نشده است.');
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
    throw new Error('فقط فایل تصویری PNG، JPG، WEBP یا SVG مجاز است.');
  }
  if (file.size > LOGO_LIMIT) throw new Error('حجم لوگو باید کمتر از ۳ مگابایت باشد.');

  const { data: { user } } = await requireSupabase().auth.getUser();
  if (!user) throw new Error('برای بارگذاری لوگو باید وارد حساب شوید.');

  const extension = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${user.id}/logo-${createId()}.${extension}`;

  const { error } = await requireSupabase().storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removeLogo(path) {
  if (!path) return;
  const { error } = await requireSupabase().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/**
 * Turns a private Storage object into a data: URL.
 * A data URL keeps the letterhead identical on screen, in the print portal and in the JPG export,
 * with no cross-origin fetch to trip over.
 */
export async function logoToDataUrl(path) {
  if (!path) return '';
  const { data, error } = await requireSupabase().storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;

  const response = await fetch(data.signedUrl);
  if (!response.ok) throw new Error('دریافت لوگو ممکن نشد.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('خواندن فایل لوگو ناموفق بود.'));
    reader.readAsDataURL(blob);
  });
}
