import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSupabaseStatus } from '@/hooks/useSupabaseStatus';
import { socialLinksAdmin } from '@/services/admin/socialLinks';
import { adminNav } from '../config/nav';
import { useAdminTitle } from '../hooks/useAdminTitle';
import AdminPageHeader from '../components/PageHeader';
import ResourceForm from '../components/ResourceForm';
import { useToast } from '../components/Toast';

const FIELDS = [
  { type: 'section', name: 'section-contact', label: 'Kanal yang tampil di website' },
  {
    name: 'email',
    label: 'Email publik',
    type: 'email',
    maxLength: 160,
    hint: 'Dipakai di halaman Kontak dan kartu CV. Kosongkan jika belum ingin ditampilkan.',
    placeholder: 'nama@domain.com',
  },
  {
    name: 'social_links',
    label: 'Tautan media sosial',
    type: 'repeater',
    itemLabel: 'Tautan',
    addLabel: 'Tambah tautan',
    hint: 'Isi URL lengkap, misalnya https://github.com/nama atau https://instagram.com/nama. Satu baris untuk satu platform.',
    itemFields: [
      {
        name: 'id',
        label: 'Platform',
        type: 'select',
        required: true,
        options: [
          { value: 'github', label: 'GitHub' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'linkedin', label: 'LinkedIn' },
        ],
      },
      {
        name: 'url',
        label: 'URL tautan',
        type: 'url',
        required: true,
        maxLength: 300,
        placeholder: 'https://github.com/nama',
        hint: 'Harus diawali http:// atau https://',
      },
      {
        name: 'handle',
        label: 'Nama tampil',
        type: 'text',
        maxLength: 80,
        placeholder: '@nama',
        hint: 'Opsional. Jika kosong, domain URL yang ditampilkan.',
      },
    ],
    validate: (links) => {
      const ids = (links ?? []).map((link) => link.id).filter(Boolean);
      return new Set(ids).size === ids.length
        ? undefined
        : 'Platform tidak boleh duplikat. Gunakan satu baris untuk GitHub, satu baris untuk Instagram, dan seterusnya.';
    },
  },
];

export default function SocialLinksPage() {
  useAdminTitle('Tautan Sosial');
  const toast = useToast();
  const status = useSupabaseStatus();
  const index = adminNav.find((n) => n.key === 'tautan')?.index;
  const { data, loading, error, reload } = useAsyncData(() => socialLinksAdmin.list({ pageSize: 20 }), []);
  const [profile, setProfile] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!data) return;
    setProfile(data.rows.find((row) => row.is_published) ?? data.rows[0] ?? null);
  }, [data]);

  const header = (
    <AdminPageHeader
      index={index}
      title="Tautan Sosial"
      description="Kelola email, GitHub, Instagram, dan LinkedIn yang muncul di halaman Kontak serta CV. Data disimpan di profil yang sama dengan menu Profil."
    />
  );

  if (loading) {
    return <>{header}<p className="label mt-10">Memuat tautan…</p></>;
  }

  if (error) {
    return (
      <>
        {header}
        <div role="alert" className="mt-10 flex flex-wrap items-start gap-3 border border-ink p-5 text-small">
          <AlertCircle size={18} aria-hidden className="mt-0.5 shrink-0" />
          <p className="flex-1">{error.message || 'Tautan belum dapat dimuat.'}</p>
          <button type="button" onClick={reload} className="border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] hover:bg-ink hover:text-paper">Coba lagi</button>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        {header}
        <div className="mt-10 max-w-xl border border-line-strong p-8">
          <p className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">Belum ada profil</p>
          <p className="mt-4 text-small text-ink-soft">Buat dan terbitkan satu profil di menu Profil terlebih dahulu, lalu kembali ke halaman ini untuk mengisi tautan.</p>
          <Link to="/admin/profil" className="mt-6 inline-flex h-11 items-center border border-ink bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft">Buka halaman Profil</Link>
        </div>
      </>
    );
  }

  const save = async (values) => {
    const saved = await socialLinksAdmin.update(profile.id, {
      email: values.email || null,
      social_links: values.social_links,
    });
    setProfile(saved);
    toast.success('Tautan sosial berhasil disimpan. Muat ulang halaman publik untuk melihat perubahan.');
  };

  return (
    <>
      {header}

      {status.dataSource !== 'supabase' && (
        <p role="status" className="mt-8 flex items-start gap-2 border border-line-strong bg-fog p-4 text-small">
          <AlertCircle size={16} aria-hidden className="mt-0.5 shrink-0" />
          Situs publik masih memakai data lokal. Tautan tetap tersimpan di Supabase, tetapi belum tampil di publik sampai <code className="font-mono">VITE_DATA_SOURCE=local</code> dihapus dari environment.
        </p>
      )}

      {!profile.is_published && (
        <p role="status" className="mt-8 flex flex-wrap items-center gap-2 border border-line-strong bg-fog p-4 text-small">
          <AlertCircle size={16} aria-hidden className="shrink-0" />
          Profil ini masih berstatus draf, sehingga tautannya belum tampil di situs publik.
          <Link to="/admin/profil" className="font-mono text-[11px] uppercase tracking-[0.12em] underline underline-offset-4">Buka menu Profil</Link>
        </p>
      )}

      <div className="mt-10 max-w-3xl">
        <ResourceForm
          key={`${profile.id}-${formKey}`}
          fields={FIELDS}
          initialRow={profile}
          mode="edit"
          onSubmit={save}
          onCancel={() => setFormKey((n) => n + 1)}
        />
      </div>
    </>
  );
}
