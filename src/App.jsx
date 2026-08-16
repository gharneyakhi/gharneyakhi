import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Headphones,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircleMore,
  MoreHorizontal,
  Paperclip,
  PawPrint,
  PhoneCall,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
  Volume2,
  X,
} from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { createReport, fetchReports, updateReportStatus } from './services/reports';

const reportTypes = [
  { id: 'noise', title: 'سر و صدای زیاد', hint: 'موسیقی، مهمانی یا ساخت‌وساز', Icon: Volume2, color: 'coral' },
  { id: 'parking', title: 'پارک مزاحم', hint: 'مسدود کردن ورودی یا توقفگاه', Icon: CarFront, color: 'blue' },
  { id: 'common', title: 'مشاعات ساختمان', hint: 'راهرو، آسانسور یا حیاط', Icon: Building2, color: 'green' },
  { id: 'pet', title: 'حیوانات خانگی', hint: 'صدا یا نگهداری نامناسب', Icon: PawPrint, color: 'purple' },
  { id: 'other', title: 'سایر موارد', hint: 'موضوعی خارج از دسته‌های بالا', Icon: MoreHorizontal, color: 'sand' },
];

const navItems = [
  { id: 'dashboard', label: 'نمای کلی', Icon: LayoutDashboard },
  { id: 'reports', label: 'گزارش‌های من', Icon: ClipboardList },
  { id: 'guide', label: 'راهنمای حقوقی', Icon: BookOpen },
  { id: 'support', label: 'پشتیبانی', Icon: MessageCircleMore },
];

const statusMap = {
  reviewing: { label: 'در حال بررسی', className: 'amber' },
  answered: { label: 'پاسخ داده شد', className: 'teal' },
  resolved: { label: 'مختومه', className: 'gray' },
};

function toPersianDigits(value) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]);
}

