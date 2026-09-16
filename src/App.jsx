import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Gem,
  Headphones,
  Heart,
  Instagram,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Watch,
  X,
} from 'lucide-react';
import heroImage from './assets/davam-hero.jpg';
import azadiImage from './assets/watch-azadi.jpg';
import shabImage from './assets/watch-shab.jpg';
import mahImage from './assets/watch-mah.jpg';
import sahraImage from './assets/watch-sahra.jpg';
import silverImage from './assets/watch-silver.jpg';
import royaImage from './assets/watch-roya.jpg';

const products = [
  {
    id: 'azadi',
    name: 'آزادی',
    latinName: 'AZADI AUTOMATIC',
    collection: 'کالکشن میراث',
    category: 'men',
    categoryLabel: 'مردانه',
    image: azadiImage,
    price: 18980000,
    oldPrice: 20900000,
    badge: 'پرفروش',
    rating: '۴٫۹',
    reviews: '۳۲',
    movement: 'اتوماتیک ژاپن',
    caseSize: '۴۰ میلی‌متر',
    glass: 'سافایر ضدخش',
    resistance: '۵ اتمسفر',
    color: 'سرمه‌ای / چرم قهوه‌ای',
    description: 'ترکیبی آرام از صفحه‌ی سرمه‌ای آفتاب‌گردان و چرم دست‌دوز؛ برای قرارهایی که قرار است در خاطر بمانند.',
  },
  {
    id: 'shab',
    name: 'شب',
    latinName: 'SHAB CHRONOGRAPH',
    collection: 'کالکشن معاصر',
    category: 'men',
    categoryLabel: 'مردانه',
    image: shabImage,
    price: 24750000,
    oldPrice: null,
    badge: 'جدید',
    rating: '۴٫۸',
    reviews: '۱۸',
    movement: 'کرنوگراف کوارتز',
    caseSize: '۴۲ میلی‌متر',
    glass: 'کریستال معدنی',
    resistance: '۱۰ اتمسفر',
    color: 'مشکی / گان‌متال',
    description: 'کرنوگرافی یک‌دست و قدرتمند با جزئیاتی مهندسی‌شده؛ امضای انتخاب‌های دقیق و بی‌حاشیه.',
  },
  {
    id: 'mah',
    name: 'ماه',
    latinName: 'MAH PEARL',
    collection: 'کالکشن نور',
    category: 'women',
    categoryLabel: 'زنانه',
    image: mahImage,
    price: 15800000,
    oldPrice: 17400000,
    badge: 'انتخاب هدیه',
    rating: '۵٫۰',
    reviews: '۲۶',
    movement: 'کوارتز دقیق',
    caseSize: '۳۰ میلی‌متر',
    glass: 'کریستال ضدخش',
    resistance: '۳ اتمسفر',
    color: 'شامپاینی / صدفی',
    description: 'صفحه‌ی صدف طبیعی و بند حصیری ظریف، در قاب شامپاینی؛ درخشش ملایمی که هر روز قابل پوشیدن است.',
  },
  {
    id: 'sahra',
    name: 'صحرا',
    latinName: 'SAHRA FIELD',
    collection: 'کالکشن سفر',
    category: 'automatic',
    categoryLabel: 'اتوماتیک',
    image: sahraImage,
    price: 20400000,
    oldPrice: null,
    badge: 'تعداد محدود',
    rating: '۴٫۷',
    reviews: '۱۴',
    movement: 'اتوماتیک ۲۱ سنگ',
    caseSize: '۴۱ میلی‌متر',
    glass: 'سافایر ضدخش',
    resistance: '۱۰ اتمسفر',
    color: 'سبز جنگلی / برنز',
    description: 'بدنه‌ی برنزی گرم، صفحه‌ی سبز عمیق و بندی آماده‌ی سفر؛ ساخته‌شده برای مسیرهای نرفته.',
  },
  {
    id: 'sepehr',
    name: 'سپهر',
    latinName: 'SEPEHR 06',
    collection: 'کالکشن مینیمال',
    category: 'unisex',
    categoryLabel: 'یونیسکس',
    image: silverImage,
    price: 16900000,
    oldPrice: null,
    badge: 'مینیمال',
    rating: '۴٫۹',
    reviews: '۲۱',
    movement: 'کوارتز سوئیس',
    caseSize: '۳۶ میلی‌متر',
    glass: 'سافایر تخت',
    resistance: '۵ اتمسفر',
    color: 'نقره‌ای / سفید',
    description: 'خطوط معماری، قاب چهارگوش و صفحه‌ای بی‌پیرایه؛ انتخابی خنثی برای سبک‌های شخصی و ماندگار.',
  },
  {
    id: 'roya',
    name: 'رویا',
    latinName: 'ROYA ROSE',
    collection: 'کالکشن نور',
    category: 'women',
    categoryLabel: 'زنانه',
    image: royaImage,
    price: 14250000,
    oldPrice: 15900000,
    badge: 'ویژه',
    rating: '۴٫۸',
    reviews: '۱۷',
    movement: 'کوارتز دقیق',
    caseSize: '۲۸ میلی‌متر',
    glass: 'کریستال ضدخش',
    resistance: '۳ اتمسفر',
    color: 'رزگلد / زرشکی',
    description: 'قاب باریک رزگلد در کنار چرم زرشکی لطیف؛ طراحی شاعرانه‌ای برای لحظه‌های ساده و مهم.',
  },
];

