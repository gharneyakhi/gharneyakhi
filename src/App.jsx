import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronUp,
  FilePlus2,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings2,
  SlidersHorizontal,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import InvoiceDocument from './components/InvoiceDocument';
import DashboardPage from './pages/DashboardPage';
import InvoiceEditorPage, { InvoiceStage } from './pages/InvoiceEditorPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceSettingsPage from './pages/InvoiceSettingsPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { buildNumber, createInvoice } from './lib/invoice';
import { todayPersian } from './lib/format';
import {
  exportInvoiceExcel,
  exportInvoicesExcel,
  exportInvoiceJpeg,
  printInvoice,
} from './lib/exports';
import { fetchBusiness, logoToDataUrl, saveBusiness } from './services/business';
import { deleteInvoice, fetchInvoices, insertInvoice, nextSerial, updateInvoice } from './services/invoices';

const navItems = [
  { id: 'dashboard', label: 'پیشخوان', Icon: LayoutDashboard },
  { id: 'editor', label: 'فاکتور جدید', Icon: FilePlus2 },
  { id: 'invoices', label: 'فاکتورها', Icon: Receipt },
  { id: 'settings', label: 'تنظیم فاکتور', Icon: Settings2 },
];

const pageTitles = {
  dashboard: 'پیشخوان',
  editor: 'فاکتور ساز',
  invoices: 'فاکتورهای من',
  settings: 'تنظیم فاکتور',
};

