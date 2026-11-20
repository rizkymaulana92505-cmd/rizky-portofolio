import {
  Award, Briefcase, FolderKanban, Layers, PenLine, Quote, UserRound,
} from 'lucide-react';
import {
  achievementCategories, certificateCategories, experienceTypes, projectCategories, skillCategories, testimonialTypes,
} from '@/data';
import { createCrudService } from '@/services/admin/crud';
import { truncate } from '@/lib/admin/format';

/**
 * Konfigurasi tiap modul CRUD. Satu definisi → daftar, form, validasi, dan service.
 * Aturan validasi mencerminkan constraint di supabase/migrations (database tetap
 * menjadi penjaga terakhir; pesan error constraint diterjemahkan di services/admin/core.js).
 */

const opts = (list, valueKey = 'key') => list.map((o) => ({ value: o[valueKey], label: o.label }));
const labelOf = (list, key) => list.find((o) => o.key === key)?.label ?? key;
const STAMPS = 'created_at, updated_at';
const SORT = { name: 'sort_order', label: 'Urutan tampil', type: 'number', integer: true, min: 0, defaultValue: 0, hint: 'Angka kecil tampil lebih dulu.' };
const PUBLISHED = { name: 'is_published', label: 'Terbitkan', type: 'switch', hint: 'Draf tidak terlihat oleh pengunjung.' };

