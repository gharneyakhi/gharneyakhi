import { useMemo, useRef, useState } from 'react';
import {
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  ImagePlus,
  Landmark,
  Phone,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Field, SectionCard, ToggleRow } from '../components/ui';
import { ACCENTS, BUSINESS_GROUPS, emptyBusiness, letterheadEntries, businessName } from '../lib/invoice';
import { toFa } from '../lib/format';
import { removeLogo, saveBusiness, uploadLogo } from '../services/business';

const GROUP_ICONS = {
  identity: Building2,
  legal: Landmark,
  contact: Phone,
  bank: Banknote,
  invoice: FileText,
};

export default function InvoiceSettingsPage({ business, logo, onSaved, onLogoUploaded, onLogoCleared, showToast }) {
  const [form, setForm] = useState(business);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const facts = useMemo(() => letterheadEntries(form), [form]);

  const handleLogoFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const path = await uploadLogo(file);
      const saved = await onLogoUploaded(path);
      setForm((current) => ({ ...current, logo_path: path, ...saved }));
      showToast('لوگو بارگذاری شد');
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setUploading(true);
    setError('');
    try {
      if (form.logo_path) await removeLogo(form.logo_path);
      await onLogoCleared();
      setForm((current) => ({ ...current, logo_path: '' }));
      showToast('لوگو حذف شد');
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.business_name.trim()) {
      setError('نام کسب‌وکار ضروری است؛ همین یک مورد بالای همه فاکتورها چاپ می‌شود.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await saveBusiness(form);
      onSaved(saved);
      setForm(saved);
      showToast('تنظیم فاکتور ذخیره شد');
    } catch (saveError) {
      setError(`ذخیره انجام نشد: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderFields = (fields) => fields.map((field) => (
    <div className={`field-cell ${field.span === 2 ? 'span-2' : ''}`} key={field.key}>
      <Field
        label={field.label}
        placeholder={field.placeholder}
        dir={field.dir}
        type={field.type}
        textarea={field.textarea}
        required={field.required}
        value={form[field.key]}
        onChange={set(field.key)}
      />
    </div>
  ));

  return (
    <div className="settings-page page-enter">
      <form className="page-heading-row" onSubmit={submit}>
        <div>
          <span className="eyebrow"><FileText size={16} /> سربرگ و اطلاعات کسب‌وکار</span>
          <h1>تنظیم فاکتور</h1>
          <p>هرچه اینجا پر کنید به‌صورت سربرگ بالای فاکتور چاپ می‌شود؛ برای همه کسب‌وکارها قابل شخصی‌سازی است.</p>
        </div>
        <button className="primary-btn" type="submit" disabled={saving}>
          {saving ? <><RotateCcw size={17} className="spin" /> در حال ذخیره…</> : <><Save size={17} /> ذخیره تنظیمات</>}
        </button>
      </form>

      {error && <div className="auth-alert error" role="alert">{error}</div>}

      <div className="settings-layout">
        <div className="settings-main">
          <SectionCard icon={ImagePlus} title="لوگوی کسب‌وکار" hint="فرمت PNG، JPG، WEBP یا SVG تا ۳ مگابایت. لوگو در سربرگ فاکتور، فایل JPG و پرینت استفاده می‌شود.">
            <div
              className={`logo-drop ${dragging ? 'dragging' : ''} ${logo ? 'has-logo' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleLogoFile(event.dataTransfer.files?.[0]);
              }}
            >
              {logo ? (
                <img className="logo-preview" src={logo} alt="پیش‌نمایش لوگو" />
              ) : (
                <span className="logo-placeholder"><UploadCloud size={26} /></span>
              )}
              <div className="logo-drop-copy">
                <strong>{uploading ? 'در حال بارگذاری…' : logo ? 'تغییر لوگو' : 'بارگذاری لوگو'}</strong>
                <small>فایل را اینجا رها کنید یا از دکمه انتخاب فایل استفاده کنید.</small>
                <div className="logo-drop-actions">
                  <button type="button" className="outline-btn" disabled={uploading} onClick={() => fileInput.current?.click()}>
                    <ImagePlus size={16} /> انتخاب فایل
                  </button>
                  {logo && (
                    <button type="button" className="quiet-btn" disabled={uploading} onClick={handleRemoveLogo}>
                      <Trash2 size={16} /> حذف لوگو
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                hidden
                onChange={(event) => { handleLogoFile(event.target.files?.[0]); event.target.value = ''; }}
              />
            </div>
            <ToggleRow
              title="نمایش لوگو در فاکتور"
              text="با خاموش کردن این گزینه، سربرگ بدون لوگو چاپ می‌شود."
              value={form.show_logo}
              onChange={set('show_logo')}
            />
          </SectionCard>

          {BUSINESS_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.id] || FileText;
            return (
              <SectionCard key={group.id} icon={Icon} title={group.title} hint={group.hint}>
                <div className="fields-grid">{renderFields(group.fields)}</div>
                {group.id === 'invoice' && (
                  <div className="settings-extras">
                    <label className="field">
                      <span className="field-label">واحد پول</span>
                      <select value={form.currency} onChange={(event) => set('currency')(event.target.value)}>
                        <option value="toman">تومان</option>
                        <option value="rial">ریال</option>
                      </select>
                    </label>
                    <div className="field">
                      <span className="field-label">رنگ سربرگ</span>
                      <div className="accent-picker">
                        {ACCENTS.map((accent) => (
                          <button
                            type="button"
                            key={accent.id}
                            className={`accent-swatch ${form.accent === accent.value ? 'active' : ''}`}
                            style={{ background: accent.value }}
                            title={accent.label}
                            aria-label={accent.label}
                            onClick={() => set('accent')(accent.value)}
                          >
                            {form.accent === accent.value && <Check size={13} strokeWidth={3.4} />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ToggleRow
                      title="مالیات بر ارزش افزوده به‌صورت پیش‌فرض فعال باشد"
                      text="برای فاکتورهای جدید تیک مالیات روشن و درصد بالا اعمال می‌شود."
                      value={form.vat_enabled}
                      onChange={set('vat_enabled')}
                    />
                    <ToggleRow
                      title="نمایش مبلغ به حروف"
                      text="مبلغ نهایی به حروف فارسی زیر جدول چاپ می‌شود."
                      value={form.show_amount_words}
                      onChange={set('show_amount_words')}
                    />
                    <ToggleRow
                      title="نمایش اطلاعات بانکی"
                      text="شماره حساب، کارت و شبا پایین فاکتور درج می‌شود."
                      value={form.show_bank_info}
                      onChange={set('show_bank_info')}
                    />
                  </div>
                )}
              </SectionCard>
            );
          })}

          <div className="settings-actions">
            <button type="button" className="quiet-btn" onClick={() => setForm(emptyBusiness())}>
              <RotateCcw size={16} /> بازنشانی فرم
            </button>
            <button className="primary-btn" type="submit" disabled={saving}>
              <Save size={17} /> ذخیره تنظیمات
            </button>
          </div>
        </div>

        <aside className="settings-preview">
          <div className="panel preview-panel">
            <div className="preview-head">
              <strong>پیش‌نمایش سربرگ</strong>
              <span>همین حالا در فاکتور</span>
            </div>
            <div className="preview-letterhead" style={{ '--accent': form.accent || '#123f34' }}>
              <div className="preview-brand">
                {form.show_logo && logo
                  ? <img src={logo} alt="" />
                  : <span className="preview-logo-empty"><ImagePlus size={17} /></span>}
                <div>
                  <h4>{businessName(form)}</h4>
                  {form.slogan && <small>{form.slogan}</small>}
                </div>
              </div>
              {facts.length ? (
                <ul>
                  {facts.slice(0, 6).map((fact) => (
                    <li key={fact.key}><span>{fact.label}</span><strong dir={fact.dir || 'auto'}>{toFa(fact.value)}</strong></li>
                  ))}
                </ul>
              ) : (
                <p className="preview-empty">هنوز موردی پر نکرده‌اید. هر فیلدی که پر شود همین‌جا و بالای فاکتور ظاهر می‌شود.</p>
              )}
            </div>
            <div className="preview-tip">
              <CheckCircle2 size={16} />
              <p>فیلدهای خالی در سربرگ چاپ نمی‌شوند؛ پس فقط موارد مرتبط با کسب‌وکار خود را پر کنید.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
