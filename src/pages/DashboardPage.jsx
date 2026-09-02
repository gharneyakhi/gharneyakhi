import { useMemo } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Plus,
  Printer,
  Receipt,
  Settings2,
  Wallet,
} from 'lucide-react';
import { businessName, computeTotals, effectiveStatus, INVOICE_STATUSES } from '../lib/invoice';
import { formatMoney, todayPersianLong, toFa } from '../lib/format';

function StatCard({ title, value, note, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}><Icon size={20} /></span>
      <div className="stat-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

export default function DashboardPage({ business, invoices, loading, onNew, onOpen, onNavigate, onPrint, onJpeg, exporting }) {
  const stats = useMemo(() => {
    let sale = 0;
    let due = 0;
    let vat = 0;
    let paidCount = 0;
    invoices.forEach((invoice) => {
      const totals = computeTotals(invoice);
      sale += totals.total;
      due += Math.max(0, totals.due);
      vat += totals.vatAmount;
      if (effectiveStatus(invoice, totals) === 'paid') paidCount += 1;
    });
    const currency = business?.currency || 'toman';
    return { sale, due, vat, paidCount, currency };
  }, [invoices, business?.currency]);

  const needsSetup = !String(business?.business_name || '').trim();
  const recent = invoices.slice(0, 4);

  return (
    <div className="dashboard page-enter">
      <section className="welcome-row">
        <div>
          <span className="eyebrow"><Receipt size={16} /> فاکتور ساز</span>
          <h1>سلام، {businessName(business)}</h1>
          <p>فاکتور حرفه‌ای با سربرگ کسب‌وکار خودتان بسازید؛ پرینت، اکسل و تصویر در یک کلیک.</p>
          <time className="today-date"><Clock3 size={14} /> {todayPersianLong()}</time>
        </div>
        <div className="privacy-chip">
          <Settings2 size={19} />
          <span>
            <strong>سربرگ قابل شخصی‌سازی</strong>
            <small>لوگو، نشانی، شناسه ملی و رنگ دلخواه</small>
          </span>
        </div>
      </section>

      {needsSetup && (
        <section className="setup-banner">
          <span className="setup-icon"><ImagePlus size={22} /></span>
          <div>
            <strong>اول سربرگ کسب‌وکار خود را بسازید</strong>
            <p>نام، لوگو و اطلاعات تماس را در «تنظیم فاکتور» وارد کنید تا بالای هر فاکتور چاپ شود.</p>
          </div>
          <button className="primary-btn" onClick={() => onNavigate('settings')}>رفتن به تنظیم فاکتور <ArrowLeft size={16} /></button>
        </section>
      )}

      <section className="stats-grid" aria-label="آمار فاکتورها">
        <StatCard title="تعداد فاکتور" value={toFa(invoices.length)} note={`${toFa(stats.paidCount)} مورد تسویه شده`} icon={Receipt} tone="teal" />
        <StatCard title="جمع فروش" value={formatMoney(stats.sale, stats.currency)} note="مبلغ نهایی با مالیات" icon={Wallet} tone="blue" />
        <StatCard title="دریافت‌نشده" value={formatMoney(stats.due, stats.currency)} note="باقیمانده نزد مشتری" icon={Banknote} tone="amber" />
        <StatCard title="مالیات محاسبه‌شده" value={formatMoney(stats.vat, stats.currency)} note="ارزش افزوده فاکتورها" icon={CheckCircle2} tone="sand" />
      </section>

      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div>
              <h3>آخرین فاکتورها</h3>
              <p>برای ویرایش، چاپ یا خروجی روی هر ردیف بزنید</p>
            </div>
            <button className="text-btn" onClick={() => onNavigate('invoices')}>مشاهده همه <ArrowLeft size={16} /></button>
          </div>

          {loading ? (
            <div className="empty-state"><span className="loading-spinner" /><h3>در حال دریافت فاکتورها</h3></div>
          ) : recent.length ? (
            <div className="mini-rows">
              {recent.map((invoice) => {
                const totals = computeTotals(invoice);
                const status = INVOICE_STATUSES[effectiveStatus(invoice, totals)];
                return (
                  <div className="mini-row" key={invoice.id}>
                    <button className="mini-row-main" onClick={() => onOpen(invoice)}>
                      <span className="mini-number">{toFa(invoice.number)}</span>
                      <span><strong>{invoice.customer?.name || 'بدون نام'}</strong><small>{toFa(invoice.date)}</small></span>
                      <strong className="mini-amount">{formatMoney(totals.total, invoice.currency)}</strong>
                      <span className={`status-badge tone-${status.tone}`}><i />{status.label}</span>
                    </button>
                    <div className="mini-actions">
                      <button onClick={() => onPrint(invoice)} title="پرینت" aria-label="پرینت"><Printer size={15} /></button>
                      <button onClick={() => onJpeg(invoice)} disabled={exporting} title="تصویر JPG" aria-label="تصویر"><ImagePlus size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Receipt size={28} />
              <h3>هنوز فاکتوری ندارید</h3>
              <p>با یک فاکتور نمونه شروع کنید؛ کمتر از یک دقیقه طول می‌کشد.</p>
              <button className="primary-btn" onClick={onNew}><Plus size={17} /> ساخت فاکتور</button>
            </div>
          )}
        </section>

        <aside className="panel tips-panel">
          <h3>سه خروجی، یک فاکتور</h3>
          <ul>
            <li><strong>پرینت</strong><p>مستقیم از مرورگر روی کاغذ A۴ چاپ می‌شود.</p></li>
            <li><strong>اکسل</strong><p>فایل <code dir="ltr">.xlsx</code> راست‌به‌چپ با سربرگ و جدول کامل.</p></li>
            <li><strong>تصویر</strong><p>ذخیره فاکتور به‌صورت <code dir="ltr">JPG</code> برای ارسال در پیام‌رسان.</p></li>
          </ul>
          <button className="outline-btn full-btn" onClick={() => onNavigate('settings')}>
            <Settings2 size={16} /> شخصی‌سازی سربرگ
          </button>
        </aside>
      </div>
    </div>
  );
}
