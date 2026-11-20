/**
 * Lapisan data. Seluruh halaman mengambil data lewat fungsi di sini,
 * bukan mengimpor file data atau memanggil Supabase langsung.
 *
 * Sumber data dipilih sekali, saat aplikasi dimuat:
 *   • 'supabase' (default bila env valid) → repository di src/services/supabase/*
 *     Aktif bila VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY valid dan VITE_DATA_SOURCE bukan 'local'.
 *   • 'local'    → src/data/* — tanpa jaringan. Dipakai bila Supabase belum dikonfigurasi
 *     atau VITE_DATA_SOURCE=local (mis. pengembangan UI tanpa backend).
 *
 * Bentuk data yang dikembalikan kedua sumber SAMA, sehingga halaman tidak berubah.
 * Mode 'supabase' mengembalikan apa adanya isi database — termasuk daftar kosong
 * bila belum ada konten terbit (tidak ada data bawaan/placeholder).
 * Untuk data singleton (site/about/contact/resume/profile), profil yang belum terbit
 * jatuh kembali ke data lokal (nama & sekolah yang sudah dikonfirmasi pemilik; sisanya kosong).
 */
import {
  site, profile, about, skills, projects, experiences, certificates, achievements,
  testimonials, posts, resume, contact, demoMessages,
} from '@/data';
import { usesSupabaseData } from '@/lib/supabaseConfig';
import { createMessageRecord } from '@/lib/messages';

const resolve = (value) => Promise.resolve(value);

/** Pilih fungsi lokal atau remote sesuai sumber data aktif. */
const source = (local, remoteFn) => (usesSupabaseData ? remoteFn : local);

/**
 * Repository Supabase dimuat secara lazy (dynamic import) agar supabase-js tidak
 * ikut ke bundle halaman saat sumber data 'local'.
 * remote(m => m.projects.getProjects) → fungsi yang meneruskan argumen ke repository.
 */
const remoteModule = () => import('@/services/supabase');
const remote = (pick) => async (...args) => pick(await remoteModule())(...args);

export const getSite = source(() => resolve(site), remote((m) => m.profiles.getSite));
export const getProfile = source(() => resolve(profile), remote((m) => m.profiles.getProfile));
export const getAbout = source(() => resolve(about), () => remote((m) => m.profiles.getAbout)(about));
export const getContact = source(() => resolve(contact), remote((m) => m.profiles.getContact));
export const getResume = source(() => resolve(resume), remote((m) => m.profiles.getResume));

export const getSkills = source(() => resolve(skills), remote((m) => m.skills.getSkills));
export const getProjects = source(() => resolve(projects), remote((m) => m.projects.getProjects));
export const getProjectBySlug = source(
  (slug) => resolve(projects.find((p) => p.slug === slug) ?? null),
  remote((m) => m.projects.getProjectBySlug),
);
export const getExperiences = source(() => resolve(experiences), remote((m) => m.experiences.getExperiences));
export const getCertificates = source(() => resolve(certificates), remote((m) => m.certificates.getCertificates));
export const getAchievements = source(() => resolve(achievements), remote((m) => m.certificates.getAchievements));
export const getTestimonials = source(() => resolve(testimonials), remote((m) => m.testimonials.getTestimonials));
export const submitTestimonial = source(
  async () => ({ simulated: true }),
  remote((m) => m.testimonials.submitTestimonial),
);
export const getPosts = source(() => resolve(posts), remote((m) => m.blog.getPosts));
export const getPostBySlug = source(
  (slug) => resolve(posts.find((p) => p.slug === slug) ?? null),
  remote((m) => m.blog.getPostBySlug),
);

/* ── Kesan & pesan ────────────────────────────────────────────────────────────
 * Lokal: SIMULASI — tanpa jaringan, tidak ada yang tersimpan (data demo + pesan lokal).
 * Supabase: pesan baru di-INSERT ke tabel `messages` (status 'new'). Pengunjung tidak dapat
 * membaca pesan siapa pun, jadi `getMessages` hanya berisi data demo di mode lokal dan kosong
 * di mode Supabase; antarmuka menampilkan pesan yang dikirim pengunjung itu sendiri di sesi ini.
 *
 * `simulated` dibaca antarmuka untuk menentukan teks sukses yang jujur.
 */
const SIMULATED_LATENCY_MS = 900;

export const getMessages = source(() => resolve(demoMessages), () => resolve([]));

/**
 * @param {{ name: string, email: string, category: string, subject: string, message: string }} draft
 * @returns {Promise<{ simulated: boolean, message: import('@/data/messages').GuestMessage|null }>}
 */
export const submitMessage = source(
  async (draft) => {
    await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));
    return { simulated: true, message: createMessageRecord(draft) };
  },
  remote((m) => m.messages.insertMessage),
);
