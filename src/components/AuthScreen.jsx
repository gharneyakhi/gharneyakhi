import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Home, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function getAuthErrorMessage(error) {
  const messages = {
    'Invalid login credentials': 'ایمیل یا رمز عبور صحیح نیست.',
    'Email not confirmed': 'ابتدا ایمیل تأیید حساب را باز کنید.',
    'User already registered': 'این ایمیل قبلاً ثبت‌نام کرده است.',
    'Anonymous sign-ins are disabled': 'ورود مهمان در تنظیمات Supabase فعال نشده است.',
  };
  return messages[error?.message] || error?.message || 'خطایی رخ داد؛ دوباره تلاش کنید.';
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (authError) throw authError;
        if (!data.session) setMessage('لینک تأیید برای شما ارسال شد. پس از تأیید ایمیل وارد شوید.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const enterAsGuest = async () => {
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInAnonymously({
        options: { data: { full_name: 'کاربر مهمان' } },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="auth-shell" dir="rtl">
        <section className="auth-card setup-card">
          <span className="auth-logo"><Home size={25} /></span>
          <h1>اتصال Supabase تنظیم نشده است</h1>
          <p>فایل <code>.env</code> را از روی <code>.env.example</code> بسازید و این دو مقدار را قرار دهید:</p>
          <pre>SUPABASE_URL=...{`\n`}SUPABASE_ANON_KEY=...</pre>
          <div className="auth-alert"><AlertTriangle size={18} /> پس از تغییر env، سرور توسعه را دوباره اجرا کنید.</div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell" dir="rtl">
      <section className="auth-card">
        <div className="auth-brand"><span className="auth-logo"><Home size={24} /></span><div><strong>همسایه‌یار</strong><small>آرامش در همسایگی</small></div></div>
        <div className="auth-copy"><h1>{mode === 'login' ? 'خوش آمدید' : 'ساخت حساب امن'}</h1><p>{mode === 'login' ? 'برای مشاهده و پیگیری گزارش‌های خود وارد شوید.' : 'اطلاعات شما با سیاست‌های امنیتی Supabase محافظت می‌شود.'}</p></div>
        <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>ورود</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>ثبت‌نام</button></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <label>نام و نام خانوادگی<div className="auth-input"><UserRound size={18} /><input required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" /></div></label>}
          <label>ایمیل<div className="auth-input"><Mail size={18} /><input required type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div></label>
          <label>رمز عبور<div className="auth-input"><LockKeyhole size={18} /><input required minLength="6" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div></label>
          {error && <div className="auth-alert error" role="alert">{error}</div>}
          {message && <div className="auth-alert success" role="status">{message}</div>}
          <button className="primary-btn auth-submit" disabled={busy}>{busy ? 'لطفاً صبر کنید…' : mode === 'login' ? <>ورود <ArrowLeft size={17} /></> : <>ساخت حساب <ArrowLeft size={17} /></>}</button>
        </form>
        <div className="auth-divider"><span>یا</span></div>
        <button className="guest-btn" disabled={busy} onClick={enterAsGuest}><LockKeyhole size={18} /><span><strong>ورود ناشناس / مهمان</strong><small>بدون ایمیل وارد شوید؛ گزارش‌ها همچنان فقط برای همین نشست کاربری قابل دسترسی‌اند.</small></span></button>
        <p className="auth-privacy">ورود مهمان در Supabase یک شناسه امن و ناشناس ایجاد می‌کند و هویت واقعی شما ثبت نمی‌شود.</p>
      </section>
    </main>
  );
}
