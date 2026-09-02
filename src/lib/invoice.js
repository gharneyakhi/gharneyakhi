import { parseNumber } from './format';

export const ACCENTS = [
  { id: 'teal', label: 'سبز یشمی', value: '#123f34' },
  { id: 'navy', label: 'سرمه‌ای', value: '#1f3557' },
  { id: 'wine', label: 'شرابی', value: '#7a2b3a' },
  { id: 'plum', label: 'ارغوانی', value: '#4c2f5e' },
  { id: 'olive', label: 'زیتونی', value: '#4a5a22' },
  { id: 'slate', label: 'طوسی تیره', value: '#3a4550' },
  { id: 'copper', label: 'مسی', value: '#8a4b23' },
  { id: 'ink', label: 'مشکی', value: '#23272b' },
];

/** Everything a business personalises from «تنظیم فاکتور»; every value lands on the invoice letterhead. */
export const emptyBusiness = () => ({
  // هویت کسب‌وکار
  business_name: '',
  business_name_en: '',
  slogan: '',
  logo_path: '',
  accent: '#123f34',
  // شناسه‌های قانونی
  national_id: '',
  economic_code: '',
  registration_no: '',
  postal_code: '',
  // راه‌های تماس
  phone: '',
  mobile: '',
  email: '',
  website: '',
  address: '',
  // اطلاعات بانکی
  bank_name: '',
  bank_branch: '',
  account_owner: '',
  account_number: '',
  card_number: '',
  iban: '',
  // پیش‌فرض‌های فاکتور
  invoice_title: 'فاکتور فروش',
  invoice_prefix: 'INV',
  next_number: 1,
  currency: 'toman',
  vat_enabled: true,
  vat_rate: 10,
  show_logo: true,
  show_amount_words: true,
  show_bank_info: true,
  thanks_note: 'از اعتماد و خرید شما سپاسگزاریم.',
  terms: '',
  signature_name: '',
});

/** Field groups rendered in the settings page and, when filled, on the letterhead. */
export const BUSINESS_GROUPS = [
  {
    id: 'identity',
    title: 'هویت کسب‌وکار',
    hint: 'نام و لوگویی که بالای فاکتور چاپ می‌شود.',
    fields: [
      { key: 'business_name', label: 'نام کسب‌وکار', placeholder: 'مثلاً بازرگانی آرین‌تجهیز', required: true, span: 2 },
      { key: 'business_name_en', label: 'نام انگلیسی (اختیاری)', placeholder: 'Arian Tajhiz Co.', dir: 'ltr', span: 2 },
      { key: 'slogan', label: 'شعار یا زمینه فعالیت', placeholder: 'تأمین تجهیزات صنعتی از ۱۳۸۵', span: 2 },
    ],
  },
  {
    id: 'legal',
    title: 'شناسه‌های قانونی',
    hint: 'این موارد برای فاکتورهای رسمی لازم‌اند.',
    fields: [
      { key: 'national_id', label: 'شناسه ملی / کد ملی', placeholder: '۱۴۰۰۱۲۳۴۵۶۷' },
      { key: 'economic_code', label: 'کد اقتصادی', placeholder: '۴۱۱۲۲۳۳۴۴۵۵۶' },
      { key: 'registration_no', label: 'شماره ثبت', placeholder: '۵۲۴۳۱۸' },
      { key: 'postal_code', label: 'کد پستی', placeholder: '۱۲۳۴۵۶۷۸۹۰' },
    ],
  },
  {
    id: 'contact',
    title: 'راه‌های تماس',
    hint: 'هر موردی که پر کنید در سربرگ نمایش داده می‌شود.',
    fields: [
      { key: 'phone', label: 'تلفن ثابت', placeholder: '۰۲۱-۸۸۷۷۶۶۵۵' },
      { key: 'mobile', label: 'تلفن همراه', placeholder: '۰۹۱۲۱۲۳۴۵۶۷' },
      { key: 'email', label: 'ایمیل', placeholder: 'info@example.com', dir: 'ltr' },
      { key: 'website', label: 'وب‌سایت', placeholder: 'www.example.com', dir: 'ltr' },
      { key: 'address', label: 'نشانی کامل', placeholder: 'تهران، خیابان ولیعصر، پلاک ۱۲۰، واحد ۴', span: 2, textarea: true },
    ],
  },
  {
    id: 'bank',
    title: 'اطلاعات بانکی',
    hint: 'در پایین فاکتور چاپ می‌شود تا مشتری بداند به کدام حساب واریز کند.',
    fields: [
      { key: 'bank_name', label: 'نام بانک', placeholder: 'بانک ملت' },
      { key: 'bank_branch', label: 'شعبه', placeholder: 'شعبه مرکزی - کد ۱۲۳۴' },
      { key: 'account_owner', label: 'به نام', placeholder: 'شرکت بازرگانی آرین‌تجهیز', span: 2 },
      { key: 'account_number', label: 'شماره حساب', placeholder: '۱۲۳۴۵۶۷۸۹۰' },
      { key: 'card_number', label: 'شماره کارت', placeholder: '۶۱۰۴-۳۳۷۸-…' },
      { key: 'iban', label: 'شماره شبا', placeholder: 'IR۸۲۰۵۴۰۱۰۲۳۰۰۰۱۲۳۴۵۶۷۸۹۰', dir: 'ltr', span: 2 },
    ],
  },
  {
    id: 'invoice',
    title: 'پیش‌فرض‌های فاکتور',
    hint: 'عنوان، شماره‌گذاری، واحد پول و مالیات.',
    fields: [
      { key: 'invoice_title', label: 'عنوان روی فاکتور', placeholder: 'فاکتور فروش' },
      { key: 'invoice_prefix', label: 'پیشوند شماره فاکتور', placeholder: 'INV', dir: 'ltr' },
      { key: 'next_number', label: 'شماره بعدی فاکتور', placeholder: '۱', type: 'number' },
      { key: 'vat_rate', label: 'درصد مالیات بر ارزش افزوده', placeholder: '۱۰', type: 'number' },
      { key: 'signature_name', label: 'نام امضاکننده / مهر', placeholder: 'مدیر فروش', span: 2 },
      { key: 'thanks_note', label: 'پیام تشکر پایین فاکتور', placeholder: 'از اعتماد شما سپاسگزاریم.', span: 2 },
      { key: 'terms', label: 'شرایط و توضیحات', placeholder: 'کالای فروخته‌شده تا ۷ روز قابل تعویض است.', span: 2, textarea: true },
    ],
  },
];

