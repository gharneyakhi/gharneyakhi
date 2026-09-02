import { toJpeg } from 'html-to-image';
import { amountToWords, formatNumber, parseNumber, toEnDigits, toFa } from './format';
import {
  bankEntries,
  businessName,
  computeTotals,
  effectiveStatus,
  INVOICE_STATUSES,
  letterheadEntries,
} from './invoice';
import { buildWorkbook, S } from './xlsx';

export function safeFileName(name, fallback = 'invoice') {
  const cleaned = toEnDigits(String(name ?? ''))
    .replace(/[\\/:*?"<>|\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || fallback;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick to start the download before revoking the object URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------- پرینت ----------

/**
 * Prints the A4 copy that lives in the body-level print portal.
 * CSS hides #root while @media print is active, so only the invoice reaches the paper.
 */
export function printInvoice() {
  const cleanup = () => {
    document.body.classList.remove('printing');
    window.removeEventListener('afterprint', cleanup);
  };
  document.body.classList.add('printing');
  window.addEventListener('afterprint', cleanup);
  // One frame so the portal is laid out (and webfonts settled) before the dialog opens.
  window.requestAnimationFrame(() => {
    window.print();
    window.setTimeout(cleanup, 1500);
  });
}

// ---------- تصویر (JPG) ----------

export async function exportInvoiceJpeg(node, invoice) {
  if (!node) throw new Error('پیش‌نمایش فاکتور آماده نیست.');
  const rect = node.getBoundingClientRect();
  const width = Math.max(794, Math.round(rect.width || node.scrollWidth));
  const dataUrl = await toJpeg(node, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    width,
    height: Math.max(1123, Math.round(node.scrollHeight)),
    cacheBust: true,
    style: { transform: 'none', margin: '0' },
  });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(blob, `${safeFileName(invoice?.number)}.jpg`);
  return blob;
}

// ---------- اکسل ----------

const COL_WIDTHS = [6, 44, 11, 10, 17, 13, 18];

export function buildInvoiceWorkbook(business, invoice) {
  const totals = computeTotals(invoice);
  const status = INVOICE_STATUSES[effectiveStatus(invoice, totals)].label;
  const rows = [];
  const merges = [];
  const rowHeights = [];

  const push = (cells, height) => {
    if (height) rowHeights[rows.length] = height;
    rows.push(cells);
    return rows.length;
  };
  const merged = (from, to) => merges.push(`A${from}:G${to}`);

  // Two label/value blocks per row: A:C and D:G, merged as they are written.
  const pushPairs = (entries, style) => {
    for (let index = 0; index < entries.length; index += 2) {
      const [first, second] = [entries[index], entries[index + 1]];
      const rowNumber = rows.length + 1;
      push([
        { value: `${first.label}: ${first.value}`, style, span: 3 },
        second
          ? { value: `${second.label}: ${second.value}`, style, span: 4 }
          : { value: '', style: S.plain, span: 4 },
      ]);
      merges.push(`A${rowNumber}:C${rowNumber}`, `D${rowNumber}:G${rowNumber}`);
    }
  };

  // سربرگ
  push([{ value: businessName(business), style: S.title, span: 7 }], 30);
  merged(1, 1);
  if (business?.business_name_en || business?.slogan) {
    push([{ value: [business.business_name_en, business.slogan].filter(Boolean).join(' — '), style: S.subtitle, span: 7 }], 20);
    merged(2, 2);
  }

  const head = letterheadEntries(business);
  if (head.length) {
    push([]);
    pushPairs(head, S.metaLabel);
  }

  // مشخصات فاکتور
  push([]);
  const meta = [
    { label: 'عنوان', value: business?.invoice_title || 'فاکتور' },
    { label: 'شماره فاکتور', value: invoice.number },
    { label: 'تاریخ', value: invoice.date || '' },
    { label: 'وضعیت', value: status },
    { label: 'واحد پول', value: invoice.currency === 'rial' ? 'ریال' : 'تومان' },
    { label: 'تعداد اقلام', value: toFa(totals.count) },
  ].filter((entry) => entry.value);
  pushPairs(meta, S.metaLabel);

  // خریدار
  const customer = Object.entries(invoice.customer || {})
    .filter(([, value]) => String(value ?? '').trim())
    .map(([key, value]) => ({
      label: { name: 'خریدار', code: 'کد مشتری', phone: 'تلفن', national_id: 'شناسه/کد ملی', address: 'نشانی', email: 'ایمیل' }[key] || key,
      value: String(value).trim(),
    }));
  if (customer.length) {
    push([{ value: 'مشخصات خریدار', style: S.section, span: 7 }]);
    merged(rows.length, rows.length);
    pushPairs(customer, S.text);
  }

  // جدول اقلام
  push([]);
  push([
    { value: 'ردیف', style: S.tableHead },
    { value: 'شرح کالا یا خدمات', style: S.tableHead },
    { value: 'واحد', style: S.tableHead },
    { value: 'تعداد', style: S.tableHead },
    { value: 'مبلغ واحد', style: S.tableHead },
    { value: 'تخفیف', style: S.tableHead },
    { value: 'مبلغ کل', style: S.tableHead },
  ], 26);

  totals.lines.forEach((line, index) => {
    const item = line.item;
    push([
      { value: toFa(index + 1), style: S.center },
      { value: item.title || '—', style: S.text },
      { value: item.unit || 'عدد', style: S.center },
      { value: parseNumber(item.qty), style: S.center },
      { value: Math.round(parseNumber(item.unit_price)), style: S.money },
      { value: Math.round(line.discount), style: S.money },
      { value: Math.round(line.net), style: S.money },
    ]);
  });

  // جمع‌ها
  const totalRow = (label, value, style = S.totalLabel, valueStyle = S.totalValue) => {
    push([
      { value: '', style: S.plain, span: 5 },
      { value: label, style },
      { value: Math.round(value), style: valueStyle },
    ]);
  };
  totalRow('جمع کل', totals.subtotal);
  if (totals.discount > 0) {
    const suffix = parseNumber(invoice.discount_percent) > 0 ? ` (${toFa(parseNumber(invoice.discount_percent))}٪)` : '';
    totalRow(`تخفیف${suffix}`, totals.discount);
  }
  if (invoice.vat_enabled && parseNumber(invoice.vat_rate) > 0) {
    totalRow(`مالیات بر ارزش افزوده (${toFa(parseNumber(invoice.vat_rate))}٪)`, totals.vatAmount);
  }
  totalRow('مبلغ قابل پرداخت', totals.total, S.grandLabel, S.grandValue);
  if (totals.paid > 0) totalRow('پرداخت شده', totals.paid);
  totalRow(totals.due > 0 ? 'باقیمانده' : 'تسویه شده', Math.abs(Math.round(totals.due)) || 0);

  if (business?.show_amount_words !== false && totals.total > 0) {
    push([]);
    push([{ value: `مبلغ به حروف: ${amountToWords(totals.total, invoice.currency)}`, style: S.metaLabel, span: 7 }]);
    merged(rows.length, rows.length);
  }

  if (invoice.notes) {
    push([]);
    push([{ value: 'یادداشت', style: S.section, span: 7 }]);
    merged(rows.length, rows.length);
    push([{ value: invoice.notes, style: S.text, span: 7 }], 40);
    merged(rows.length, rows.length);
  }
  if (invoice.terms) {
    push([]);
    push([{ value: 'شرایط و توضیحات', style: S.section, span: 7 }]);
    merged(rows.length, rows.length);
    push([{ value: invoice.terms, style: S.text, span: 7 }], 40);
    merged(rows.length, rows.length);
  }

  const bank = bankEntries(business);
  if (business?.show_bank_info !== false && bank.length) {
    push([]);
    push([{ value: 'اطلاعات واریز', style: S.section, span: 7 }]);
    merged(rows.length, rows.length);
    pushPairs(bank, S.text);
  }

  if (business?.thanks_note) {
    push([]);
    push([{ value: business.thanks_note, style: S.subtitle, span: 7 }]);
    merged(rows.length, rows.length);
  }

  return buildWorkbook({
    sheetName: safeFileName(invoice.number, 'invoice'),
    columnWidths: COL_WIDTHS,
    rows,
    merges,
    rowHeights,
  });
}

export function exportInvoiceExcel(business, invoice) {
  const blob = buildInvoiceWorkbook(business, invoice);
  downloadBlob(blob, `${safeFileName(invoice?.number)}.xlsx`);
  return blob;
}

/** Flat row set used by the invoices list «خروجی اکسل از همه فاکتورها». */
export function exportInvoicesExcel(business, invoices) {
  const rows = [
    [{ value: `${businessName(business)} — فهرست فاکتورها`, style: S.title, span: 8 }],
    [],
    [
      { value: 'شماره', style: S.tableHead },
      { value: 'تاریخ', style: S.tableHead },
      { value: 'خریدار', style: S.tableHead },
      { value: 'وضعیت', style: S.tableHead },
      { value: 'جمع کل', style: S.tableHead },
      { value: 'مالیات', style: S.tableHead },
      { value: 'قابل پرداخت', style: S.tableHead },
      { value: 'باقیمانده', style: S.tableHead },
    ],
  ];
  invoices.forEach((invoice) => {
    const totals = computeTotals(invoice);
    rows.push([
      { value: invoice.number, style: S.center },
      { value: invoice.date || '', style: S.center },
      { value: invoice.customer?.name || '—', style: S.text },
      { value: INVOICE_STATUSES[effectiveStatus(invoice, totals)].label, style: S.center },
      { value: Math.round(totals.subtotal), style: S.money },
      { value: Math.round(totals.vatAmount), style: S.money },
      { value: Math.round(totals.total), style: S.money },
      { value: Math.round(Math.max(0, totals.due)), style: S.money },
    ]);
  });
  const blob = buildWorkbook({
    sheetName: 'فهرست فاکتورها',
    columnWidths: [14, 14, 26, 14, 18, 16, 18, 18],
    rows,
    merges: ['A1:H1'],
    rowHeights: [28],
  });
  downloadBlob(blob, 'invoices.xlsx');
  return blob;
}

/** Kept for parity with the UI labels: «۱٬۲۵۰٬۰۰۰» without the currency word. */
export function plainAmount(value) {
  return formatNumber(Math.round(parseNumber(value)));
}
