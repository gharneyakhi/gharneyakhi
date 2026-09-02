// Persian formatting helpers shared by the whole فاکتور ساز app.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFa(value) {
  return String(value ?? '').replace(/\d/g, (digit) => FA_DIGITS[digit]);
}

export function toEnDigits(value) {
  return String(value ?? '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

/** Accepts "۱۲٬۳۴۵" / "12,345" / "abc" and returns a finite number (0 when unparsable). */
export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = toEnDigits(value).replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value, fractionDigits = 0) {
  const num = Number.isFinite(value) ? value : parseNumber(value);
  return toFa(
    num.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }),
  );
}

export const CURRENCIES = {
  toman: { id: 'toman', label: 'تومان', short: 'ت', rate: 1 },
  rial: { id: 'rial', label: 'ریال', short: 'ر', rate: 1 },
};

export function currencyLabel(currency) {
  return CURRENCIES[currency]?.label || CURRENCIES.toman.label;
}

export function formatMoney(value, currency = 'toman', { withUnit = true } = {}) {
  const amount = formatNumber(Math.round(parseNumber(value)));
  return withUnit ? `${amount} ${currencyLabel(currency)}` : amount;
}

/** Strips every character a numeric input should not contain, keeping Persian digits readable. */
export function sanitizeAmount(value) {
  return toEnDigits(value).replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const UNITS = [
  { id: 'عدد', label: 'عدد' },
  { id: 'کیلوگرم', label: 'کیلوگرم' },
  { id: 'گرم', label: 'گرم' },
  { id: 'متر', label: 'متر' },
  { id: 'مترمربع', label: 'مترمربع' },
  { id: 'لیتر', label: 'لیتر' },
  { id: 'بسته', label: 'بسته' },
  { id: 'جعبه', label: 'جعبه' },
  { id: 'ساعت', label: 'ساعت' },
  { id: 'روز', label: 'روز' },
  { id: 'ماه', label: 'ماه' },
  { id: 'جلسه', label: 'جلسه' },
  { id: 'مورد', label: 'مورد' },
];

// ---------- تاریخ ----------

const DATE_FORMAT = (() => {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return null;
  }
})();

/** Today as a Persian calendar string such as 1405/06/11 (Latin digits, easy to edit). */
export function todayPersian() {
  if (DATE_FORMAT) {
    const parts = Object.fromEntries(DATE_FORMAT.formatToParts(new Date()).map((p) => [p.type, p.value]));
    if (parts.year) return `${parts.year}/${parts.month}/${parts.day}`;
  }
  return new Date().toISOString().slice(0, 10);
}

export function todayPersianLong() {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return todayPersian();
  }
}

// ---------- مبلغ به حروف ----------

const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const TEENS = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const HUNDREDS = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'بیلیون', 'بیلیارد', 'تریلیون'];

function threeDigitsToWords(chunk) {
  const words = [];
  const hundred = Math.floor(chunk / 100);
  const rest = chunk % 100;
  if (hundred) words.push(HUNDREDS[hundred]);
  if (rest >= 10 && rest < 20) {
    words.push(TEENS[rest - 10]);
  } else {
    const ten = Math.floor(rest / 10);
    const one = rest % 10;
    if (ten) words.push(TENS[ten]);
    if (one) words.push(ONES[one]);
  }
  return words.join(' و ');
}

/** 1234567 -> «یک میلیون و دویست و سی و چهار هزار و پانصد و شصت و هفت» */
export function amountToWords(value, currency = 'toman') {
  const amount = Math.abs(Math.round(parseNumber(value)));
  if (amount === 0) return `صفر ${currencyLabel(currency)}`;
  const groups = [];
  let remaining = amount;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  const parts = [];
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const chunk = groups[index];
    if (!chunk) continue;
    const words = threeDigitsToWords(chunk);
    parts.push(SCALES[index] ? `${words} ${SCALES[index]}` : words);
  }
  return `${parts.join(' و ')} ${currencyLabel(currency)}`;
}

export function truncate(text, max = 60) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