function getPersianToday() {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return 'یکشنبه، ۲۵ مرداد ۱۴۰۵';
  }
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setAuthLoading(false);
        if (!nextSession) setReports([]);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return undefined;
    let active = true;
    setReportsLoading(true);
    fetchReports()
      .then((items) => active && setReports(items))
      .catch((error) => active && setToast(`خطا در دریافت گزارش‌ها: ${error.message}`))
      .finally(() => active && setReportsLoading(false));
    return () => { active = false; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addReport = async (report) => {
    const savedReport = await createReport(report, session.user);
    setReports((current) => [savedReport, ...current]);
    setToast('گزارش شما با موفقیت و به‌صورت امن ثبت شد');
    setActivePage('reports');
    return savedReport;
  };

  const closeReport = async (id) => {
    const updated = await updateReportStatus(id, 'resolved');
    setReports((items) => items.map((report) => (report.id === id ? updated : report)));
    setToast('گزارش به‌عنوان مختومه ثبت شد');
  };

  const signOut = async () => {
    setProfileOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) setToast(`خروج انجام نشد: ${error.message}`);
  };

  if (authLoading) return <div className="app-loading" dir="rtl"><span className="loading-spinner" />در حال برقراری اتصال امن…</div>;
  if (!session) return <AuthScreen />;

  return (
    <div className="app-shell" dir="rtl">
      <Sidebar
        activePage={activePage}
        navigate={navigate}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={session.user}
        reportsCount={reports.length}
        onSignOut={signOut}
      />

      <main className="main-area">
        <Topbar
          activePage={activePage}
          setMobileMenuOpen={setMobileMenuOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          openReport={() => setReportModalOpen(true)}
        />

        <div className="content-wrap">
          {activePage === 'dashboard' && (
            <Dashboard
              reports={reports}
              openReport={() => setReportModalOpen(true)}
              navigate={navigate}
            />
          )}
          {activePage === 'reports' && (
            <ReportsPage
              reports={reports}
              loading={reportsLoading}
              closeReport={closeReport}
              openReport={() => setReportModalOpen(true)}
              showToast={setToast}
            />
          )}
          {activePage === 'guide' && <GuidePage navigate={navigate} />}
          {activePage === 'support' && <SupportPage showToast={setToast} />}
          {activePage === 'settings' && <SettingsPage showToast={setToast} />}
        </div>
      </main>

      <MobileBottomNav activePage={activePage} navigate={navigate} openReport={() => setReportModalOpen(true)} />

      {reportModalOpen && (
        <ReportWizard
          onClose={() => setReportModalOpen(false)}
          onSubmit={addReport}
        />
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
    <div className={`brand ${compact ? 'compact' : ''}`} aria-label="همسایه‌یار">
      <span className="brand-mark">
        <Home size={21} strokeWidth={2.4} />
        <span className="brand-heart">•</span>
      </span>
      {!compact && (
        <span>
          <strong>همسایه‌یار</strong>
          <small>آرامش در همسایگی</small>
        </span>
      )}
    </div>
  );
}

function Sidebar({ activePage, navigate, profileOpen, setProfileOpen, mobileMenuOpen, setMobileMenuOpen, user, reportsCount, onSignOut }) {
  const isGuest = user?.is_anonymous;
  const displayName = user?.user_metadata?.full_name || (isGuest ? 'کاربر مهمان' : user?.email?.split('@')[0] || 'کاربر');
  const avatar = displayName.slice(0, 2);
  return (
    <>
      {mobileMenuOpen && <button className="mobile-overlay" aria-label="بستن منو" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <Brand />
            <button className="icon-btn close-menu" onClick={() => setMobileMenuOpen(false)} aria-label="بستن منو">
              <X size={20} />
            </button>
          </div>
          <nav className="side-nav" aria-label="منوی اصلی">
            <span className="nav-caption">منوی اصلی</span>
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`nav-item ${activePage === id ? 'active' : ''}`}
                onClick={() => navigate(id)}
              >
                <Icon size={20} />
                <span>{label}</span>
                {id === 'reports' && <span className="nav-count">{toPersianDigits(reportsCount)}</span>}
              </button>
            ))}
          </nav>

          <div className="emergency-card">
            <span className="emergency-icon"><PhoneCall size={18} /></span>
            <div>
              <strong>شرایط اضطراری دارید؟</strong>
              <p>اگر در معرض خطر فوری هستید، مستقیماً با پلیس تماس بگیرید.</p>
              <a href="tel:110">تماس با ۱۱۰ <ArrowLeft size={15} /></a>
            </div>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="settings-link" onClick={() => navigate('settings')}>
            <Settings size={19} /> تنظیمات
          </button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}>
              <span className="avatar">{avatar}</span>
              <span className="profile-copy">
                <strong>{displayName}</strong>
                <small>{isGuest ? 'حساب ناشناس' : user?.email}</small>
              </span>
              <ChevronUp size={17} className={profileOpen ? '' : 'flipped'} />
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <button onClick={() => navigate('settings')}><UserRound size={17} /> حساب کاربری</button>
                <button onClick={onSignOut}><LogOut size={17} /> خروج از حساب</button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ activePage, setMobileMenuOpen, notificationsOpen, setNotificationsOpen, openReport }) {
  const titles = {
    dashboard: 'نمای کلی',
    reports: 'گزارش‌های من',
    guide: 'راهنمای حقوقی',
    support: 'پشتیبانی',
    settings: 'تنظیمات',
  };
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <button className="icon-btn" aria-label="باز کردن منو" onClick={() => setMobileMenuOpen(true)}><Menu size={22} /></button>
        <Brand compact />
      </div>
      <div className="topbar-title">
        <h2>{titles[activePage]}</h2>
        <span>{getPersianToday()}</span>
      </div>
      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className={`icon-btn notification-button ${notificationsOpen ? 'selected' : ''}`}
            onClick={() => setNotificationsOpen((v) => !v)}
            aria-label="اعلان‌ها"
          >
            <Bell size={20} />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <div className="notifications-popover">
              <div className="popover-title"><strong>اعلان‌ها</strong><span>۲ جدید</span></div>
              <button>
                <span className="notif-icon green"><MessageCircleMore size={17} /></span>
                <span><strong>پاسخ جدید دریافت کردید</strong><small>برای گزارش HY-2796 یک پاسخ ثبت شد.</small><time>۲ ساعت پیش</time></span>
              </button>
              <button>
                <span className="notif-icon amber"><Clock3 size={17} /></span>
                <span><strong>گزارش در حال بررسی است</strong><small>مدیر ساختمان گزارش شما را مشاهده کرد.</small><time>دیروز</time></span>
              </button>
            </div>
          )}
        </div>
        <button className="primary-btn desktop-new-report" onClick={openReport}><Plus size={19} /> گزارش جدید</button>
      </div>
    </header>
  );
}