function toPersianDigits(value) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]);
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [business, setBusiness] = useState(null);
  const [logo, setLogo] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [jpegTarget, setJpegTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [dataError, setDataError] = useState('');

  const offscreenRef = useRef(null);

  // ---------- auth ----------
  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthLoading(false);
      if (!nextSession) {
        setInvoices([]);
        setBusiness(null);
        setLogo('');
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------- data ----------
  useEffect(() => {
    if (!session?.user) return undefined;
    let active = true;
    setLoadingData(true);
    setDataError('');

    (async () => {
      try {
        const [profile, invoiceRows] = await Promise.all([fetchBusiness(), fetchInvoices()]);
        if (!active) return;
        setBusiness(profile);
        setInvoices(invoiceRows);
        if (profile.logo_path) {
          try {
            setLogo(await logoToDataUrl(profile.logo_path));
          } catch {
            if (active) setLogo('');
          }
        }
      } catch (error) {
        if (active) setDataError(error.message);
      } finally {
        if (active) setLoadingData(false);
      }
    })();

    return () => { active = false; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ---------- navigation ----------
  const navigate = useCallback((page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const startNewInvoice = useCallback(() => {
    if (!business) return;
    const serial = nextSerial(invoices, business.next_number);
    setCurrentInvoice(createInvoice(business, {
      serial,
      number: buildNumber(business, serial),
      date: todayPersian(),
    }));
    setIsNew(true);
    setSaved(false);
    navigate('editor');
  }, [business, invoices, navigate]);

  // Make sure there is always something to edit once the profile arrives.
  useEffect(() => {
    if (business && !currentInvoice) {
      setCurrentInvoice(createInvoice(business, { date: todayPersian() }));
    }
  }, [business, currentInvoice]);

  const openInvoice = useCallback((invoice) => {
    setCurrentInvoice(invoice);
    setIsNew(false);
    setSaved(false);
    navigate('editor');
  }, [navigate]);

  const duplicateInvoice = useCallback((invoice) => {
    if (!business) return;
    const serial = nextSerial(invoices, business.next_number);
    setCurrentInvoice(createInvoice(business, {
      ...invoice,
      id: null,
      serial,
      number: buildNumber(business, serial),
      date: todayPersian(),
      status: 'issued',
      paid_amount: 0,
    }));
    setIsNew(true);
    setSaved(false);
    navigate('editor');
    setToast('کپی فاکتور آماده ویرایش است');
  }, [business, invoices, navigate]);

  const removeInvoice = useCallback(async (invoice) => {
    if (!window.confirm(`فاکتور ${invoice.number} حذف شود؟`)) return;
    try {
      await deleteInvoice(invoice.id);
      setInvoices((rows) => rows.filter((row) => row.id !== invoice.id));
      if (currentInvoice?.id === invoice.id) {
        setCurrentInvoice(null);
        setIsNew(true);
      }
      setToast('فاکتور حذف شد');
    } catch (error) {
      setToast(`حذف انجام نشد: ${error.message}`);
    }
  }, [currentInvoice?.id]);

  // ---------- persistence ----------
  const persistInvoice = useCallback(async () => {
    if (!currentInvoice) return;
    if (!String(currentInvoice.number).trim()) {
      setToast('شماره فاکتور نمی‌تواند خالی باشد');
      return;
    }
    if (!currentInvoice.items.some((item) => String(item.title).trim())) {
      setToast('دست‌کم یک قلم با شرح کالا یا خدمات وارد کنید');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await insertInvoice(currentInvoice);
        setInvoices((rows) => [created, ...rows]);
        setCurrentInvoice(created);
        setIsNew(false);
        setSaved(true);
        if (business) {
          const bumped = await saveBusiness({ ...business, next_number: Number(created.serial) + 1 });
          setBusiness(bumped);
        }
        setToast(`فاکتور ${created.number} ثبت شد`);
      } else {
        const updated = await updateInvoice(currentInvoice.id, currentInvoice);
        setInvoices((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
        setCurrentInvoice(updated);
        setSaved(true);
        setToast('تغییرات فاکتور ذخیره شد');
      }
    } catch (error) {
      setToast(`ذخیره ناموفق بود: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [business, currentInvoice, isNew]);

  const persistBusiness = useCallback(async (profile) => {
    const savedProfile = await saveBusiness(profile);
    setBusiness(savedProfile);
    return savedProfile;
  }, []);

  const handleLogoUploaded = useCallback(async (path) => {
    setLogo(await logoToDataUrl(path));
    if (business) {
      const savedProfile = await saveBusiness({ ...business, logo_path: path });
      setBusiness(savedProfile);
      return savedProfile;
    }
    return null;
  }, [business]);

  const handleLogoCleared = useCallback(async () => {
    setLogo('');
    if (business) {
      const savedProfile = await saveBusiness({ ...business, logo_path: '' });
      setBusiness(savedProfile);
    }
  }, [business]);

  // ---------- exports ----------
  const printable = printTarget || currentInvoice;

  useEffect(() => {
    if (!printTarget) return undefined;
    printInvoice();
    const timer = window.setTimeout(() => setPrintTarget(null), 1500);
    return () => window.clearTimeout(timer);
  }, [printTarget]);

  const handlePrint = useCallback((invoice) => {
    if (!invoice) return;
    if (printable && printable === invoice) printInvoice();
    else setPrintTarget(invoice);
  }, [printable]);

  const handleExcel = useCallback((invoice) => {
    if (!invoice || !business) return;
    try {
      exportInvoiceExcel(business, invoice);
      setToast(`فایل اکسل ${invoice.number} ذخیره شد`);
    } catch (error) {
      setToast(`خروجی اکسل ناموفق بود: ${error.message}`);
    }
  }, [business]);

  const handleJpeg = useCallback((invoice, node) => {
    if (!invoice) return;
    if (node?.current) {
      setExporting(true);
      exportInvoiceJpeg(node.current, invoice)
        .then(() => setToast(`تصویر JPG ${invoice.number} ذخیره شد`))
        .catch((error) => setToast(`ساخت تصویر ناموفق بود: ${error.message}`))
        .finally(() => setExporting(false));
      return;
    }
    setExporting(true);
    setJpegTarget(invoice);
  }, []);

  // The list and dashboard have no on-screen invoice, so render one off-screen just long enough to rasterise it.
  useEffect(() => {
    if (!jpegTarget) return;
    const node = offscreenRef.current;
    if (!node) return;
    exportInvoiceJpeg(node, jpegTarget)
      .then(() => setToast(`تصویر JPG ${jpegTarget.number} ذخیره شد`))
      .catch((error) => setToast(`ساخت تصویر ناموفق بود: ${error.message}`))
      .finally(() => {
        setJpegTarget(null);
        setExporting(false);
      });
  }, [jpegTarget]);

  const handleExportAll = useCallback(() => {
    if (!business || !invoices.length) return;
    try {
      exportInvoicesExcel(business, invoices);
      setToast('فایل اکسل فهرست فاکتورها ذخیره شد');
    } catch (error) {
      setToast(`خروجی اکسل ناموفق بود: ${error.message}`);
    }
  }, [business, invoices]);

  const signOut = async () => {
    setProfileOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) setToast(`خروج انجام نشد: ${error.message}`);
  };

  const totals = useMemo(() => ({ count: invoices.length }), [invoices.length]);

  if (authLoading) {
    return <div className="app-loading" dir="rtl"><span className="loading-spinner" />در حال برقراری اتصال…</div>;
  }
  if (!session) return <AuthScreen />;

  const user = session.user;
  const displayName = user?.user_metadata?.full_name || (user?.is_anonymous ? 'کاربر مهمان' : user?.email?.split('@')[0] || 'کاربر');

  return (
    <div className="app-shell" dir="rtl">
      {mobileMenuOpen && <button className="mobile-overlay" aria-label="بستن منو" onClick={() => setMobileMenuOpen(false)} />}

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <Brand />
            <button className="icon-btn close-menu" onClick={() => setMobileMenuOpen(false)} aria-label="بستن منو"><X size={20} /></button>
          </div>
          <nav className="side-nav" aria-label="منوی اصلی">
            <span className="nav-caption">منوی اصلی</span>
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} className={`nav-item ${activePage === id ? 'active' : ''}`} onClick={() => (id === 'editor' && isNew ? startNewInvoice() : navigate(id))}>
                <Icon size={20} />
                <span>{label}</span>
                {id === 'invoices' && <span className="nav-count">{toPersianDigits(totals.count)}</span>}
              </button>
            ))}
          </nav>

          <div className="emergency-card">
            <span className="emergency-icon"><Wallet size={18} /></span>
            <div>
              <strong>سربرگ خود را بسازید</strong>
              <p>لوگو و اطلاعات کسب‌وکار را یک‌بار وارد کنید، روی همه فاکتورها چاپ می‌شود.</p>
              <button type="button" onClick={() => navigate('settings')}>تنظیم فاکتور</button>
            </div>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="settings-link" onClick={() => navigate('settings')}><Settings2 size={19} /> تنظیم فاکتور</button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
              <span className="avatar">{displayName.slice(0, 2)}</span>
              <span className="profile-copy">
                <strong>{displayName}</strong>
                <small>{user?.is_anonymous ? 'حساب مهمان' : user?.email}</small>
              </span>
              <ChevronUp size={17} className={profileOpen ? '' : 'flipped'} />
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <button onClick={() => navigate('settings')}><UserRound size={17} /> تنظیم فاکتور</button>
                <button onClick={signOut}><LogOut size={17} /> خروج از حساب</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <button className="icon-btn" aria-label="باز کردن منو" onClick={() => setMobileMenuOpen(true)}><Menu size={22} /></button>
            <Brand compact />
          </div>
          <div className="topbar-title">
            <h2>{pageTitles[activePage]}</h2>
            <span>{business?.business_name || 'فاکتور ساز'}</span>
          </div>
          <div className="topbar-actions">
            <button className="outline-btn desktop-quick" onClick={() => navigate('settings')}><SlidersHorizontal size={17} /> تنظیم فاکتور</button>
            <button className="primary-btn desktop-new-report" onClick={startNewInvoice}><FilePlus2 size={19} /> فاکتور جدید</button>
          </div>
        </header>

        <div className="content-wrap">
          {dataError && (
            <div className="auth-alert error" role="alert">
              {dataError}
              <button className="text-btn" onClick={() => window.location.reload()}>تلاش دوباره</button>
            </div>
          )}

          {activePage === 'dashboard' && business && (
            <DashboardPage
              business={business}
              invoices={invoices}
              loading={loadingData}
              onNew={startNewInvoice}
              onOpen={openInvoice}
              onNavigate={navigate}
              onPrint={handlePrint}
              onJpeg={(invoice) => handleJpeg(invoice)}
              exporting={exporting}
            />
          )}

          {activePage === 'editor' && business && currentInvoice && (
            <InvoiceEditorPage
              business={business}
              logo={logo}
              invoice={currentInvoice}
              onChange={(next) => { setCurrentInvoice(next); setSaved(false); }}
              onSave={persistInvoice}
              onReset={startNewInvoice}
              onPrint={() => handlePrint(currentInvoice)}
              onExcel={() => handleExcel(currentInvoice)}
              onJpeg={(node) => handleJpeg(currentInvoice, node)}
              saving={saving}
              saved={saved}
              isNew={isNew}
              exporting={exporting}
              onNavigateSettings={() => navigate('settings')}
            />
          )}

          {activePage === 'invoices' && business && (
            <InvoicesPage
              invoices={invoices}
              loading={loadingData}
              onOpen={openInvoice}
              onDuplicate={duplicateInvoice}
              onDelete={removeInvoice}
              onPrint={handlePrint}
              onExcel={handleExcel}
              onJpeg={(invoice) => handleJpeg(invoice)}
              onExportAll={handleExportAll}
              onNew={startNewInvoice}
              exportingId={exporting ? jpegTarget?.id : null}
            />
          )}

          {activePage === 'settings' && business && (
            <InvoiceSettingsPage
              business={business}
              logo={logo}
              onSaved={setBusiness}
              onLogoUploaded={handleLogoUploaded}
              onLogoCleared={handleLogoCleared}
              showToast={setToast}
            />
          )}

          {!business && (
            <div className="empty-state"><span className="loading-spinner" /><h3>در حال آماده‌سازی فاکتور ساز</h3><p>تنظیم فاکتور شما در حال دریافت است…</p></div>
          )}
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="منوی پایین">
        <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}><LayoutDashboard size={20} /><span>پیشخوان</span></button>
        <button className={activePage === 'invoices' ? 'active' : ''} onClick={() => navigate('invoices')}><Receipt size={20} /><span>فاکتورها</span></button>
        <button className="mobile-add" onClick={startNewInvoice} aria-label="فاکتور جدید"><FilePlus2 size={24} /></button>
        <button className={activePage === 'editor' ? 'active' : ''} onClick={() => navigate('editor')}><FileSpreadsheet size={20} /><span>ویرایش</span></button>
        <button className={activePage === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings2 size={20} /><span>تنظیم</span></button>
      </nav>

      {/* Printed copy: hidden on screen, the only thing @media print reveals. */}
      {createPortal(
        <div className="print-portal">
          {printable && <InvoiceDocument business={business} invoice={printable} logo={logo} />}
        </div>,
        document.body,
      )}

      {/* Off-screen A4 copy used to rasterise invoices straight from the list. */}
      {createPortal(
        <div className="offscreen-stage" aria-hidden="true">
          {jpegTarget && business && (
            <InvoiceStage business={business} invoice={jpegTarget} logo={logo} stageRef={offscreenRef} />
          )}
        </div>,
        document.body,
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon"><Check size={18} strokeWidth={3} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'compact' : ''}`} aria-label="فاکتور ساز">
      <span className="brand-mark"><Receipt size={21} strokeWidth={2.4} /></span>
      {!compact && (
        <span>
          <strong>فاکتور ساز</strong>
          <small>سربرگ کسب‌وکار شما</small>
        </span>
      )}
    </div>
  );
}

export default App;
