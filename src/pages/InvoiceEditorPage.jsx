import { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  CalendarDays,
  Check,
  FileSpreadsheet,
  Hash,
  Image as ImageIcon,
  Plus,
  Printer,
  Save,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react';
import InvoiceDocument from '../components/InvoiceDocument';
import { Field, SectionCard, ToggleRow } from '../components/ui';
import { computeTotals, createItem, INVOICE_STATUSES } from '../lib/invoice';
import { currencyLabel, formatMoney, parseNumber, sanitizeAmount, toFa, UNITS } from '../lib/format';

const CUSTOMER_FIELDS = [
  { key: 'name', label: 'نام خریدار', placeholder: 'نام شخص یا شرکت', span: 2 },
  { key: 'code', label: 'کد مشتری', placeholder: '۱۰۴۲' },
  { key: 'phone', label: 'تلفن', placeholder: '۰۹۱۲۱۲۳۴۵۶۷' },
  { key: 'national_id', label: 'شناسه / کد ملی', placeholder: '۱۴۰۰۱۲۳۴۵۶۷' },
  { key: 'email', label: 'ایمیل', placeholder: 'buyer@example.com', dir: 'ltr' },
  { key: 'address', label: 'نشانی', placeholder: 'نشانی تحویل یا محل کسب‌وکار', span: 2, textarea: true },
];

/** Scales the fixed-width A4 document down to whatever the column allows. */
export function InvoiceStage({ business, invoice, logo, stageRef }) {
  const wrapRef = useRef(null);
  const docRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    const wrap = wrapRef.current;
    const doc = docRef.current;
    if (!wrap || !doc) return undefined;

    const measure = () => {
      setScale(Math.min(1, wrap.clientWidth / 794));
      setHeight(doc.scrollHeight);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    observer.observe(doc);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="invoice-stage" ref={wrapRef} style={{ height: `${height * scale}px` }}>
      <div className="invoice-scale" style={{ transform: `scale(${scale})` }}>
        <InvoiceDocument
          business={business}
          invoice={invoice}
          logo={logo}
          forwardedRef={(node) => {
            docRef.current = node;
            if (typeof stageRef === 'function') stageRef(node);
            else if (stageRef) stageRef.current = node;
          }}
        />
      </div>
    </div>
  );
}

function ItemRow({ item, index, currency, onChange, onRemove }) {
  const set = (key) => (value) => onChange({ ...item, [key]: value });
  const qty = parseNumber(item.qty);
  const unitPrice = parseNumber(item.unit_price);
  const gross = qty * unitPrice;
  const net = gross - gross * (parseNumber(item.discount_percent) / 100);

  return (
    <div className="item-row">
      <div className="item-row-head">
        <span className="item-index">{toFa(index + 1)}</span>
        <Field label="شرح کالا یا خدمات" placeholder="مثلاً لپ‌تاپ ایسوس VivoBook X15" value={item.title} onChange={set('title')} />
        <button type="button" className="icon-btn danger" onClick={onRemove} aria-label="حذف ردیف"><Trash2 size={17} /></button>
      </div>
      <div className="item-row-grid">
        <label className="field">
          <span className="field-label">واحد</span>
          <select value={item.unit} onChange={(event) => set('unit')(event.target.value)}>
            {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
          </select>
        </label>
        <Field label="تعداد" type="number" value={item.qty} onChange={set('qty')} />
        <Field
          label={`مبلغ واحد (${currencyLabel(currency)})`}
          value={sanitizeAmount(unitPrice)}
          onChange={(value) => set('unit_price')(parseNumber(value))}
        />
        <Field label="تخفیف (٪)" type="number" value={item.discount_percent} onChange={set('discount_percent')} />
        <div className="field item-line-total">
          <span className="field-label">مبلغ ردیف</span>
          <strong>{formatMoney(net, currency)}</strong>
        </div>
      </div>
      <input
        className="item-note"
        value={item.note || ''}
        placeholder="توضیح کوتاه (اختیاری) — مثلاً گارانتی ۱۸ ماهه"
        onChange={(event) => set('note')(event.target.value)}
      />
    </div>
  );
}

export default function InvoiceEditorPage({
  business,
  logo,
  invoice,
  onChange,
  onSave,
  onReset,
  onPrint,
  onExcel,
  onJpeg,
  saving,
  saved,
  isNew,
  exporting,
  onNavigateSettings,
}) {
  const stageRef = useRef(null);
  const [tab, setTab] = useState('edit');
  const totals = computeTotals(invoice);
  const currency = invoice.currency;

  const patch = (changes) => onChange({ ...invoice, ...changes });
  const patchCustomer = (key) => (value) => onChange({ ...invoice, customer: { ...invoice.customer, [key]: value } });
  const patchItem = (id, next) => onChange({
    ...invoice,
    items: invoice.items.map((item) => (item.id === id ? next : item)),
  });
  const addItem = () => onChange({ ...invoice, items: [...invoice.items, createItem()] });
  const removeItem = (id) => onChange({
    ...invoice,
    items: invoice.items.length > 1 ? invoice.items.filter((item) => item.id !== id) : [createItem()],
  });

  return (
    <div className="editor-page page-enter">
      <div className="page-heading-row">
        <div>
          <span className="eyebrow"><FileSpreadsheet size={16} /> {isNew ? 'فاکتور تازه' : 'ویرایش فاکتور'}</span>
          <h1>{invoice.number ? toFa(invoice.number) : 'فاکتور جدید'}</h1>
          <p>اقلام را وارد کنید؛ سربرگ از «تنظیم فاکتور» می‌آید و همه‌چیز زنده پیش‌نمایش می‌شود.</p>
        </div>
        <div className="heading-actions">
          <button className="quiet-btn" type="button" onClick={onReset}>فاکتور خالی</button>
          <button className="primary-btn" type="button" onClick={onSave} disabled={saving}>
            {saving ? 'در حال ذخیره…' : <><Save size={17} /> {saved ? 'به‌روزرسانی شد' : isNew ? 'ثبت فاکتور' : 'ذخیره تغییرات'}</>}
          </button>
        </div>
      </div>

      <div className="editor-tabs">
        <button className={tab === 'edit' ? 'active' : ''} onClick={() => setTab('edit')}>ویرایش</button>
        <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>پیش‌نمایش و خروجی</button>
      </div>

      <div className="editor-layout">
        <div className={`editor-form ${tab === 'edit' ? 'shown' : ''}`}>
          <SectionCard icon={Hash} title="مشخصات فاکتور" hint="شماره و تاریخ روی سربرگ چاپ می‌شود.">
            <div className="fields-grid">
              <div className="field-cell"><Field label="شماره فاکتور" value={invoice.number} onChange={(value) => patch({ number: value })} placeholder="INV-0001" /></div>
              <div className="field-cell"><Field label="تاریخ صدور" value={invoice.date} onChange={(value) => patch({ date: value })} placeholder="۱۴۰۵/۰۶/۱۱" /></div>
            </div>
            <div className="status-picker">
              {Object.entries(INVOICE_STATUSES).map(([id, value]) => (
                <button
                  key={id}
                  type="button"
                  className={invoice.status === id ? `active tone-${value.tone}` : ''}
                  onClick={() => patch({ status: id })}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={UserRound} title="مشخصات خریدار" hint="این بخش در کادر «خریدار» فاکتور چاپ می‌شود.">
            <div className="fields-grid">
              {CUSTOMER_FIELDS.map((field) => (
                <div className={`field-cell ${field.span === 2 ? 'span-2' : ''}`} key={field.key}>
                  <Field
                    label={field.label}
                    placeholder={field.placeholder}
                    dir={field.dir}
                    textarea={field.textarea}
                    value={invoice.customer[field.key]}
                    onChange={patchCustomer(field.key)}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Wallet}
            title="اقلام فاکتور"
            hint="برای هر کسب‌وکاری قابل استفاده است؛ کالا، خدمات، ساعت کاری یا هر واحد دیگری."
            action={<button type="button" className="outline-btn" onClick={addItem}><Plus size={16} /> ردیف جدید</button>}
          >
            <div className="items-list">
              {invoice.items.map((item, index) => (
                <ItemRow
                  key={item.id || index}
                  item={item}
                  index={index}
                  currency={currency}
                  onChange={(next) => patchItem(item.id, next)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
            <button type="button" className="add-row-btn" onClick={addItem}><Plus size={17} /> افزودن ردیف</button>
          </SectionCard>

          <SectionCard icon={Banknote} title="تخفیف، مالیات و پرداخت" hint="مالیات پس از کسر تخفیف محاسبه می‌شود.">
            <div className="fields-grid">
              <div className="field-cell">
                <Field
                  label="تخفیف کل (٪)"
                  type="number"
                  value={invoice.discount_percent}
                  onChange={(value) => patch({ discount_percent: value, discount_amount: value > 0 ? 0 : invoice.discount_amount })}
                />
              </div>
              <div className="field-cell">
                <Field
                  label={`تخفیف کل (${currencyLabel(currency)})`}
                  value={sanitizeAmount(invoice.discount_amount)}
                  onChange={(value) => patch({ discount_amount: parseNumber(value), discount_percent: parseNumber(value) > 0 ? 0 : invoice.discount_percent })}
                />
              </div>
              <div className="field-cell">
                <Field label="درصد مالیات" type="number" value={invoice.vat_rate} onChange={(value) => patch({ vat_rate: value })} />
              </div>
              <div className="field-cell">
                <Field
                  label={`پرداخت شده (${currencyLabel(currency)})`}
                  value={sanitizeAmount(invoice.paid_amount)}
                  onChange={(value) => patch({ paid_amount: parseNumber(value) })}
                />
              </div>
            </div>
            <div className="settings-extras">
              <ToggleRow
                title="مالیات بر ارزش افزوده محاسبه شود"
                text={parseNumber(invoice.vat_rate) > 0 ? `نرخ فعلی ${toFa(parseNumber(invoice.vat_rate))}٪` : 'برای اعمال، درصد مالیات را وارد کنید.'}
                value={invoice.vat_enabled}
                onChange={(value) => patch({ vat_enabled: value })}
              />
              <label className="field">
                <span className="field-label">واحد پول این فاکتور</span>
                <select value={currency} onChange={(event) => patch({ currency: event.target.value })}>
                  <option value="toman">تومان</option>
                  <option value="rial">ریال</option>
                </select>
              </label>
            </div>
            <div className="totals-summary">
              <div><span>جمع کل</span><strong>{formatMoney(totals.subtotal, currency)}</strong></div>
              {totals.discount > 0 && <div><span>تخفیف</span><strong className="minus">− {formatMoney(totals.discount, currency)}</strong></div>}
              {invoice.vat_enabled && totals.vatAmount > 0 && <div><span>مالیات</span><strong>{formatMoney(totals.vatAmount, currency)}</strong></div>}
              <div className="grand"><span>قابل پرداخت</span><strong>{formatMoney(totals.total, currency)}</strong></div>
              {totals.paid > 0 && <div><span>باقیمانده</span><strong>{formatMoney(totals.due, currency)}</strong></div>}
            </div>
          </SectionCard>

          <SectionCard icon={CalendarDays} title="یادداشت و شرایط" hint="این دو بخش پایین جدول چاپ می‌شوند.">
            <div className="fields-grid">
              <div className="field-cell span-2">
                <Field label="یادداشت فاکتور" textarea value={invoice.notes} onChange={(value) => patch({ notes: value })} placeholder="مثلاً تحویل تا ۳ روز کاری پس از واریز." />
              </div>
              <div className="field-cell span-2">
                <Field label="شرایط و توضیحات" textarea value={invoice.terms} onChange={(value) => patch({ terms: value })} placeholder="پیش‌فرض از «تنظیم فاکتور» آمده است." />
              </div>
            </div>
          </SectionCard>

          <div className="editor-inline-actions">
            <button type="button" className="text-btn" onClick={onNavigateSettings}>ویرایش سربرگ و لوگو در «تنظیم فاکتور»</button>
          </div>
        </div>

        <div className={`editor-preview ${tab === 'preview' ? 'shown' : ''}`}>
          <div className="preview-toolbar">
            <div className="preview-toolbar-title">
              <strong>پیش‌نمایش فاکتور</strong>
              <small>اندازه A۴</small>
            </div>
            <div className="export-actions">
              <button type="button" className="export-btn print" onClick={() => onPrint(stageRef)}>
                <Printer size={17} /> پرینت
              </button>
              <button type="button" className="export-btn excel" onClick={onExcel}>
                <FileSpreadsheet size={17} /> اکسل
              </button>
              <button type="button" className="export-btn image" onClick={() => onJpeg(stageRef)} disabled={Boolean(exporting)}>
                <ImageIcon size={17} /> {exporting ? 'در حال ساخت تصویر…' : 'تصویر'}
              </button>
            </div>
          </div>
          <div className="preview-canvas">
            <InvoiceStage business={business} invoice={invoice} logo={logo} stageRef={stageRef} />
          </div>
          <p className="preview-hint"><Check size={14} /> پرینت مستقیم از همین صفحه انجام می‌شود؛ فایل JPG با کیفیت دو برابر ذخیره می‌گردد.</p>
        </div>
      </div>
    </div>
  );
}
