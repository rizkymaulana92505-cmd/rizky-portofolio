import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import Field from '@/components/ui/Field';
import Loading from '@/components/ui/Loading';
import { isValidEmail } from '@/lib/messages';
import { useAuth } from '../auth/AuthContext';
import { useAdminTitle } from '../hooks/useAdminTitle';

const safeFrom = (from) => (typeof from === 'string' && from.startsWith('/admin') && !from.startsWith('/admin/login') ? from : '/admin');

export default function LoginPage() {
  useAdminTitle('Masuk');
  const { status, expired, dismissExpired, signIn, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = safeFrom(location.state?.from);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const errors = {
    email: !email.trim() ? 'Email wajib diisi.' : !isValidEmail(email.trim()) ? 'Format email tidak valid.' : undefined,
    password: !password ? 'Kata sandi wajib diisi.' : undefined,
  };

  useEffect(() => { document.getElementById('login-email')?.focus(); }, []);

  if (status === 'loading') return <Loading fullscreen label="Memeriksa sesi" />;
  if (status === 'authenticated') return <Navigate to={from} replace />;

  const checking = status === 'checking';
  const forbidden = status === 'forbidden';
  const unconfigured = status === 'unconfigured';

  const submit = async (e) => {
    e.preventDefault();
    if (submitting || checking) return;
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) {
      document.getElementById(errors.email ? 'login-email' : 'login-password')?.focus();
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      setPassword('');
      return;
    }
    navigate(from, { replace: true });
  };

  const busy = submitting || checking;

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between border-b border-ink px-gutter py-8 lg:border-b-0 lg:border-r lg:py-12">
        <Link to="/" className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] hover:underline">
          <ArrowLeft size={14} aria-hidden /> Kembali ke situs
        </Link>
        <div className="py-12 lg:py-0">
          <p className="label text-ink">Area terbatas</p>
          <h1 className="mt-4 font-display text-[clamp(4rem,14vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.05em] font-stretch-display">
            Admin<span aria-hidden>.</span>
          </h1>
          <p className="mt-6 max-w-sm text-ink-soft">Masuk untuk mengelola konten portofolio M. Rizky Maulana.</p>
        </div>
        <p className="label hidden lg:block">Akun admin dibuat lewat Supabase Dashboard — tidak ada pendaftaran publik.</p>
      </section>

      <section className="flex items-center px-gutter py-12 lg:py-0">
        <form onSubmit={submit} noValidate className="mx-auto w-full max-w-md" aria-label="Formulir masuk admin">
          <h2 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight">Masuk</h2>

          {expired && (
            <p role="alert" className="mt-6 flex items-start gap-2 border border-ink p-4 text-small font-medium">
              <AlertCircle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              <span className="flex-1">Sesi Anda telah berakhir. Silakan masuk kembali.</span>
              <button type="button" onClick={dismissExpired} className="min-h-8 px-2 font-mono text-[10px] uppercase underline">Tutup</button>
            </p>
          )}
          {unconfigured && (
            <p role="alert" className="mt-6 border border-ink p-4 text-small font-medium">
              Supabase belum dikonfigurasi. Isi <code className="font-mono">VITE_SUPABASE_URL</code> dan <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> di <code className="font-mono">.env.local</code>.
            </p>
          )}
          {forbidden && (
            <div role="alert" className="mt-6 border border-ink p-4 text-small">
              <p className="font-medium">Akun ini berhasil masuk, tetapi bukan admin situs ini.</p>
              <button type="button" onClick={() => signOut()} className="mt-3 inline-flex min-h-10 items-center font-mono text-[11px] uppercase tracking-[0.12em] underline">Keluar</button>
            </div>
          )}
          {formError && (
            <p role="alert" className="mt-6 flex items-start gap-2 border border-ink p-4 text-small font-medium">
              <AlertCircle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              {formError}
            </p>
          )}

          <fieldset disabled={busy || unconfigured} className="mt-8 space-y-8">
            <Field
              id="login-email" label="Email" type="email" inputMode="email" autoComplete="username" required
              value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={touched.email ? errors.email : undefined}
            />
            <div>
              <Field
                id="login-password" label="Kata sandi" type={show ? 'text' : 'password'} autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={touched.password ? errors.password : undefined}
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="mt-2 inline-flex min-h-10 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] hover:underline" aria-pressed={show}>
                {show ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                {show ? 'Sembunyikan' : 'Tampilkan'} kata sandi
              </button>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={busy || unconfigured}
            aria-busy={busy}
            className="mt-10 inline-flex h-14 w-full items-center justify-center gap-2 border border-ink bg-ink font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-70"
          >
            {busy ? <Loader2 size={16} aria-hidden className="animate-spin" /> : <LogIn size={16} strokeWidth={1.75} aria-hidden />}
            {checking ? 'Memeriksa akses…' : submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </section>
    </main>
  );
}
