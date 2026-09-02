import {
  amountToWords,
  currencyLabel,
  formatMoney,
  formatNumber,
  parseNumber,
  toFa,
} from '../lib/format';
import {
  bankEntries,
  businessName,
  computeTotals,
  effectiveStatus,
  INVOICE_STATUSES,
  letterheadEntries,
} from '../lib/invoice';

function Fact({ label, value, dir }) {
  return (
    <li className="invoice-fact">
      <span>{label}</span>
      <strong dir={dir || 'auto'}>{value}</strong>
    </li>
  );
}

/**
 * The printable A4 invoice. This single component is what the on-screen preview,
 * the print portal, the JPG export and the Excel export all render from, so the
 * letterhead a business builds in «تنظیم فاکتور» looks the same everywhere.
 */
export default function InvoiceDocument({ business, invoice, logo, forwardedRef }) {
  const totals = computeTotals(invoice);
  const status = INVOICE_STATUSES[effectiveStatus(invoice, totals)];
  const facts = letterheadEntries(business);
  const bank = business?.show_bank_info === false ? [] : bankEntries(business);
  const currency = invoice.currency;
  const showWords = business?.show_amount_words !== false && totals.total > 0;
  const vatRate = parseNumber(invoice.vat_rate);

  return (
    <article
      className="invoice-document"
      style={{ '--accent': business?.accent || '#123f34' }}
      ref={forwardedRef}
    >
      {invoice.status === 'draft' && <span className="invoice-watermark">پیش‌نویس</span>}

      <header className="invoice-letterhead">
        <div className="letterhead-brand">
          {business?.show_logo !== false && logo && (
            <img className="letterhead-logo" src={logo} alt={`لوگوی ${businessName(business)}`} />
          )}
          <div className="letterhead-name">
            <h1>{businessName(business)}</h1>
            {business?.business_name_en && <span className="letterhead-en" dir="ltr">{business.business_name_en}</span>}
            {business?.slogan && <span className="letterhead-slogan">{business.slogan}</span>}
          </div>
        </div>
        <div className="letterhead-mark">
          <strong>{business?.invoice_title || 'فاکتور فروش'}</strong>
          <span className={`invoice-status tone-${status.tone}`}>{status.label}</span>
        </div>
      </header>

      {facts.length > 0 && (
        <ul className="invoice-facts">
          {facts.map((fact) => (
            <Fact key={fact.key} label={fact.label} value={fact.value} dir={fact.dir} />
          ))}
        </ul>
      )}

      <div className="invoice-meta">
        <div className="meta-cell">
          <span>شماره فاکتور</span>
          <strong>{toFa(invoice.number) || '—'}</strong>
        </div>
        <div className="meta-cell">
          <span>تاریخ صدور</span>
          <strong>{toFa(invoice.date) || '—'}</strong>
        </div>
        <div className="meta-cell">
          <span>تعداد اقلام</span>
          <strong>{toFa(totals.count)}</strong>
        </div>
        <div className="meta-cell">
          <span>واحد پول</span>
          <strong>{currencyLabel(currency)}</strong>
        </div>
      </div>

      <section className="invoice-parties">
        <div className="party">
          <h2>مشخصات خریدار</h2>
          <dl>
            <div><dt>نام</dt><dd>{invoice.customer?.name || '—'}</dd></div>
            {invoice.customer?.code && <div><dt>کد مشتری</dt><dd>{toFa(invoice.customer.code)}</dd></div>}
            {invoice.customer?.phone && <div><dt>تلفن</dt><dd>{toFa(invoice.customer.phone)}</dd></div>}
            {invoice.customer?.national_id && <div><dt>شناسه / کد ملی</dt><dd>{toFa(invoice.customer.national_id)}</dd></div>}
            {invoice.customer?.email && <div><dt>ایمیل</dt><dd dir="ltr">{invoice.customer.email}</dd></div>}
            {invoice.customer?.address && <div className="wide"><dt>نشانی</dt><dd>{invoice.customer.address}</dd></div>}
          </dl>
        </div>
        <div className="party party-summary">
          <h2>وضعیت پرداخت</h2>
          <dl>
            <div><dt>مبلغ قابل پرداخت</dt><dd className="amount">{formatMoney(totals.total, currency)}</dd></div>
            <div><dt>پرداخت شده</dt><dd className="amount">{formatMoney(totals.paid, currency)}</dd></div>
            <div className={totals.due > 0 ? 'due' : 'settled'}>
              <dt>{totals.due > 0 ? 'باقیمانده' : 'وضعیت'}</dt>
              <dd className="amount">{totals.due > 0 ? formatMoney(totals.due, currency) : 'تسویه شده'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <table className="invoice-table">
        <thead>
          <tr>
            <th className="col-row">ردیف</th>
            <th className="col-title">شرح کالا یا خدمات</th>
            <th className="col-unit">واحد</th>
            <th className="col-qty">تعداد</th>
            <th className="col-price">مبلغ واحد</th>
            <th className="col-off">تخفیف</th>
            <th className="col-total">مبلغ کل</th>
          </tr>
        </thead>
        <tbody>
          {totals.lines.map((line, index) => (
            <tr key={line.item.id || index}>
              <td className="col-row">{toFa(index + 1)}</td>
              <td className="col-title">
                <strong>{line.item.title || '—'}</strong>
                {line.item.note && <small>{line.item.note}</small>}
              </td>
              <td className="col-unit">{line.item.unit || 'عدد'}</td>
              <td className="col-qty">{formatNumber(parseNumber(line.item.qty))}</td>
              <td className="col-price">{formatMoney(line.item.unit_price, currency, { withUnit: false })}</td>
              <td className="col-off">{line.discount > 0 ? formatMoney(line.discount, currency, { withUnit: false }) : '—'}</td>
              <td className="col-total">{formatMoney(line.net, currency, { withUnit: false })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        {showWords && (
          <div className="totals-words">
            <span>مبلغ به حروف</span>
            <strong>{amountToWords(totals.total, currency)}</strong>
          </div>
        )}
        <dl className="totals-box">
          <div><dt>جمع کل</dt><dd>{formatMoney(totals.subtotal, currency)}</dd></div>
          {totals.discount > 0 && (
            <div>
              <dt>
                تخفیف
                {parseNumber(invoice.discount_percent) > 0 && ` (${toFa(parseNumber(invoice.discount_percent))}٪)`}
              </dt>
              <dd className="minus">− {formatMoney(totals.discount, currency)}</dd>
            </div>
          )}
          {invoice.vat_enabled && vatRate > 0 && (
            <div><dt>مالیات بر ارزش افزوده ({toFa(vatRate)}٪)</dt><dd>{formatMoney(totals.vatAmount, currency)}</dd></div>
          )}
          {totals.paid > 0 && (
            <div><dt>پرداخت شده</dt><dd className="minus">− {formatMoney(totals.paid, currency)}</dd></div>
          )}
          <div className="grand">
            <dt>{totals.due > 0 ? 'مبلغ قابل پرداخت' : 'مبلغ نهایی'}</dt>
            <dd>{formatMoney(totals.due > 0 ? totals.due : totals.total, currency)}</dd>
          </div>
        </dl>
      </div>

      {invoice.notes && (
        <section className="invoice-note">
          <h3>یادداشت</h3>
          <p>{invoice.notes}</p>
        </section>
      )}

      {invoice.terms && (
        <section className="invoice-note">
          <h3>شرایط و توضیحات</h3>
          <p>{invoice.terms}</p>
        </section>
      )}

      {bank.length > 0 && (
        <section className="invoice-bank">
          <h3>اطلاعات واریز</h3>
          <ul>
            {bank.map((entry) => (
              <li key={entry.key}><span>{entry.label}</span><strong dir={entry.dir || 'auto'}>{entry.value}</strong></li>
            ))}
          </ul>
        </section>
      )}

      <footer className="invoice-footer">
        <p className="invoice-thanks">{business?.thanks_note || ''}</p>
        <div className="invoice-sign">
          <span className="sign-line" />
          <small>{business?.signature_name ? `مهر و امضای ${business.signature_name}` : 'مهر و امضا'}</small>
        </div>
      </footer>
    </article>
  );
}
