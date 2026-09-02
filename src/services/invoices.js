import { requireSupabase } from '../lib/supabase';
import { computeTotals, createItem, effectiveStatus } from '../lib/invoice';
import { parseNumber } from '../lib/format';

const TABLE = 'invoices';

function normalizeItems(items) {
  const list = Array.isArray(items) ? items : [];
  return list.length ? list.map((item) => createItem(item)) : [createItem()];
}

/** DB row -> UI invoice. */
export function toUiInvoice(row) {
  return {
    id: row.id,
    serial: parseNumber(row.serial) || 1,
    number: row.number || '',
    date: row.issue_date || '',
    status: row.status === 'draft' || row.status === 'paid' ? row.status : 'issued',
    customer: {
      name: row.customer?.name || '',
      code: row.customer?.code || '',
      phone: row.customer?.phone || '',
      national_id: row.customer?.national_id || '',
      address: row.customer?.address || '',
      email: row.customer?.email || '',
    },
    items: normalizeItems(row.items),
    currency: row.currency === 'rial' ? 'rial' : 'toman',
    vat_enabled: row.vat_enabled !== false,
    vat_rate: parseNumber(row.vat_rate) || 0,
    discount_percent: parseNumber(row.discount_percent) || 0,
    discount_amount: parseNumber(row.discount_amount) || 0,
    paid_amount: parseNumber(row.paid_amount) || 0,
    notes: row.notes || '',
    terms: row.terms || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** UI invoice -> DB columns. Totals are stored too so the dashboard can aggregate cheaply. */
function toRow(invoice, ownerId) {
  const totals = computeTotals(invoice);
  return {
    owner_id: ownerId,
    number: String(invoice.number || '').trim(),
    serial: Math.max(1, Math.round(parseNumber(invoice.serial) || 1)),
    issue_date: String(invoice.date || '').trim(),
    status: effectiveStatus(invoice, totals),
    customer: invoice.customer || {},
    items: invoice.items || [],
    currency: invoice.currency === 'rial' ? 'rial' : 'toman',
    vat_enabled: Boolean(invoice.vat_enabled),
    vat_rate: parseNumber(invoice.vat_rate) || 0,
    discount_percent: parseNumber(invoice.discount_percent) || 0,
    discount_amount: parseNumber(invoice.discount_amount) || 0,
    paid_amount: parseNumber(invoice.paid_amount) || 0,
    notes: String(invoice.notes || ''),
    terms: String(invoice.terms || ''),
    subtotal: Math.round(totals.subtotal),
    vat_amount: Math.round(totals.vatAmount),
    total_amount: Math.round(totals.total),
    due_amount: Math.round(Math.max(0, totals.due)),
  };
}

export async function fetchInvoices() {
  const { data, error } = await requireSupabase()
    .from(TABLE)
    .select('*')
    .order('serial', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toUiInvoice);
}

export async function insertInvoice(invoice) {
  const { data: { user } } = await requireSupabase().auth.getUser();
  if (!user) throw new Error('برای ثبت فاکتور باید وارد حساب شوید.');

  const { data, error } = await requireSupabase()
    .from(TABLE)
    .insert(toRow(invoice, user.id))
    .select()
    .single();
  if (error) throw error;
  return toUiInvoice(data);
}

export async function updateInvoice(id, invoice) {
  const row = toRow(invoice);
  delete row.owner_id;
  const { data, error } = await requireSupabase()
    .from(TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toUiInvoice(data);
}

export async function deleteInvoice(id) {
  const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/** Highest used serial, used to propose a non-colliding number for the next invoice. */
export function nextSerial(invoices, fallback = 1) {
  const max = invoices.reduce((highest, invoice) => Math.max(highest, parseNumber(invoice.serial)), 0);
  return Math.max(max + 1, Math.max(1, Math.round(parseNumber(fallback) || 1)));
}