function Dashboard({ reports, openReport, navigate }) {
  const recentReports = reports.slice(0, 3);
  const counts = useMemo(() => ({
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
    answered: reports.filter((r) => r.status === 'answered').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  }), [reports]);

  return (
    <div className="dashboard page-enter">
      <section className="welcome-row">
        <div>
          <span className="eyebrow"><Sparkles size={16} /> یک فضای امن برای گفتگو</span>
          <h1>سلام سارا، روز آرامی داشته باشی</h1>
          <p>اینجا می‌توانی مسائل همسایگی را محرمانه ثبت و تا رسیدن به نتیجه پیگیری کنی.</p>
        </div>
        <div className="privacy-chip"><ShieldCheck size={19} /><span><strong>محرمانگی کامل</strong><small>اطلاعات شما امن می‌ماند</small></span></div>
      </section>

      <section className="action-hero">
        <div className="hero-content">
          <span className="hero-kicker"><span /> سریع، امن و بدون تنش</span>
          <h2>آرامش خانه، حق شماست.</h2>
          <p>اگر رفتار آزاردهنده‌ای در ساختمان یا محله تکرار شده، گزارش خود را ثبت کنید تا از مسیر درست پیگیری شود.</p>
          <button className="light-action-btn" onClick={openReport}><Plus size={20} /> ثبت گزارش جدید <ArrowLeft size={18} /></button>
          <span className="hero-footnote"><LockKeyhole size={14} /> امکان ثبت گزارش به‌صورت ناشناس</span>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="building building-back">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="building building-front">
            <span /><span /><span /><span />
            <div className="building-door" />
          </div>
          <div className="tree"><i /><b /></div>
          <div className="calm-badge"><ShieldCheck size={20} /><span>پیگیری امن</span></div>
          <div className="ground-line" />
        </div>
      </section>

      <section className="stats-grid" aria-label="آمار گزارش‌ها">
        <StatCard title="در حال بررسی" value={counts.reviewing} Icon={Clock3} tone="amber" note="میانگین پاسخ: ۲ روز" />
        <StatCard title="پاسخ داده شده" value={counts.answered} Icon={MessageCircleMore} tone="blue" note="نیازمند مشاهده شما" />
        <StatCard title="مختومه" value={counts.resolved} Icon={CheckCircle2} tone="green" note="با رضایت شما بسته شده" />
      </section>

      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div><h3>آخرین گزارش‌ها</h3><p>وضعیت پیگیری درخواست‌های اخیر شما</p></div>
            <button className="text-btn" onClick={() => navigate('reports')}>مشاهده همه <ArrowLeft size={16} /></button>
          </div>
          <div className="report-list compact-list">
            {recentReports.map((report) => <ReportRow key={report.id} report={report} onClick={() => navigate('reports')} />)}
          </div>
        </section>

        <aside className="panel help-panel">
          <div className="help-icon"><Headphones size={23} /></div>
          <h3>نیاز به راهنمایی دارید؟</h3>
          <p>کارشناسان ما برای انتخاب بهترین مسیر پیگیری کنار شما هستند.</p>
          <div className="support-hours"><Clock3 size={16} /><span>شنبه تا پنجشنبه، ۸ تا ۲۰</span></div>
          <button className="outline-btn full-btn" onClick={() => navigate('support')}>گفتگو با پشتیبان</button>
        </aside>
      </div>

      <section className="soft-tip">
        <span className="tip-icon"><CircleHelp size={21} /></span>
        <div><strong>قبل از ثبت گزارش</strong><p>اگر امکان گفت‌وگوی محترمانه و امن وجود دارد، یک گفت‌وگوی کوتاه می‌تواند سریع‌ترین راه‌حل باشد. در شرایط پرتنش، مستقیماً گزارش ثبت کنید.</p></div>
        <button onClick={() => navigate('guide')}>مطالعه راهنمای گفت‌وگو <ChevronLeft size={17} /></button>
      </section>
    </div>
  );
}

