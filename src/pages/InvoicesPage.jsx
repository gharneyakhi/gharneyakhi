import { useMemo, useState } from 'react';
import {
  Copy,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '../components/ui';
import { computeTotals, effectiveStatus, INVOICE_STATUSES } from '../lib/invoice';
import { formatMoney, toFa, truncate } from '../lib/format';

const FILTERS = [
  ['all', 'همه'],
  ['paid', 'پرداخت شده'],
  ['issued', 'صادر شده'],
  ['draft', 'پیش‌نویس'],
];

export default function InvoicesPage({
  invoices,
  loading,
  onOpen,
  onDuplicate,
  onDelete,
  onPrint,
  onExcel,
  onJpeg,
  onExportAll,
  onNew,
  exportingId,
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => invoices.map((invoice) => ({
    invoice,
    totals: computeTotals(invoice),
  })), [invoices]);

  const filtered = rows.filter(({ invoice }) => {
    const status = effectiveStatus(invoice);
    const matchesFilter = filter === 'all' || status === filter;
    const haystack = `${invoice.number} ${invoice.customer?.name || ''} ${invoice.customer?.phone || ''} ${invoice.date}`;
    return matchesFilter && (!search || haystack.includes(search));
  });

  return (
    <div className="invoices-page page-enter">
      <div className="page-heading-row">
        <div>
          <span className="eyebrow"><Receipt size={16} /> بایگانی فاکتورها</span>
          <h1>فاکتورهای من</h1>
          <p>همه فاکتورها را ببینید، چاپ کنید یا خروجی اکسل و تصویر بگیرید.</p>
        </div>
        <div className="heading-actions">
          <button className="quiet-btn" type="button" onClick={onExportAll} disabled={!invoices.length}>
            <FileSpreadsheet size={16} /> اکسل همه
          </button>
          <button className="primary-btn" type="button" onClick={onNew}><Plus size={18} /> فاکتور جدید</button>
        </div>
      </div>

      <div className="list-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجو در شماره، نام خریدار یا تاریخ…"
          />
        </div>
        <div className="filter-tabs">
          {FILTERS.map(([id, label]) => (
            <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
      </div>

      <section className="panel invoices-panel">
        <div className="list-count">
          <strong>{toFa(filtered.length)} فاکتور</strong>
          <span>مرتب‌سازی: بالاترین شماره</span>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loading-spinner" /><h3>در حال دریافت فاکتورها</h3><p>اطلاعات از Supabase خوانده می‌شود.</p></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={invoices.length ? 'فاکتوری با این مشخصات پیدا نشد' : 'هنوز فاکتوری ثبت نکرده‌اید'}
            text={invoices.length ? 'عبارت دیگری را جست‌وجو کنید یا فیلتر را تغییر دهید.' : 'اولین فاکتور خود را در کمتر از یک دقیقه بسازید.'}
            action={invoices.length ? null : <button className="primary-btn" onClick={onNew}><Plus size={17} /> ساخت اولین فاکتور</button>}
          />
        ) : (
          <div className="invoice-rows">
            {filtered.map(({ invoice, totals }) => {
              const status = INVOICE_STATUSES[effectiveStatus(invoice, totals)];
              return (
                <article className="invoice-row" key={invoice.id}>
                  <button className="invoice-row-main" onClick={() => onOpen(invoice)}>
                    <span className="row-number">{toFa(invoice.number) || '—'}</span>
                    <span className="row-buyer">
                      <strong>{invoice.customer?.name || 'بدون نام'}</strong>
                      <small>
                        <span>{toFa(invoice.date) || 'بدون تاریخ'}</span>
                        <i />
                        <span>{toFa(totals.lines.length)} قلم</span>
                      </small>
                    </span>
                    <span className="row-amount">
                      <strong>{formatMoney(totals.total, invoice.currency)}</strong>
                      {totals.due > 0
                        ? <small className="due">باقیمانده {formatMoney(totals.due, invoice.currency)}</small>
                        : <small className="settled">تسویه شده</small>}
                    </span>
                    <span className={`status-badge tone-${status.tone}`}><i />{status.label}</span>
                  </button>
                  <div className="invoice-row-actions">
                    <button type="button" onClick={() => onOpen(invoice)} title="مشاهده و ویرایش" aria-label={`مشاهده و ویرایش فاکتور ${invoice.number}`}><Eye size={16} /></button>
                    <button type="button" onClick={() => onPrint(invoice)} title="پرینت" aria-label={`پرینت فاکتور ${invoice.number}`}><Printer size={16} /></button>
                    <button type="button" onClick={() => onExcel(invoice)} title="خروجی اکسل" aria-label={`خروجی اکسل فاکتور ${invoice.number}`}><FileSpreadsheet size={16} /></button>
                    <button
                      type="button"
                      onClick={() => onJpeg(invoice)}
                      title="ذخیره به‌صورت تصویر JPG"
                      aria-label={`ذخیره فاکتور ${invoice.number} به‌صورت تصویر JPG`}
                      disabled={exportingId === invoice.id}
                    >
                      <ImageIcon size={16} />
                    </button>
                    <button type="button" onClick={() => onDuplicate(invoice)} title="کپی به‌عنوان فاکتور جدید" aria-label={`کپی فاکتور ${invoice.number}`}><Copy size={16} /></button>
                    <button type="button" className="danger" onClick={() => onDelete(invoice)} title="حذف" aria-label={`حذف فاکتور ${invoice.number}`}><Trash2 size={16} /></button>
                  </div>
                  <p className="row-preview">{truncate(invoice.items?.map((item) => item.title).filter(Boolean).join('، ') || 'بدون قلم', 90)}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