const categories = [
  {
    id: 'men',
    title: 'ساعت مردانه',
    caption: 'دقیق، استوار، ماندگار',
    image: shabImage,
    count: '۲۴ مدل',
  },
  {
    id: 'women',
    title: 'ساعت زنانه',
    caption: 'ظرافت در هر ثانیه',
    image: mahImage,
    count: '۱۸ مدل',
  },
  {
    id: 'automatic',
    title: 'مکانیکی و اتوماتیک',
    caption: 'نبض زنده‌ی مهندسی',
    image: sahraImage,
    count: '۱۲ مدل',
  },
];

const navLinks = [
  ['new', 'جدیدترین‌ها'],
  ['collection', 'فروشگاه'],
  ['categories', 'کالکشن‌ها'],
  ['story', 'داستان دوام'],
  ['services', 'خدمات'],
];

function formatPrice(value) {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;
}

function Brand({ light = false, onClick }) {
  return (
    <a className={`brand ${light ? 'brand--light' : ''}`} href="#top" onClick={onClick} aria-label="گالری ساعت دوام، صفحه اصلی">
      <span className="brand__symbol" aria-hidden="true">
        <i className="brand__hand brand__hand--hour" />
        <i className="brand__hand brand__hand--minute" />
        <b />
      </span>
      <span className="brand__copy">
        <strong dir="ltr">DAVAM</strong>
        <small>گالری ساعت دوام</small>
      </span>
    </a>
  );
}