function StatCard({ title, value, Icon, tone, note }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}><Icon size={21} /></span>
      <div className="stat-copy"><span>{title}</span><strong>{toPersianDigits(value)}</strong><small>{note}</small></div>
    </article>
  );
}

function TypeIcon({ type, size = 20 }) {
  const found = reportTypes.find((item) => item.id === type) || reportTypes[4];
  const Icon = found.Icon;
  return <span className={`type-icon ${found.color}`}><Icon size={size} /></span>;
}

function StatusBadge({ status }) {
  const value = statusMap[status] || statusMap.reviewing;
  return <span className={`status-badge ${value.className}`}><i />{value.label}</span>;
}

function ReportRow({ report, onClick, expanded = false, onToggle }) {
  return (
    <article className={`report-row ${expanded ? 'expanded' : ''}`}>
      <button className="report-row-main" onClick={onToggle || onClick}>
        <TypeIcon type={report.type} />
        <span className="report-summary">
          <strong>{report.title}</strong>
          <small><span>#{report.id}</span><i />{report.date}<i />{report.place}</small>
        </span>
        <StatusBadge status={report.status} />
        <ChevronLeft className="row-chevron" size={18} />
      </button>
      {expanded && (
        <div className="report-details">
          <p>{report.description}</p>
          <div className="detail-meta">
            <span><Clock3 size={15} /> ساعت ثبت: {report.time}</span>
            <span><MessageCircleMore size={15} /> {toPersianDigits(report.updates)} به‌روزرسانی</span>
          </div>
          <div className="mini-timeline">
            <span className="done"><Check size={13} /></span><p><strong>گزارش ثبت شد</strong><small>{report.date}، ساعت {report.time}</small></p>
            <span className={report.status !== 'reviewing' ? 'done' : 'current'}>{report.status !== 'reviewing' ? <Check size={13} /> : <Clock3 size={13} />}</span><p><strong>{report.status === 'reviewing' ? 'در انتظار نتیجه بررسی' : 'بررسی توسط مدیر ساختمان'}</strong><small>{report.status === 'reviewing' ? 'به‌زودی اطلاع‌رسانی می‌شود' : 'نتیجه برای شما ارسال شده است'}</small></p>
          </div>
        </div>
      )}
    </article>
  );
}