/* ── Profil ─────────────────────────────────────────────────────────────── */
const profiles = {
  key: 'profiles', path: 'profil', label: 'Profil', singular: 'profil', icon: UserRound,
  description: 'Profil pemilik portofolio. Hanya satu profil yang boleh berstatus terbit.',
  service: createCrudService({
    table: 'profiles',
    select: `id, full_name, headline, statement, bio, photo_path, photo_alt, school, class_name, major, location, email, social_links, education, interests, career_headline, career_description, career_dream, career_short_term, career_long_term, resume_headline, resume_summary, featured_project_slugs, cv_url, is_published, ${STAMPS}`,
    orderBy: [{ column: 'is_published', ascending: false }, { column: 'created_at', ascending: false }],
    searchColumns: ['full_name', 'headline', 'school'],
  }),
  fields: [
    { type: 'section', name: 's-identitas', label: 'Identitas' },
    { name: 'full_name', label: 'Nama lengkap', type: 'text', required: true, maxLength: 120 },
    { name: 'headline', label: 'Headline', type: 'text', maxLength: 160 },
    { name: 'statement', label: 'Pernyataan singkat', type: 'textarea', rows: 3, maxLength: 400 },
    { name: 'bio', label: 'Bio', type: 'textarea', rows: 5, maxLength: 2000 },
    { type: 'section', name: 's-biodata', label: 'Biodata' },
    { name: 'school', label: 'Sekolah', type: 'text', maxLength: 120 },
    { name: 'class_name', label: 'Kelas', type: 'text', maxLength: 60 },
    { name: 'major', label: 'Jurusan', type: 'text', maxLength: 120 },
    { name: 'location', label: 'Domisili', type: 'text', maxLength: 120 },
    { type: 'section', name: 's-kontak', label: 'Kontak & media' },
    { name: 'email', label: 'Email kontak publik', type: 'email', maxLength: 120, hint: 'Tampil di halaman Kontak. Kosongkan bila tidak ingin dipublikasikan.' },
    {
      name: 'social_links', label: 'Tautan sosial media', type: 'repeater', itemLabel: 'Tautan', addLabel: 'Tambah tautan',
      hint: 'Halaman Kontak mengenali GitHub, Instagram, dan LinkedIn.',
      itemFields: [
        { name: 'id', label: 'Platform', type: 'select', required: true, defaultValue: 'github', options: [{ value: 'github', label: 'GitHub' }, { value: 'instagram', label: 'Instagram' }, { value: 'linkedin', label: 'LinkedIn' }] },
        { name: 'url', label: 'URL profil', type: 'url', required: true, placeholder: 'https://…' },
        { name: 'handle', label: 'Nama tampilan (opsional)', type: 'text', placeholder: '@username' },
      ],
    },
    { name: 'photo_path', label: 'Foto profil', type: 'image', bucket: 'profile', hint: 'Dipakai di Beranda, Tentang Saya, dan CV. Rasio 4:5 paling pas.' },
    { name: 'photo_alt', label: 'Teks alternatif foto', type: 'text', maxLength: 160 },
    { name: 'cv_url', label: 'URL berkas CV', type: 'url', allowRelative: true },
    { type: 'section', name: 's-pendidikan', label: 'Pendidikan & minat' },
    {
      name: 'education', label: 'Riwayat pendidikan', type: 'repeater', itemLabel: 'Pendidikan', addLabel: 'Tambah pendidikan',
      itemFields: [
        { name: 'level', label: 'Jenjang', type: 'text', required: true, placeholder: 'SMK / SMP / …' },
        { name: 'institution', label: 'Institusi', type: 'text', required: true },
        { name: 'program', label: 'Program / jurusan', type: 'text' },
        { name: 'start', label: 'Tahun mulai', type: 'text', placeholder: '2023' },
        { name: 'end', label: 'Tahun selesai', type: 'text', placeholder: '2026' },
        { name: 'note', label: 'Catatan', type: 'textarea', rows: 2 },
      ],
    },
    { name: 'interests', label: 'Minat', type: 'tags' },
    { type: 'section', name: 's-karier', label: 'Tujuan karier & CV' },
    { name: 'career_headline', label: 'Judul tujuan karier', type: 'text', maxLength: 160 },
    { name: 'career_description', label: 'Deskripsi tujuan karier', type: 'textarea', rows: 4, maxLength: 1000 },
    { name: 'career_dream', label: 'Cita-cita / profesi impian', type: 'text', maxLength: 160, placeholder: 'mis. Full-stack Developer', hint: 'Tampil sebagai label singkat di bagian Tujuan & Cita-cita Karier.' },
    { name: 'career_short_term', label: 'Tujuan jangka pendek', type: 'textarea', rows: 3, maxLength: 1000, hint: 'Mis. 1–2 tahun ke depan.' },
    { name: 'career_long_term', label: 'Tujuan jangka panjang', type: 'textarea', rows: 3, maxLength: 1000, hint: 'Mis. 5–10 tahun ke depan.' },
    { name: 'resume_headline', label: 'Headline CV', type: 'text', maxLength: 160 },
    { name: 'resume_summary', label: 'Ringkasan CV', type: 'textarea', rows: 4, maxLength: 1000 },
    { name: 'featured_project_slugs', label: 'Slug proyek unggulan di CV', type: 'tags', hint: 'Isi slug proyek (mis. aplikasi-kasir). Enter / koma untuk menambah.' },
    { type: 'section', name: 's-status', label: 'Status' },
    { ...PUBLISHED, hint: 'Hanya satu profil yang boleh terbit; menerbitkan yang lain akan ditolak database.' },
  ],
  listItem: (r) => ({ title: r.full_name, subtitle: r.headline || r.bio, meta: [r.school, r.location].filter(Boolean).join(' · ') }),
};