function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickProduct, setQuickProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [headerRaised, setHeaderRaised] = useState(false);

  const visibleProducts = useMemo(() => {
    if (activeFilter === 'all') return products;
    if (activeFilter === 'men') return products.filter((product) => product.category === 'men' || product.category === 'automatic');
    return products.filter((product) => product.category === activeFilter);
  }, [activeFilter]);

  const cartItems = useMemo(
    () => products.filter((product) => cart[product.id]).map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart],
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products.slice(0, 4);
    return products.filter((product) => `${product.name} ${product.latinName} ${product.collection} ${product.categoryLabel}`.toLowerCase().includes(query));
  }, [searchQuery]);

  useEffect(() => {
    const onScroll = () => setHeaderRaised(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activeFilter]);

  useEffect(() => {
    const anyOverlay = cartOpen || menuOpen || searchOpen || quickProduct;
    document.body.classList.toggle('is-locked', Boolean(anyOverlay));
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setCartOpen(false);
      setMenuOpen(false);
      setSearchOpen(false);
      setQuickProduct(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [cartOpen, menuOpen, searchOpen, quickProduct]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addToCart = (product, quantity = 1) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + quantity }));
    setToast(`«${product.name}» به سبد خرید اضافه شد`);
  };

  const updateQuantity = (id, change) => {
    setCart((current) => {
      const nextQuantity = (current[id] || 0) + change;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[id];
      else next[id] = nextQuantity;
      return next;
    });
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const selectCategory = (id) => {
    setActiveFilter(id);
    window.setTimeout(() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }), 30);
  };

  const submitNewsletter = (event) => {
    event.preventDefault();
    if (!newsletter.trim()) return;
    setNewsletter('');
    setToast('عضویت شما در باشگاه دوام ثبت شد');
  };

  return (
    <div className="site-shell" id="top" dir="rtl">
      <div className="announcement">
        <div className="container announcement__inner">
          <span><ShieldCheck size={14} /> ضمانت اصالت مادام‌العمر</span>
          <p>ارسال رایگان سراسر ایران برای خرید بالای ۱۵ میلیون تومان</p>
          <a href="tel:02188776654"><Phone size={13} /> ۰۲۱–۸۸۷۷۶۶۵۴</a>
        </div>
      </div>

      <header className={`site-header ${headerRaised ? 'site-header--raised' : ''}`}>
        <div className="container header__inner">
          <button className="header-icon mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="باز کردن منو">
            <Menu size={23} />
          </button>
          <Brand />
          <nav className="desktop-nav" aria-label="منوی اصلی">
            {navLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`}>{label}{id === 'collection' && <ChevronDown size={14} />}</a>
            ))}
          </nav>
          <div className="header-actions">
            <button className="header-icon" onClick={() => setSearchOpen(true)} aria-label="جست‌وجو">
              <Search size={20} />
            </button>
            <button className="header-icon action-account" onClick={() => setToast('ورود به باشگاه مشتریان به‌زودی فعال می‌شود')} aria-label="حساب کاربری">
              <CircleUserRound size={20} />
            </button>
            <button className="header-icon action-favorites" onClick={() => setToast(favorites.length ? `${new Intl.NumberFormat('fa-IR').format(favorites.length)} ساعت در علاقه‌مندی‌های شماست` : 'هنوز ساعتی را به علاقه‌مندی‌ها اضافه نکرده‌اید')} aria-label="علاقه‌مندی‌ها">
              <Heart size={20} />
              {favorites.length > 0 && <span className="action-count">{new Intl.NumberFormat('fa-IR').format(favorites.length)}</span>}
            </button>
            <button className="header-icon cart-trigger" onClick={() => setCartOpen(true)} aria-label={`سبد خرید، ${cartCount} کالا`}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="action-count">{new Intl.NumberFormat('fa-IR').format(cartCount)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <img className="hero__image" src={heroImage} alt="ساعت مکانیکی لوکس روی سنگ تیره" />
          <div className="hero__shade" />
          <div className="container hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow"><i /> کالکشن مکانیک ۱۴۰۵</span>
              <h1 id="hero-title">زمان می‌گذرد؛<br /><em>اثر شما می‌ماند.</em></h1>
              <p>منتخبی از ساعت‌های اصیل برای آدم‌هایی که جزئیات را اتفاقی انتخاب نمی‌کنند.</p>
              <div className="hero__actions">
                <a className="button button--gold" href="#collection">تماشای کالکشن <ArrowLeft size={18} /></a>
                <button className="button button--ghost" onClick={() => setToast('درخواست مشاوره شما ثبت شد؛ با شما تماس می‌گیریم')}>مشاوره انتخاب ساعت</button>
              </div>
              <div className="hero__note"><BadgeCheck size={17} /><span><b>انتخاب با اطمینان</b> هفت روز فرصت تعویض</span></div>
            </div>
          </div>
          <a className="hero__scroll" href="#categories" aria-label="رفتن به بخش بعد"><span>کشف کنید</span><ChevronDown size={18} /></a>
        </section>

        <section className="trust-strip" aria-label="مزایای خرید از دوام">
          <div className="container trust-strip__grid">
            <article><span><BadgeCheck size={23} /></span><div><strong>اصالت تضمین‌شده</strong><small>گواهی اصالت برای تمام مدل‌ها</small></div></article>
            <article><span><Truck size={23} /></span><div><strong>ارسال امن و رایگان</strong><small>بسته‌بندی ویژه به سراسر ایران</small></div></article>
            <article><span><RotateCcw size={23} /></span><div><strong>۷ روز فرصت تعویض</strong><small>خرید آسوده و بدون دغدغه</small></div></article>
            <article><span><Headphones size={23} /></span><div><strong>مشاوره تخصصی</strong><small>همراهی ساعت‌شناس‌های دوام</small></div></article>
          </div>
        </section>

        <section className="section categories-section" id="categories">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div><span className="kicker">برای هر سبک، یک انتخاب</span><h2>ساعتی که شبیه شماست</h2></div>
              <p>از ظرافت کلاسیک تا جسارت معاصر؛ کالکشن‌های دوام برای ریتم‌های متفاوت زندگی انتخاب شده‌اند.</p>
            </div>
            <div className="category-grid">
              {categories.map((category, index) => (
                <button
                  className={`category-card category-card--${index + 1}`}
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  data-reveal
                >
                  <img src={category.image} alt="" />
                  <span className="category-card__overlay" />
                  <span className="category-card__count">{category.count}</span>
                  <span className="category-card__copy">
                    <small>{category.caption}</small>
                    <strong>{category.title}</strong>
                    <i>مشاهده مدل‌ها <ArrowUpLeft size={17} /></i>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section product-section" id="collection">
          <div className="container">
            <div className="product-heading" data-reveal>
              <div><span className="kicker">انتخاب‌های این ماه</span><h2>محبوب‌های دوام</h2></div>
              <div className="filter-tabs" role="tablist" aria-label="فیلتر ساعت‌ها">
                {[
                  ['all', 'همه'],
                  ['men', 'مردانه'],
                  ['women', 'زنانه'],
                  ['automatic', 'اتوماتیک'],
                  ['unisex', 'یونیسکس'],
                ].map(([id, label]) => (
                  <button key={id} className={activeFilter === id ? 'active' : ''} onClick={() => setActiveFilter(id)} role="tab" aria-selected={activeFilter === id}>{label}</button>
                ))}
              </div>
            </div>

            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(product.id)}
                  onFavorite={() => toggleFavorite(product.id)}
                  onQuickView={() => setQuickProduct(product)}
                  onAdd={() => addToCart(product)}
                />
              ))}
            </div>
            <div className="collection-footer" data-reveal>
              <span>نمایش {new Intl.NumberFormat('fa-IR').format(visibleProducts.length)} مدل منتخب</span>
              <button onClick={() => { setActiveFilter('all'); setToast('تمام مدل‌های موجود نمایش داده شد'); }}>مشاهده تمام ساعت‌ها <ArrowLeft size={17} /></button>
            </div>
          </div>
        </section>

        <section className="editorial-section" id="story">
          <div className="container editorial" data-reveal>
            <div className="editorial__image">
              <img src={silverImage} alt="ساعت مینیمال سپهر از گالری دوام" />
              <span className="editorial__label"><b>DAVAM</b><small>EST. 2016</small></span>
            </div>
            <div className="editorial__content">
              <span className="kicker kicker--light">داستان دوام</span>
              <h2>یک ساعت خوب،<br />فقط زمان را نشان نمی‌دهد.</h2>
              <p>از سال ۱۳۹۵، دوام با یک باور ساده شکل گرفت: ساعت باید بخشی از روایت شخصی شما باشد. هر مدل را بر اساس کیفیت ساخت، اصالت طراحی و امکان همراهی طولانی‌مدت انتخاب می‌کنیم.</p>
              <blockquote>«چیزهایی را انتخاب کنید که با گذشت زمان، ارزشمندتر می‌شوند.»</blockquote>
              <a href="#services">بیشتر درباره‌ی ما <ArrowLeft size={17} /></a>
            </div>
          </div>
        </section>

        <section className="section craft-section" id="services">
          <div className="container craft-layout">
            <div className="craft-intro" data-reveal>
              <span className="kicker">فراتر از یک خرید</span>
              <h2>همراهی ما، از انتخاب تا سال‌ها بعد</h2>
              <p>تجربه‌ی دوام با تحویل ساعت تمام نمی‌شود. ساعت‌شناس‌های ما برای تنظیم، نگهداری و سرویس دوره‌ای کنار شما هستند.</p>
              <a className="text-link" href="tel:02188776654">رزرو مشاوره رایگان <ArrowLeft size={17} /></a>
            </div>
            <div className="craft-features">
              <article data-reveal><span>۰۱</span><Watch size={27} /><h3>تنظیم پیش از ارسال</h3><p>کنترل عملکرد، تنظیم دقیق و بررسی ظاهری توسط کارشناس.</p></article>
              <article data-reveal><span>۰۲</span><Gem size={27} /><h3>بسته‌بندی امضای دوام</h3><p>جعبه‌ی ویژه، کارت اصالت و امکان آماده‌سازی برای هدیه.</p></article>
              <article data-reveal><span>۰۳</span><PackageCheck size={27} /><h3>پشتیبانی واقعی</h3><p>یادآوری سرویس و دسترسی مستقیم به تیم خدمات پس از فروش.</p></article>
            </div>
          </div>
        </section>

        <section className="journal-section" id="journal">
          <div className="container journal" data-reveal>
            <div className="journal__content">
              <span className="kicker kicker--light">راهنمای دوام</span>
              <h2>اولین ساعت اتوماتیک خود را چطور انتخاب کنیم؟</h2>
              <p>از اندازه‌ی قاب و نوع موتور تا سبک زندگی؛ پنج نکته‌ی ساده برای انتخابی که سال‌ها دوستش داشته باشید.</p>
              <button onClick={() => setToast('مقاله راهنمای خرید به‌زودی منتشر می‌شود')}>مطالعه راهنما <ArrowLeft size={18} /></button>
            </div>
            <div className="journal__watch" aria-hidden="true">
              <span className="watch-orbit" />
              <img src={azadiImage} alt="" />
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="container newsletter" data-reveal>
            <div><span><Sparkles size={18} /></span><div><h2>باشگاه خصوصی دوام</h2><p>از معرفی مدل‌های محدود، رویدادها و پیشنهادهای اختصاصی زودتر باخبر شوید.</p></div></div>
            <form onSubmit={submitNewsletter}>
              <label className="sr-only" htmlFor="newsletter-email">ایمیل شما</label>
              <input id="newsletter-email" type="email" value={newsletter} onChange={(event) => setNewsletter(event.target.value)} placeholder="ایمیل شما" required />
              <button aria-label="عضویت در خبرنامه"><Send size={18} /><span>عضویت</span></button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-about">
            <Brand light />
            <p>گالری تخصصی ساعت‌های اصیل؛ انتخاب‌شده برای ماندن در لحظه‌های مهم شما.</p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="اینستاگرام"><Instagram size={19} /></a>
              <a href="tel:02188776654" aria-label="تماس با دوام"><Phone size={18} /></a>
            </div>
          </div>
          <div className="footer-links"><h3>فروشگاه</h3><a href="#collection">ساعت مردانه</a><a href="#collection">ساعت زنانه</a><a href="#collection">ساعت اتوماتیک</a><a href="#collection">جدیدترین‌ها</a></div>
          <div className="footer-links"><h3>خدمات مشتریان</h3><a href="#services">راهنمای انتخاب</a><a href="#services">شرایط ارسال</a><a href="#services">گارانتی و اصالت</a><a href="#services">درخواست سرویس</a></div>
          <div className="footer-contact"><h3>گالری دوام</h3><p><MapPin size={17} />تهران، بلوار میرداماد، مرکز خرید آرین، طبقه دوم</p><a href="tel:02188776654"><Phone size={17} /><span dir="ltr">021 8877 6654</span></a><p><Clock3 size={17} />شنبه تا پنج‌شنبه، ۱۰ تا ۲۱</p></div>
        </div>
        <div className="container footer-bottom"><span>© ۱۴۰۵ گالری ساعت دوام — تمامی حقوق محفوظ است.</span><div><a href="#top">حریم خصوصی</a><a href="#top">قوانین خرید</a><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>بازگشت به بالا <ChevronRight size={15} /></button></div></div>
      </footer>

      <button className="floating-support" onClick={() => setToast('کارشناسان دوام آماده‌ی راهنمایی شما هستند')} aria-label="گفت‌وگو با کارشناس">
        <Headphones size={21} /><span>مشاوره خرید</span>
      </button>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} cartCount={cartCount} onCart={() => { setMenuOpen(false); setCartOpen(true); }} />}
      {searchOpen && <SearchOverlay query={searchQuery} setQuery={setSearchQuery} results={searchResults} onClose={() => setSearchOpen(false)} onSelect={(product) => { setSearchOpen(false); setQuickProduct(product); }} />}
      {cartOpen && <CartDrawer items={cartItems} total={cartTotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => setToast('سبد شما آماده است؛ اتصال درگاه پرداخت در مرحله بعد انجام می‌شود')} onBrowse={() => { setCartOpen(false); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }} />}
      {quickProduct && <QuickView product={quickProduct} favorite={favorites.includes(quickProduct.id)} onFavorite={() => toggleFavorite(quickProduct.id)} onClose={() => setQuickProduct(null)} onAdd={(quantity) => { addToCart(quickProduct, quantity); setQuickProduct(null); setCartOpen(true); }} />}

      {toast && <div className="toast" role="status"><span><BadgeCheck size={18} /></span>{toast}</div>}
    </div>
  );
}

function ProductCard({ product, favorite, onFavorite, onQuickView, onAdd }) {
  return (
    <article className="product-card" data-reveal>
      <div className="product-card__media">
        <button className={`favorite-button ${favorite ? 'active' : ''}`} onClick={onFavorite} aria-label={favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button>
        <span className="product-badge">{product.badge}</span>
        <button className="product-card__image" onClick={onQuickView} aria-label={`مشاهده ${product.name}`}><img src={product.image} alt={`ساعت ${product.name} از ${product.collection}`} loading="lazy" /></button>
        <div className="product-card__quick">
          <button onClick={onQuickView}>مشاهده سریع</button>
          <button onClick={onAdd} aria-label="افزودن به سبد"><ShoppingBag size={18} /></button>
        </div>
      </div>
      <div className="product-card__info">
        <div className="product-card__meta"><span>{product.collection}</span><span><Star size={13} fill="currentColor" /> {product.rating}</span></div>
        <button className="product-card__title" onClick={onQuickView}><h3>دوام «{product.name}»</h3><small dir="ltr">{product.latinName}</small></button>
        <div className="product-card__price"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
      </div>
    </article>
  );
}

function MobileMenu({ onClose, onSearch, cartCount, onCart }) {
  return (
    <div className="overlay overlay--menu" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="منوی اصلی">
        <div className="mobile-menu__head"><Brand onClick={onClose} /><button className="close-button" onClick={onClose} aria-label="بستن منو"><X size={21} /></button></div>
        <button className="mobile-search" onClick={onSearch}><Search size={19} /> جست‌وجوی ساعت و کالکشن <ArrowLeft size={16} /></button>
        <nav>{navLinks.map(([id, label]) => <a key={id} href={`#${id}`} onClick={onClose}>{label}<ChevronLeft size={17} /></a>)}</nav>
        <div className="mobile-menu__actions"><button onClick={onCart}><ShoppingBag size={19} /> سبد خرید <span>{new Intl.NumberFormat('fa-IR').format(cartCount)}</span></button><button><CircleUserRound size={19} /> باشگاه مشتریان</button></div>
        <a className="mobile-menu__phone" href="tel:02188776654"><span><Headphones size={20} /></span><div><small>مشاوره انتخاب ساعت</small><strong dir="ltr">021 8877 6654</strong></div></a>
      </aside>
    </div>
  );
}