function ReportsPage({ reports, loading, closeReport, openReport, showToast }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(reports[0]?.id || null);
  const [closingId, setClosingId] = useState(null);
  const filtered = reports.filter((report) => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = !search || `${report.title} ${report.id} ${report.place}`.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleCloseReport = async (id) => {
    setClosingId(id);
    try {
      await closeReport(id);
    } catch (error) {
      showToast(`تغییر وضعیت انجام نشد: ${error.message}`);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="reports-page page-enter">
      <div className="page-heading-row">
        <div><span className="eyebrow"><ClipboardList size={16} /> بایگانی امن شما</span><h1>گزارش‌های من</h1><p>همه گزارش‌ها و به‌روزرسانی‌های آن‌ها را یک‌جا ببینید.</p></div>
        <button className="primary-btn" onClick={openReport}><Plus size={19} /> گزارش جدید</button>
      </div>

      <div className="report-toolbar panel">
        <div className="search-box"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جست‌وجو در عنوان یا کد گزارش..." /></div>
        <div className="filter-tabs">
          {[
            ['all', 'همه'], ['reviewing', 'در حال بررسی'], ['answered', 'پاسخ داده شده'], ['resolved', 'مختومه'],
          ].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
        </div>
        <button className="filter-icon-btn" title="فیلترها"><SlidersHorizontal size={19} /></button>
      </div>

      <section className="panel reports-container">
        <div className="reports-count"><strong>{toPersianDigits(filtered.length)} گزارش</strong><span>مرتب‌سازی: جدیدترین</span></div>
        <div className="report-list full-list">
          {loading ? (
            <div className="empty-state"><span className="loading-spinner" /><h3>در حال دریافت گزارش‌ها</h3><p>اطلاعات مستقیماً از Supabase خوانده می‌شود.</p></div>
          ) : filtered.length ? filtered.map((report) => (
            <div key={report.id}>
              <ReportRow report={report} expanded={expandedId === report.id} onToggle={() => setExpandedId((id) => id === report.id ? null : report.id)} />
              {expandedId === report.id && report.status !== 'resolved' && (
                <div className="report-actions-inline">
                  <button className="outline-btn" onClick={() => showToast('پیام شما برای پشتیبانی ارسال شد')}><MessageCircleMore size={16} /> ارسال پیام</button>
                  <button className="quiet-btn" disabled={closingId === report.id} onClick={() => handleCloseReport(report.id)}><CheckCircle2 size={16} /> {closingId === report.id ? 'در حال ذخیره…' : 'مشکل برطرف شده'}</button>
                </div>
              )}
            </div>
          )) : (
            <div className="empty-state"><Search size={28} /><h3>گزارشی پیدا نشد</h3><p>عبارت دیگری را جست‌وجو کنید یا فیلتر را تغییر دهید.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}

function GuidePage({ navigate }) {
  const guides = [
    { Icon: MessageCircleMore, title: 'گفت‌وگوی بدون تنش', text: 'چطور موضوع را محترمانه و شفاف با همسایه مطرح کنیم؟', time: '۵ دقیقه' },
    { Icon: Volume2, title: 'قوانین سر و صدا', text: 'ساعات استراحت و حدود متعارف صدای ساختمان چیست؟', time: '۷ دقیقه' },
    { Icon: CarFront, title: 'پارکینگ و حقوق ساکنان', text: 'درباره پارک مزاحم، جای پارک و مسیر عبور بیشتر بدانید.', time: '۶ دقیقه' },
    { Icon: Building2, title: 'استفاده از مشاعات', text: 'قوانین راهرو، پشت‌بام، حیاط و آسانسور به زبان ساده.', time: '۸ دقیقه' },
  ];
  return (
    <div className="guide-page page-enter">
      <div className="page-heading-row"><div><span className="eyebrow"><BookOpen size={16} /> دانستن، آغاز حل مسئله است</span><h1>راهنمای همسایگی</h1><p>پاسخ‌های کوتاه و کاربردی برای موقعیت‌های متداول ساختمان.</p></div></div>
      <section className="guide-feature panel">
        <div><span>پیشنهاد امروز</span><h2>قبل از گلایه، چطور یک گفت‌وگوی مؤثر داشته باشیم؟</h2><p>زمان مناسب را انتخاب کنید، از توصیف رفتار به‌جای قضاوت فرد استفاده کنید و برای رسیدن به راه‌حل مشترک فرصت بدهید.</p><button className="primary-btn" onClick={() => navigate('support')}>از مشاور بپرسید <ArrowLeft size={17} /></button></div>
        <div className="conversation-art" aria-hidden="true"><span className="bubble one">سلام، وقتتون بخیر...</span><span className="bubble two">حتماً، ممنون که گفتید</span><div className="people"><i /><i /></div></div>
      </section>
      <div className="guide-grid">
        {guides.map(({ Icon, title, text, time }) => (
          <button className="guide-card panel" key={title} onClick={() => navigate('support')}>
            <span><Icon size={22} /></span><h3>{title}</h3><p>{text}</p><small><Clock3 size={14} /> مطالعه در {time}</small><ArrowLeft className="guide-arrow" size={18} />
          </button>
        ))}
      </div>
      <section className="legal-note"><ShieldCheck size={23} /><div><strong>یادآوری مهم</strong><p>محتوای این بخش برای آگاهی عمومی است و جایگزین مشاوره حقوقی تخصصی نیست.</p></div></section>
    </div>
  );
}

function SupportPage({ showToast }) {
  const [message, setMessage] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
    showToast('پیام شما ارسال شد؛ به‌زودی پاسخ می‌دهیم');
  };
  return (
    <div className="support-page page-enter">
      <div className="page-heading-row"><div><span className="eyebrow"><Headphones size={16} /> ما کنار شما هستیم</span><h1>پشتیبانی و مشاوره</h1><p>پرسش خود را محرمانه با کارشناسان همسایه‌یار در میان بگذارید.</p></div></div>
      <div className="support-layout">
        <form className="panel support-form" onSubmit={submit}>
          <div className="section-heading"><div><h3>پیام جدید</h3><p>معمولاً کمتر از دو ساعت پاسخ می‌دهیم.</p></div><span className="online-dot">آنلاین</span></div>
          <label>موضوع پیام<select defaultValue="advice"><option value="advice">راهنمایی برای ثبت گزارش</option><option value="follow">پیگیری گزارش موجود</option><option value="legal">پرسش حقوقی</option><option value="technical">مشکل فنی</option></select></label>
          <label>پیام شما<textarea rows="7" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="موضوع را با جزئیات برای ما بنویسید..." /></label>
          <div className="form-footer"><button type="button" className="attachment-btn"><Paperclip size={17} /> پیوست فایل</button><button className="primary-btn" disabled={!message.trim()}>ارسال پیام <ArrowLeft size={17} /></button></div>
        </form>
        <aside className="support-side">
          <div className="panel contact-card"><span className="contact-icon"><PhoneCall size={22} /></span><h3>ترجیح می‌دهید تماس بگیرید؟</h3><p>کارشناسان پاسخ‌گویی آماده شنیدن صدای شما هستند.</p><a href="tel:02191001010">۰۲۱-۹۱۰۰۱۰۱۰</a><small>شنبه تا پنجشنبه، ساعت ۸ تا ۲۰</small></div>
          <div className="panel faq-card"><h3>پرسش‌های پرتکرار</h3><button>آیا هویت من برای همسایه نمایش داده می‌شود؟<ChevronLeft size={17} /></button><button>پیگیری گزارش چقدر زمان می‌برد؟<ChevronLeft size={17} /></button><button>چطور مدرک به گزارش اضافه کنم؟<ChevronLeft size={17} /></button></div>
        </aside>
      </div>
    </div>
  );
}

function SettingsPage({ showToast }) {
  const [anonymous, setAnonymous] = useState(true);
  const [notify, setNotify] = useState(true);
  const [sms, setSms] = useState(false);
  return (
    <div className="settings-page page-enter">
      <div className="page-heading-row"><div><span className="eyebrow"><Settings size={16} /> انتخاب‌های شما</span><h1>تنظیمات</h1><p>حریم خصوصی و روش دریافت اعلان‌ها را مدیریت کنید.</p></div></div>
      <section className="panel settings-panel">
        <div className="settings-section"><div className="settings-title"><ShieldCheck size={20} /><div><h3>حریم خصوصی</h3><p>نحوه نمایش اطلاعات شما هنگام ثبت گزارش</p></div></div><ToggleRow title="ثبت ناشناس به‌صورت پیش‌فرض" text="نام و شماره واحد شما برای طرف گزارش نمایش داده نمی‌شود." value={anonymous} setValue={setAnonymous} /></div>
        <div className="settings-section"><div className="settings-title"><Bell size={20} /><div><h3>اعلان‌ها</h3><p>به‌روزرسانی گزارش‌ها را چگونه دریافت می‌کنید</p></div></div><ToggleRow title="اعلان داخل برنامه" text="هر پاسخ یا تغییر وضعیت را در برنامه ببینید." value={notify} setValue={setNotify} /><ToggleRow title="پیامک" text="به‌روزرسانی‌های مهم به شماره همراه شما ارسال شود." value={sms} setValue={setSms} /></div>
        <div className="settings-save"><button className="primary-btn" onClick={() => showToast('تنظیمات با موفقیت ذخیره شد')}>ذخیره تغییرات</button></div>
      </section>
    </div>
  );
}

function ToggleRow({ title, text, value, setValue }) {
  return <div className="toggle-row"><div><strong>{title}</strong><p>{text}</p></div><button className={`toggle ${value ? 'on' : ''}`} onClick={() => setValue(!value)} aria-pressed={value}><span /></button></div>;
}

function MobileBottomNav({ activePage, navigate, openReport }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="منوی پایین">
      <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}><Home size={20} /><span>خانه</span></button>
      <button className={activePage === 'reports' ? 'active' : ''} onClick={() => navigate('reports')}><FileText size={20} /><span>گزارش‌ها</span></button>
      <button className="mobile-add" onClick={openReport} aria-label="ثبت گزارش"><Plus size={25} /></button>
      <button className={activePage === 'guide' ? 'active' : ''} onClick={() => navigate('guide')}><BookOpen size={20} /><span>راهنما</span></button>
      <button className={activePage === 'support' ? 'active' : ''} onClick={() => navigate('support')}><Headphones size={20} /><span>پشتیبانی</span></button>
    </nav>
  );
}

function ReportWizard({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('۱۴۰۵/۰۵/۲۵');
  const [time, setTime] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [anonymous, setAnonymous] = useState(true);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submittedId, setSubmittedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  const nextDisabled = step === 1 ? !selectedType : step === 2 ? !description.trim() || !place.trim() : false;

  const submit = async () => {
    const selected = reportTypes.find((item) => item.id === selectedType) || reportTypes[4];
    setSubmitting(true);
    setSubmitError('');
    try {
      const saved = await onSubmit({
        type: selectedType,
        title: selected.title,
        date: date || null,
        time: time || null,
        place,
        description,
        anonymous,
        severity,
        evidenceFile,
      });
      setSubmittedId(`HY-${saved.id.slice(0, 8).toUpperCase()}`);
      setStep(4);
    } catch (error) {
      setSubmitError(`ثبت گزارش انجام نشد: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <header className="modal-header">
          <div><span className="modal-icon"><FileText size={20} /></span><div><h2 id="report-title">ثبت گزارش جدید</h2><p>{step < 4 ? 'اطلاعات شما محرمانه نگهداری می‌شود' : 'گزارش با موفقیت ثبت شد'}</p></div></div>
          <button className="icon-btn" onClick={onClose} aria-label="بستن"><X size={21} /></button>
        </header>

        {step < 4 && (
          <div className="stepper">
            {[
              [1, 'نوع مزاحمت'], [2, 'جزئیات'], [3, 'بازبینی'],
            ].map(([number, label], index) => (
              <div className={`step ${step >= number ? 'active' : ''} ${step > number ? 'done' : ''}`} key={number}>
                <span>{step > number ? <Check size={14} /> : toPersianDigits(number)}</span><small>{label}</small>{index < 2 && <i />}
              </div>
            ))}
          </div>
        )}

        <div className="modal-body">
          {step === 1 && (
            <div className="wizard-step page-enter">
              <div className="wizard-title"><h3>چه نوع مزاحمتی رخ داده؟</h3><p>نزدیک‌ترین گزینه را انتخاب کنید.</p></div>
              <div className="type-grid">
                {reportTypes.map(({ id, title, hint, Icon, color }) => (
                  <button key={id} className={`type-option ${selectedType === id ? 'selected' : ''}`} onClick={() => setSelectedType(id)}>
                    <span className={`type-icon ${color}`}><Icon size={21} /></span><span><strong>{title}</strong><small>{hint}</small></span><i className="radio-dot">{selectedType === id && <span />}</i>
                  </button>
                ))}
              </div>
              <div className="privacy-note"><ShieldCheck size={18} /><p><strong>فضای امن شما</strong> طرف گزارش به اطلاعات تماس و هویت شما دسترسی نخواهد داشت.</p></div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step page-enter">
              <div className="wizard-title"><h3>کمی بیشتر توضیح دهید</h3><p>جزئیات دقیق به بررسی سریع‌تر کمک می‌کند.</p></div>
              <div className="form-grid">
                <label className="full-field">شرح اتفاق <span>ضروری</span><textarea autoFocus rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="چه اتفاقی افتاد؟ آیا قبلاً هم تکرار شده است؟" /><small className="char-count">{toPersianDigits(description.length)} / ۵۰۰</small></label>
                <label className="full-field">محل وقوع <span>ضروری</span><div className="input-with-icon"><MapPin size={18} /><input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="مثلاً واحد ۴ یا پارکینگ ساختمان" /></div></label>
                <label>تاریخ<div className="input-with-icon"><CalendarDays size={18} /><input value={date} onChange={(e) => setDate(e.target.value)} /></div></label>
                <label>ساعت<div className="input-with-icon"><Clock3 size={18} /><input value={time} onChange={(e) => setTime(e.target.value)} placeholder="مثلاً ۲۳:۳۰" /></div></label>
                <fieldset className="severity-field full-field"><legend>شدت مزاحمت</legend><div className="severity-options">{[['low', 'کم'], ['medium', 'متوسط'], ['high', 'زیاد']].map(([id, label]) => <button type="button" key={id} className={severity === id ? `active ${id}` : ''} onClick={() => setSeverity(id)}>{label}</button>)}</div></fieldset>
                <div className="upload-box full-field"><input type="file" id="evidence" hidden accept="image/*,audio/*,.pdf" onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} /><label htmlFor="evidence"><UploadCloud size={21} /><span><strong>{evidenceFile ? evidenceFile.name : 'افزودن تصویر، صدا یا PDF'}</strong><small>{evidenceFile ? 'فایل هنگام ثبت در فضای خصوصی آپلود می‌شود' : 'حداکثر ۱۰ مگابایت (اختیاری)'}</small></span>{evidenceFile && <CheckCircle2 className="upload-check" size={20} />}</label></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step page-enter review-step">
              <div className="wizard-title"><h3>همه‌چیز درست است؟</h3><p>پیش از ثبت نهایی، اطلاعات گزارش را بررسی کنید.</p></div>
              <div className="review-card">
                <div className="review-type"><TypeIcon type={selectedType} size={22} /><div><small>نوع مزاحمت</small><strong>{reportTypes.find((x) => x.id === selectedType)?.title}</strong></div><button onClick={() => setStep(1)}>ویرایش</button></div>
                <div className="review-description"><small>شرح اتفاق</small><p>{description}</p></div>
                <div className="review-meta"><span><MapPin size={16} /><small>محل</small><strong>{place}</strong></span><span><CalendarDays size={16} /><small>زمان</small><strong>{date}، {time || 'زمان ثبت'}</strong></span></div>
              </div>
              <div className="anonymous-row"><div><span className="anonymous-icon"><LockKeyhole size={19} /></span><div><strong>ثبت به‌صورت ناشناس</strong><p>هویت و شماره واحد شما نمایش داده نشود.</p></div></div><button className={`toggle ${anonymous ? 'on' : ''}`} onClick={() => setAnonymous(!anonymous)}><span /></button></div>
              {submitError && <div className="auth-alert error" role="alert">{submitError}</div>}
              <label className="confirm-check"><input type="checkbox" defaultChecked /><span><Check size={13} /></span><p>تأیید می‌کنم اطلاعات واردشده تا حد امکان دقیق و مطابق واقعیت است.</p></label>
            </div>
          )}

          {step === 4 && (
            <div className="success-step page-enter">
              <span className="success-icon"><CheckCircle2 size={42} /></span>
              <h3>گزارش شما ثبت شد</h3>
              <p>از اعتمادتان ممنونیم. نتیجه بررسی از طریق اعلان‌های برنامه به شما اطلاع داده می‌شود.</p>
              <div className="tracking-code"><span>کد پیگیری</span><strong>{submittedId}</strong></div>
              <div className="success-info"><Clock3 size={18} /><span><strong>زمان تقریبی بررسی</strong><small>۱ تا ۲ روز کاری</small></span></div>
              <button className="primary-btn full-btn" onClick={onClose}>مشاهده گزارش‌ها</button>
            </div>
          )}
        </div>

        {step < 4 && (
          <footer className="modal-footer">
            <button className="quiet-btn" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? 'انصراف' : <><ArrowRight size={17} /> مرحله قبل</>}</button>
            <button className="primary-btn" disabled={nextDisabled || submitting} onClick={step === 3 ? submit : () => setStep(step + 1)}>{step === 3 ? <><Check size={18} /> {submitting ? 'در حال آپلود و ثبت…' : 'ثبت نهایی گزارش'}</> : <>ادامه <ArrowLeft size={17} /></>}</button>
          </footer>
        )}
      </section>
    </div>
  );
}

export default App;