/* ── Proyek ─────────────────────────────────────────────────────────────── */
const projects = {
  key: 'projects', path: 'proyek', label: 'Proyek', singular: 'proyek', icon: FolderKanban,
  description: 'Proyek yang tampil di halaman Proyek dan detail proyek.',
  service: createCrudService({
    table: 'projects',
    select: `id, slug, name, category, description, problem, objective, role, technologies, features, images, documentation, feedback, demo_url, github_url, sort_order, is_published, ${STAMPS}`,
    orderBy: [{ column: 'sort_order' }, { column: 'created_at', ascending: false }],
    searchColumns: ['name', 'slug', 'description'],
  }),
  filters: [{ key: 'category', label: 'Kategori', options: opts(projectCategories) }],
  fields: [
    { type: 'section', name: 's-umum', label: 'Informasi utama' },
    { name: 'name', label: 'Nama proyek', type: 'text', required: true, maxLength: 160 },
    { name: 'slug', label: 'Slug (URL)', type: 'slug', required: true, from: 'name', maxLength: 80, hint: 'Alamat: /proyek/slug-ini. Dibuat otomatis dari nama.' },
    { name: 'category', label: 'Kategori', type: 'select', options: opts(projectCategories) },
    { name: 'role', label: 'Peran', type: 'text', maxLength: 160 },
    { name: 'description', label: 'Deskripsi singkat', type: 'textarea', rows: 4, maxLength: 1500 },
    { name: 'problem', label: 'Masalah yang diselesaikan', type: 'textarea', rows: 3, maxLength: 1500 },
    { name: 'objective', label: 'Tujuan', type: 'textarea', rows: 3, maxLength: 1500 },
    { name: 'technologies', label: 'Teknologi', type: 'tags' },
    { name: 'features', label: 'Fitur utama', type: 'lines', rows: 5 },
    { type: 'section', name: 's-tautan', label: 'Tautan' },
    { name: 'demo_url', label: 'URL demo', type: 'url', placeholder: 'https://…' },
    { name: 'github_url', label: 'URL GitHub', type: 'url', placeholder: 'https://github.com/…' },
    { type: 'section', name: 's-gambar', label: 'Gambar' },
    { name: 'cover_src', label: 'Gambar sampul', type: 'image', bucket: 'project' },
    { name: 'cover_alt', label: 'Teks alternatif sampul', type: 'text', maxLength: 160 },
    { name: 'cover_caption', label: 'Keterangan sampul', type: 'text', maxLength: 200 },
    {
      name: 'screenshots', label: 'Tangkapan layar', type: 'repeater', itemLabel: 'Gambar', addLabel: 'Tambah gambar',
      itemFields: [
        { name: 'src', label: 'Gambar', type: 'image', bucket: 'project', required: true },
        { name: 'alt', label: 'Teks alternatif', type: 'text' },
        { name: 'caption', label: 'Keterangan', type: 'text' },
      ],
    },
    { type: 'section', name: 's-dokumentasi', label: 'Dokumentasi & umpan balik' },
    {
      name: 'documentation', label: 'Dokumentasi proses', type: 'repeater', itemLabel: 'Entri', addLabel: 'Tambah entri',
      itemFields: [
        { name: 'title', label: 'Judul', type: 'text', required: true },
        { name: 'date', label: 'Tanggal', type: 'date' },
        { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
        { name: 'image', label: 'Gambar', type: 'image', bucket: 'project' },
      ],
    },
    {
      name: 'feedback', label: 'Umpan balik pengguna', type: 'repeater', itemLabel: 'Umpan balik', addLabel: 'Tambah umpan balik',
      hint: 'Hanya isi umpan balik asli dari orang yang bersangkutan.',
      itemFields: [
        { name: 'name', label: 'Nama', type: 'text', required: true },
        { name: 'role', label: 'Peran', type: 'text' },
        { name: 'message', label: 'Isi', type: 'textarea', rows: 3, required: true },
      ],
    },
    { type: 'section', name: 's-status', label: 'Tampilan' },
    SORT,
    PUBLISHED,
  ],
  // images (jsonb) ↔ field datar cover_* + screenshots
  toForm: (row) => ({
    ...row,
    cover_src: row.images?.cover?.src ?? '',
    cover_alt: row.images?.cover?.alt ?? '',
    cover_caption: row.images?.cover?.caption ?? '',
    screenshots: row.images?.screenshots ?? [],
  }),
  fromForm: ({ cover_src, cover_alt, cover_caption, screenshots, ...rest }) => ({
    ...rest,
    images: {
      cover: cover_src ? { src: cover_src, alt: cover_alt ?? '', caption: cover_caption ?? '' } : null,
      screenshots,
    },
  }),
  listItem: (r) => ({
    title: r.name,
    subtitle: truncate(r.description),
    badges: r.category ? [{ label: labelOf(projectCategories, r.category) }] : [],
    meta: `/${r.slug}`,
  }),
};

/* ── Keahlian ───────────────────────────────────────────────────────────── */
const skills = {
  key: 'skills', path: 'keahlian', label: 'Keahlian', singular: 'keahlian', icon: Layers,
  description: 'Hard skill dan soft skill yang tampil di halaman Keahlian.',
  service: createCrudService({
    table: 'skills',
    select: `id, name, category, group_name, level, sort_order, is_published, ${STAMPS}`,
    orderBy: [{ column: 'category' }, { column: 'group_name' }, { column: 'sort_order' }, { column: 'name' }],
    searchColumns: ['name', 'group_name'],
  }),
  filters: [{ key: 'category', label: 'Jenis', options: opts(skillCategories) }],
  fields: [
    { name: 'name', label: 'Nama keahlian', type: 'text', required: true, maxLength: 80 },
    { name: 'category', label: 'Jenis', type: 'select', required: true, defaultValue: 'hard', options: opts(skillCategories) },
    { name: 'group_name', label: 'Kelompok', type: 'text', required: true, maxLength: 80, hint: 'Mis. Frontend, Backend, Komunikasi.' },
    { name: 'level', label: 'Persentase penguasaan', type: 'number', integer: true, min: 0, max: 100, suffix: '%', hint: 'Isi 0–100. Kosongkan bila belum ingin menampilkan persentase.' },
    SORT,
    PUBLISHED,
  ],
  listItem: (r) => ({
    title: r.name,
    subtitle: r.group_name,
    badges: [{ label: labelOf(skillCategories, r.category) }, ...(r.level != null ? [{ label: `${r.level}%` }] : [])],
  }),
};

/* ── Pengalaman ─────────────────────────────────────────────────────────── */
const experiences = {
  key: 'experiences', path: 'pengalaman', label: 'Pengalaman', singular: 'pengalaman', icon: Briefcase,
  description: 'PLK, organisasi, kepanitiaan, perlombaan, dan pekerjaan.',
  service: createCrudService({
    table: 'experiences',
    select: `id, type, title, role, organization, location, start_date, end_date, description, highlights, sort_order, is_published, ${STAMPS}`,
    orderBy: [{ column: 'start_date', ascending: false, nullsFirst: false }, { column: 'sort_order' }],
    searchColumns: ['title', 'organization', 'role'],
  }),
  filters: [{ key: 'type', label: 'Jenis', options: opts(experienceTypes) }],
  fields: [
    { name: 'type', label: 'Jenis', type: 'select', required: true, defaultValue: 'plk', options: opts(experienceTypes) },
    { name: 'title', label: 'Judul', type: 'text', required: true, maxLength: 160, hint: 'Nama instansi / organisasi / acara / lomba.' },
    { name: 'role', label: 'Peran', type: 'text', maxLength: 160 },
    { name: 'organization', label: 'Penyelenggara / organisasi', type: 'text', maxLength: 160 },
    { name: 'location', label: 'Lokasi', type: 'text', maxLength: 160 },
    { name: 'start_date', label: 'Tanggal mulai', type: 'date' },
    {
      name: 'end_date', label: 'Tanggal selesai', type: 'date', hint: 'Kosongkan bila masih berjalan.',
      validate: (v, vals) => (vals.start_date && v < vals.start_date ? 'Tanggal selesai tidak boleh sebelum tanggal mulai.' : undefined),
    },
    { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4, maxLength: 1500 },
    { name: 'highlights', label: 'Poin penting', type: 'lines', rows: 4 },
    SORT,
    PUBLISHED,
  ],
  listItem: (r) => ({
    title: r.title,
    subtitle: [r.role, r.organization].filter(Boolean).join(' · '),
    badges: [{ label: labelOf(experienceTypes, r.type) }],
    meta: [r.start_date?.slice(0, 7), r.end_date?.slice(0, 7) ?? (r.start_date ? 'sekarang' : null)].filter(Boolean).join(' → '),
  }),
};

/* ── Sertifikat & prestasi ──────────────────────────────────────────────── */
const KINDS = [{ value: 'sertifikat', label: 'Sertifikat' }, { value: 'prestasi', label: 'Prestasi' }];
const certificates = {
  key: 'certificates', path: 'sertifikat', label: 'Sertifikat', singular: 'sertifikat', icon: Award,
  description: 'Sertifikat dan prestasi (jenis “Prestasi” tampil di bagian prestasi).',
  service: createCrudService({
    table: 'certificates',
    select: `id, kind, title, issuer, rank, issued_at, category, description, credential_url, image_path, image_alt, sort_order, is_published, ${STAMPS}`,
    orderBy: [{ column: 'issued_at', ascending: false, nullsFirst: false }, { column: 'sort_order' }],
    searchColumns: ['title', 'issuer'],
  }),
  filters: [{ key: 'kind', label: 'Jenis', options: KINDS }],
  fields: [
    { name: 'kind', label: 'Jenis', type: 'select', required: true, defaultValue: 'sertifikat', options: KINDS },
    { name: 'title', label: 'Judul', type: 'text', required: true, maxLength: 200 },
    { name: 'issuer', label: 'Penerbit / penyelenggara', type: 'text', maxLength: 160 },
    {
      name: 'rank', label: 'Peringkat', type: 'text', maxLength: 80, placeholder: 'Juara 2', showIf: (v) => v.kind === 'prestasi',
    },
    { name: 'issued_at', label: 'Tanggal terbit / diraih', type: 'date' },
    {
      name: 'category', label: 'Kategori', type: 'select',
      optionsFor: (v) => opts(v.kind === 'prestasi' ? achievementCategories : certificateCategories),
    },
    { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3, maxLength: 1000 },
    { name: 'credential_url', label: 'URL kredensial / verifikasi', type: 'url', placeholder: 'https://…' },
    { name: 'image_path', label: 'Gambar sertifikat / prestasi', type: 'image', bucket: 'certificate' },
    { name: 'image_alt', label: 'Teks alternatif gambar', type: 'text', maxLength: 160 },
    SORT,
    PUBLISHED,
  ],
  listItem: (r) => ({
    title: r.title,
    subtitle: [r.issuer, r.rank].filter(Boolean).join(' · '),
    badges: [{ label: r.kind === 'prestasi' ? 'Prestasi' : 'Sertifikat', tone: r.kind === 'prestasi' ? 'solid' : 'outline' }],
    meta: r.issued_at ?? undefined,
  }),
};

/* ── Testimoni ──────────────────────────────────────────────────────────── */
const testimonials = {
  key: 'testimonials', path: 'testimoni', label: 'Testimoni', singular: 'testimoni', icon: Quote,
  description: 'Hanya masukkan testimoni asli yang sudah disetujui pemberinya. Kiriman pengunjung masuk sebagai draf — periksa lalu terbitkan.',
  service: createCrudService({
    table: 'testimonials',
    select: `id, type, name, role, organization, message, photo_path, sort_order, is_published, ${STAMPS}`,
    orderBy: [{ column: 'type' }, { column: 'sort_order' }, { column: 'created_at', ascending: false }],
    searchColumns: ['name', 'organization', 'message'],
  }),
  filters: [{ key: 'type', label: 'Jenis', options: opts(testimonialTypes) }],
  fields: [
    { name: 'type', label: 'Jenis', type: 'select', required: true, defaultValue: 'teman', options: opts(testimonialTypes) },
    { name: 'name', label: 'Nama pemberi testimoni', type: 'text', required: true, maxLength: 120 },
    { name: 'role', label: 'Peran / jabatan', type: 'text', maxLength: 120 },
    { name: 'organization', label: 'Instansi / organisasi', type: 'text', maxLength: 120 },
    { name: 'message', label: 'Isi testimoni', type: 'textarea', required: true, rows: 5, maxLength: 2000 },
    { name: 'photo_path', label: 'Foto pemberi testimoni (opsional)', type: 'image', bucket: 'testimonial' },
    SORT,
    { ...PUBLISHED, hint: 'Kiriman pengunjung masuk sebagai draf. Terbitkan hanya setelah isinya diverifikasi.' },
  ],
  listItem: (r) => ({
    title: r.name,
    subtitle: truncate(r.message),
    badges: [{ label: labelOf(testimonialTypes, r.type) }],
    meta: [r.role, r.organization].filter(Boolean).join(' · '),
  }),
};

/* ── Blog ───────────────────────────────────────────────────────────────── */
const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraf' },
  { value: 'heading', label: 'Judul bagian' },
  { value: 'list', label: 'Daftar (satu item per baris)' },
  { value: 'code', label: 'Kode' },
  { value: 'quote', label: 'Kutipan' },
];
const blog = {
  key: 'blog', path: 'blog', label: 'Blog', singular: 'artikel', icon: PenLine,
  description: 'Artikel blog. Tanggal terbit di masa depan = terjadwal (belum tampil).',
  service: createCrudService({
    table: 'blog',
    select: `id, slug, title, category, excerpt, cover_path, cover_alt, content, published_at, is_published, ${STAMPS}`,
    orderBy: [{ column: 'published_at', ascending: false, nullsFirst: false }, { column: 'created_at', ascending: false }],
    searchColumns: ['title', 'slug', 'excerpt'],
  }),
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true, maxLength: 200 },
    { name: 'slug', label: 'Slug (URL)', type: 'slug', required: true, from: 'title', maxLength: 80, hint: 'Alamat: /blog/slug-ini. Dibuat otomatis dari judul.' },
    { name: 'category', label: 'Kategori', type: 'text', maxLength: 60, placeholder: 'React, CSS, …' },
    { name: 'excerpt', label: 'Ringkasan', type: 'textarea', rows: 3, maxLength: 400 },
    { name: 'cover_path', label: 'Gambar sampul', type: 'image', bucket: 'blog' },
    { name: 'cover_alt', label: 'Teks alternatif sampul', type: 'text', maxLength: 160 },
    {
      name: 'content', label: 'Isi artikel', type: 'repeater', itemLabel: 'Blok', addLabel: 'Tambah blok',
      hint: 'Susun artikel dari blok. Urutkan dengan tombol panah.',
      itemFields: [
        { name: 'type', label: 'Jenis blok', type: 'select', required: true, defaultValue: 'paragraph', options: BLOCK_TYPES },
        { name: 'language', label: 'Bahasa kode', type: 'text', placeholder: 'jsx', showIf: (it) => it.type === 'code' },
        { name: 'text', label: 'Isi', type: 'textarea', rows: 5, required: true, width: 'full' },
      ],
    },
    { name: 'published_at', label: 'Tanggal terbit', type: 'date', hint: 'Kosong = tampil segera setelah diterbitkan.' },
    PUBLISHED,
  ],
  // content: blok {type,text|items|code} ↔ baris datar {type,text,language}
  toForm: (row) => ({
    ...row,
    content: (row.content ?? []).map((b) => ({
      type: b.type,
      language: b.language ?? '',
      text: b.type === 'list' ? (b.items ?? []).join('\n') : b.type === 'code' ? b.code ?? '' : b.text ?? '',
    })),
  }),
  fromForm: (row) => ({
    ...row,
    content: row.content.map((b) => {
      if (b.type === 'list') return { type: 'list', items: b.text.split('\n').map((s) => s.trim()).filter(Boolean) };
      if (b.type === 'code') return { type: 'code', language: b.language ?? '', code: b.text };
      return { type: b.type, text: b.text };
    }),
  }),
  listItem: (r) => ({
    title: r.title,
    subtitle: truncate(r.excerpt),
    badges: r.category ? [{ label: r.category }] : [],
    meta: r.published_at ? `Terbit ${r.published_at}` : 'Tanpa tanggal',
  }),
};

export const resources = [profiles, projects, skills, experiences, certificates, testimonials, blog];
export const resourceByKey = Object.fromEntries(resources.map((r) => [r.key, r]));