function SearchOverlay({ query, setQuery, results, onClose, onSelect }) {
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div className="container search-panel">
        <div className="search-panel__head"><div><span>DAVAM FINDER</span><h2 id="search-title">دنبال چه ساعتی هستید؟</h2></div><button className="close-button" onClick={onClose} aria-label="بستن جست‌وجو"><X size={22} /></button></div>
        <div className="search-input"><Search size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام مدل، کالکشن یا سبک را بنویسید..." /><kbd>ESC</kbd></div>
        <div className="search-panel__label">{query ? `${new Intl.NumberFormat('fa-IR').format(results.length)} نتیجه` : 'پیشنهادهای محبوب'}</div>
        <div className="search-results">
          {results.length ? results.map((product) => (
            <button key={product.id} onClick={() => onSelect(product)}>
              <img src={product.image} alt="" /><span><small>{product.collection}</small><strong>دوام «{product.name}»</strong><em>{formatPrice(product.price)}</em></span><ArrowUpLeft size={19} />
            </button>
          )) : <div className="search-empty"><Search size={27} /><strong>نتیجه‌ای پیدا نشد</strong><p>نام مدل یا دسته‌بندی دیگری را امتحان کنید.</p></div>}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ items, total, onClose, onUpdate, onCheckout, onBrowse }) {
  const freeShipping = 15000000;
  const remaining = Math.max(0, freeShipping - total);
  const progress = Math.min(100, (total / freeShipping) * 100);
  return (
    <div className="overlay overlay--cart" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header><div><ShoppingBag size={21} /><h2 id="cart-title">سبد خرید</h2><span>{new Intl.NumberFormat('fa-IR').format(items.reduce((sum, item) => sum + item.quantity, 0))} کالا</span></div><button className="close-button" onClick={onClose} aria-label="بستن سبد"><X size={21} /></button></header>
        {items.length ? (
          <>
            <div className="shipping-progress"><div><Truck size={17} /><p>{remaining > 0 ? <><b>{formatPrice(remaining)}</b> تا ارسال رایگان</> : <><b>ارسال سفارش شما رایگان شد</b></>}</p></div><span><i style={{ width: `${progress}%` }} /></span></div>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img src={item.image} alt={`ساعت ${item.name}`} />
                  <div><span>{item.collection}</span><h3>دوام «{item.name}»</h3><small>{item.color}</small><strong>{formatPrice(item.price)}</strong><div className="quantity-control"><button onClick={() => onUpdate(item.id, -1)} aria-label="کم کردن تعداد"><Minus size={14} /></button><span>{new Intl.NumberFormat('fa-IR').format(item.quantity)}</span><button onClick={() => onUpdate(item.id, 1)} aria-label="افزودن تعداد"><Plus size={14} /></button></div></div>
                  <button className="cart-item__remove" onClick={() => onUpdate(item.id, -item.quantity)} aria-label="حذف کالا"><X size={16} /></button>
                </article>
              ))}
            </div>
            <footer><div className="cart-summary"><span>مجموع سفارش</span><strong>{formatPrice(total)}</strong></div><small>هزینه ارسال در مرحله بعد محاسبه می‌شود.</small><button className="button button--dark" onClick={onCheckout}>ادامه و ثبت سفارش <ArrowLeft size={18} /></button><div><ShieldCheck size={15} /> پرداخت امن و ضمانت اصالت کالا</div></footer>
          </>
        ) : (
          <div className="empty-cart"><span><ShoppingBag size={34} /></span><h3>سبد خرید شما خالی است</h3><p>شاید ساعت بعدی شما بین انتخاب‌های محبوب دوام باشد.</p><button className="button button--dark" onClick={onBrowse}>دیدن ساعت‌ها <ArrowLeft size={17} /></button></div>
        )}
      </aside>
    </div>
  );
}