/** Only these fields can appear on the letterhead, in this order. */
export const LETTERHEAD_FIELDS = [
  { key: 'national_id', label: 'شناسه ملی' },
  { key: 'economic_code', label: 'کد اقتصادی' },
  { key: 'registration_no', label: 'شماره ثبت' },
  { key: 'postal_code', label: 'کد پستی' },
  { key: 'phone', label: 'تلفن' },
  { key: 'mobile', label: 'همراه' },
  { key: 'email', label: 'ایمیل', dir: 'ltr' },
  { key: 'website', label: 'وب‌سایت', dir: 'ltr' },
  { key: 'address', label: 'نشانی', wide: true },
];

export const BANK_FIELDS = [
  { key: 'bank_name', label: 'بانک' },
  { key: 'bank_branch', label: 'شعبه' },
  { key: 'account_owner', label: 'به نام' },
  { key: 'account_number', label: 'شماره حساب' },
  { key: 'card_number', label: 'شماره کارت' },
  { key: 'iban', label: 'شبا', dir: 'ltr' },
];

/** Non-empty letterhead rows, in display order. */
export function letterheadEntries(business) {
  return LETTERHEAD_FIELDS
    .filter((field) => String(business?.[field.key] ?? '').trim())
    .map((field) => ({ ...field, value: String(business[field.key]).trim() }));
}

export function bankEntries(business) {
  return BANK_FIELDS
    .filter((field) => String(business?.[field.key] ?? '').trim())
    .map((field) => ({ ...field, value: String(business[field.key]).trim() }));
}

export function businessName(business) {
  return String(business?.business_name ?? '').trim() || 'نام کسب‌وکار شما';
}

export const INVOICE_STATUSES = {
  draft: { label: 'پیش‌نویس', tone: 'gray' },
  issued: { label: 'صادر شده', tone: 'blue' },
  paid: { label: 'پرداخت شده', tone: 'teal' },
};

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function createItem(overrides = {}) {
  return { id: createId(), title: '', unit: 'عدد', qty: 1, unit_price: 0, discount_percent: 0, ...overrides };
}

export function buildNumber(business, serial) {
  const prefix = String(business?.invoice_prefix ?? '').trim();
  const padded = String(Math.max(1, Math.round(parseNumber(serial) || 1))).padStart(4, '0');
  return prefix ? `${prefix}-${padded}` : padded;
}

export function createInvoice(business, overrides = {}) {
  const serial = parseNumber(business?.next_number) || 1;
  return {
    id: null,
    serial,
    number: buildNumber(business, serial),
    date: '',
    status: 'issued',
    customer: { name: '', code: '', phone: '', national_id: '', address: '', email: '' },
    items: [createItem()],
    currency: business?.currency || 'toman',
    vat_enabled: business?.vat_enabled ?? true,
    vat_rate: parseNumber(business?.vat_rate) || 0,
    discount_percent: 0,
    discount_amount: 0,
    paid_amount: 0,
    notes: '',
    terms: business?.terms || '',
    ...overrides,
  };
}

/** Line maths: per-item discount first, then the invoice-level discount, then VAT. */
export function lineTotals(item) {
  const qty = parseNumber(item?.qty);
  const unitPrice = parseNumber(item?.unit_price);
  const gross = qty * unitPrice;
  const discount = gross * (parseNumber(item?.discount_percent) / 100);
  return { gross, discount, net: gross - discount };
}

export function computeTotals(invoice) {
  const lines = (invoice?.items || []).map((item) => ({ item, ...lineTotals(item) }));
  const subtotal = lines.reduce((sum, line) => sum + line.gross, 0);
  const lineDiscount = lines.reduce((sum, line) => sum + line.discount, 0);
  const discountPercent = parseNumber(invoice?.discount_percent);
  const percentDiscount = (subtotal - lineDiscount) * (discountPercent / 100);
  const invoiceDiscount = discountPercent > 0 ? percentDiscount : parseNumber(invoice?.discount_amount);
  const discount = lineDiscount + invoiceDiscount;
  const taxable = Math.max(0, subtotal - discount);
  const vatAmount = invoice?.vat_enabled ? taxable * (parseNumber(invoice?.vat_rate) / 100) : 0;
  const total = taxable + vatAmount;
  const paid = parseNumber(invoice?.paid_amount);
  return {
    lines,
    subtotal,
    lineDiscount,
    invoiceDiscount,
    discount,
    taxable,
    vatAmount,
    total,
    paid,
    due: total - paid,
    count: lines.reduce((sum, line) => sum + parseNumber(line.item?.qty), 0),
  };
}

/** Derives the display status from the paid amount when the caller has not overridden it. */
export function effectiveStatus(invoice, totals = computeTotals(invoice)) {
  if (invoice?.status === 'draft') return 'draft';
  if (totals.total > 0 && totals.due <= 0) return 'paid';
  return invoice?.status === 'paid' ? 'paid' : 'issued';
}
