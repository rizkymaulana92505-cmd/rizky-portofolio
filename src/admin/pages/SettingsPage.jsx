import { useState } from 'react';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import Field from '@/components/ui/Field';
import { supabase } from '@/lib/supabase';
import { supabaseEnv } from '@/lib/supabaseConfig';
import { useSupabaseStatus } from '@/hooks/useSupabaseStatus';
import { formatDateTime } from '@/lib/admin/format';
import { adminNav } from '../config/nav';
import { useAuth } from '../auth/AuthContext';
import { mapAuthError } from '../auth/errors';
import { useAdminTitle } from '../hooks/useAdminTitle';
import AdminPageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

const MIN_PASSWORD = 8;

function Section({ title, description, children }) {
  return (
    <section className="grid gap-6 border-b border-line py-10 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h2 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">{title}</h2>
        {description && <p className="mt-3 max-w-xs text-small text-mute">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:justify-between sm:gap-6">
    <dt className="label">{label}</dt>
    <dd className="break-all text-small font-medium sm:text-right">{children}</dd>
  </div>
);

export default function SettingsPage() {
  useAdminTitle('Pengaturan');
  const index = adminNav.find((n) => n.key === 'pengaturan')?.index;
  const { user, signOut } = useAuth();
  const toast = useToast();
  const status = useSupabaseStatus();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [globalOpen, setGlobalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const errors = {
    password: !password ? 'Kata sandi baru wajib diisi.' : password.length < MIN_PASSWORD ? `Minimal ${MIN_PASSWORD} karakter.` : undefined,
    confirm: confirm !== password ? 'Konfirmasi tidak sama dengan kata sandi baru.' : undefined,
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setTouched(true);
    setServerError(null);
    if (errors.password || errors.confirm) {
      document.getElementById(errors.password ? 'set-password' : 'set-confirm')?.focus();
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      const msg = mapAuthError(error);
      setServerError(msg);
      toast.error(msg);
      return;
    }
    setPassword('');
    setConfirm('');
    setTouched(false);
    toast.success('Kata sandi berhasil diubah.');
  };

  const signOutEverywhere = async () => {
    setSigningOut(true);
    await signOut({ everywhere: true });
  };

  let host = '—';
  try { host = new URL(supabaseEnv.url).host; } catch { /* env belum valid */ }

  return (
    <>
      <AdminPageHeader index={index} title="Pengaturan" description="Akun admin, keamanan, dan status koneksi." />

      <Section title="Akun" description="Identitas admin yang sedang masuk.">
        <dl className="border-t border-ink">
          <Row label="Email">{user?.email}</Row>
          <Row label="ID pengguna">{user?.id}</Row>
          <Row label="Masuk terakhir">{formatDateTime(user?.last_sign_in_at)}</Row>
          <Row label="Hak akses"><span className="inline-flex items-center gap-1"><ShieldCheck size={14} aria-hidden /> Admin (diverifikasi database)</span></Row>
        </dl>
      </Section>

      <Section title="Kata sandi" description={`Gunakan minimal ${MIN_PASSWORD} karakter yang sulit ditebak.`}>
        <form onSubmit={changePassword} noValidate className="max-w-md space-y-8" aria-label="Ubah kata sandi">
          <fieldset disabled={saving} className="space-y-8">
            <Field id="set-password" label="Kata sandi baru" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={touched ? errors.password : undefined} />
            <Field id="set-confirm" label="Ulangi kata sandi baru" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} error={touched ? errors.confirm : undefined} />
          </fieldset>
          {serverError && <p role="alert" className="border border-ink p-4 text-small font-medium">{serverError}</p>}
          <button type="submit" disabled={saving} className="inline-flex h-12 items-center gap-2 border border-ink bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-70">
            {saving && <Loader2 size={14} aria-hidden className="animate-spin" />} {saving ? 'Menyimpan…' : 'Ubah kata sandi'}
          </button>
        </form>
      </Section>

      <Section title="Sesi" description="Akhiri sesi di semua perangkat bila akun pernah dipakai di perangkat yang tidak dipercaya.">
        <button type="button" onClick={() => setGlobalOpen(true)} className="inline-flex h-12 items-center gap-2 border border-ink px-6 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper">
          <LogOut size={14} aria-hidden /> Keluar dari semua perangkat
        </button>
      </Section>

      <Section title="Koneksi" description="Status konfigurasi aplikasi ini. Nilai rahasia tidak pernah ditampilkan.">
        <dl className="border-t border-ink">
          <Row label="Host Supabase">{host}</Row>
          <Row label="Klien Supabase">{status.configured ? 'Terkonfigurasi' : status.issueMessage}</Row>
          <Row label="Sumber data situs publik">{status.dataSource === 'supabase' ? 'Supabase' : 'Data lokal (src/data) — bukan database'}</Row>
        </dl>
        <p className="mt-4 max-w-md text-small text-mute">
          {status.dataSource === 'supabase'
            ? 'Perubahan di dashboard langsung tampil di situs publik pada pemuatan halaman berikutnya.'
            : <>Situs publik masih memakai data lokal. Hapus <code className="font-mono">VITE_DATA_SOURCE=local</code> dan pastikan env Supabase valid agar memakai database.</>}
        </p>
      </Section>

      <ConfirmDialog
        open={globalOpen}
        title="Keluar dari semua perangkat?"
        description="Semua sesi admin, termasuk di perangkat ini, akan diakhiri. Anda perlu masuk kembali."
        confirmLabel="Ya, keluar semua"
        loading={signingOut}
        onConfirm={signOutEverywhere}
        onCancel={() => setGlobalOpen(false)}
      />
    </>
  );
}