function QuickView({ product, favorite, onFavorite, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="overlay quick-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-title">
        <button className="close-button quick-view__close" onClick={onClose} aria-label="بستن"><X size={21} /></button>
        <div className="quick-view__media"><img src={product.image} alt={`ساعت ${product.name}`} /><span>{product.badge}</span></div>
        <div className="quick-view__content">
          <span className="quick-view__collection">{product.collection}</span>
          <h2 id="quick-title">دوام «{product.name}»</h2>
          <small dir="ltr">{product.latinName}</small>
          <div className="quick-rating"><span><Star size={14} fill="currentColor" /> {product.rating}</span><i /> <span>{product.reviews} دیدگاه خریداران</span></div>
          <p>{product.description}</p>
          <div className="quick-specs"><span><small>موتور</small><strong>{product.movement}</strong></span><span><small>اندازه قاب</small><strong>{product.caseSize}</strong></span><span><small>شیشه</small><strong>{product.glass}</strong></span><span><small>مقاومت آب</small><strong>{product.resistance}</strong></span></div>
          <div className="quick-color"><span><small>رنگ انتخابی</small><strong>{product.color}</strong></span><i /><i /><i /></div>
          <div className="quick-buy"><div><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div><div className="quantity-control"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{new Intl.NumberFormat('fa-IR').format(quantity)}</span><button onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div></div>
          <div className="quick-actions"><button className="button button--dark" onClick={() => onAdd(quantity)}><ShoppingBag size={18} /> افزودن به سبد خرید</button><button className={`quick-favorite ${favorite ? 'active' : ''}`} onClick={onFavorite} aria-label="علاقه‌مندی"><Heart size={20} fill={favorite ? 'currentColor' : 'none'} /></button></div>
          <div className="quick-assurance"><span><BadgeCheck size={16} /> ضمانت اصالت</span><span><Truck size={16} /> ارسال امن</span><span><RotateCcw size={16} /> ۷ روز تعویض</span></div>
        </div>
      </section>
    </div>
  );
}

export default App;
