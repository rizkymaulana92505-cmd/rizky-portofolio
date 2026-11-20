import { table } from '@/services/supabase/core';

/** Dikirim ke window saat server menolak token (kedaluwarsa/dicabut). Didengar AuthProvider. */
export const AUTH_EXPIRED_EVENT = 'admin:auth-expired';

export class AdminServiceError extends Error {
  constructor(message, { code, field, cause } = {}) {
    super(message);
    this.name = 'AdminServiceError';
    this.code = code;
    this.field = field;
    this.cause = cause;
  }
}

// Nama constraint database (supabase/migrations) → pesan ramah.
const CONSTRAINTS = {
  projects_slug_key: { field: 'slug', message: 'Slug sudah dipakai proyek lain. Gunakan slug yang berbeda.' },
  blog_slug_key: { field: 'slug', message: 'Slug sudah dipakai artikel lain. Gunakan slug yang berbeda.' },
  skills_unique: { field: 'name', message: 'Keahlian dengan nama dan kategori yang sama sudah ada.' },
  profiles_single_published_idx: {
    field: 'is_published',
    message: 'Hanya satu profil yang boleh berstatus terbit. Jadikan profil terbit lainnya sebagai draf terlebih dahulu.',
  },
  projects_slug_format: { field: 'slug', message: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.' },
  blog_slug_format: { field: 'slug', message: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.' },
  experiences_date_order: { field: 'end_date', message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' },
  skills_level_range: { field: 'level', message: 'Level harus antara 0 dan 100.' },
  testimonials_type_valid: { field: 'type', message: 'Jenis testimoni tidak dikenal.' },
  testimonials_name_len: { field: 'name', message: 'Nama harus antara 1 dan 120 karakter.' },
  testimonials_role_len: { field: 'role', message: 'Peran maksimal 120 karakter.' },
  testimonials_organization_len: { field: 'organization', message: 'Instansi maksimal 120 karakter.' },
  testimonials_message_len: { field: 'message', message: 'Isi testimoni maksimal 2000 karakter.' },
};

const NETWORK_RE = /failed to fetch|networkerror|load failed|network request failed/i;

/** Ubah error Supabase/PostgREST menjadi pesan Bahasa Indonesia. */
export function describeError(error, status) {
  const raw = error?.message ?? '';
  const code = error?.code;

  if (code === 'PGRST301' || status === 401 || /jwt (expired|invalid)|invalid jwt/i.test(raw)) {
    return { code: 'AUTH_EXPIRED', authExpired: true, message: 'Sesi berakhir. Silakan masuk kembali.' };
  }
  if (NETWORK_RE.test(raw)) {
    return { code: 'NETWORK', message: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.' };
  }
  if (code === '42501' || status === 403) {
    return { code: '42501', message: 'Akses ditolak. Akun ini tidak memiliki izin untuk operasi tersebut.' };
  }
  const constraint = raw.match(/constraint "([^"]+)"/)?.[1] ?? raw.match(/unique index "([^"]+)"/)?.[1];
  if (code === '23505' || code === '23514') {
    const known = CONSTRAINTS[constraint];
    if (known) return { code, ...known };
    return {
      code,
      message:
        code === '23505'
          ? 'Data duplikat: nilai tersebut sudah ada.'
          : `Data tidak memenuhi aturan database${constraint ? ` (${constraint})` : ''}.`,
    };
  }
  if (code === '23503') return { code, message: 'Data masih dipakai oleh data lain sehingga tidak bisa diubah/dihapus.' };
  if (code === '23502') return { code, message: 'Ada isian wajib yang belum diisi.' };
  if (code === '22P02' || code === '22007') return { code, message: 'Format salah satu isian tidak valid.' };
  return { code, message: raw || 'Terjadi kesalahan tak terduga.' };
}

/**
 * Jalankan query supabase-js, kembalikan respons penuh ({ data, count }) atau lempar AdminServiceError.
 * Menyiarkan AUTH_EXPIRED_EVENT bila token ditolak server.
 */
export async function run(query) {
  let res;
  try {
    res = await query;
  } catch (e) {
    throw new AdminServiceError(describeError(e).message, { code: 'NETWORK', cause: e });
  }
  if (res.error) {
    const d = describeError(res.error, res.status);
    if (d.authExpired && typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new AdminServiceError(d.message, { code: d.code, field: d.field, cause: res.error });
  }
  return res;
}

export { table };

/** Hilangkan karakter yang punya arti khusus di filter PostgREST / pola LIKE. */
export const sanitizeSearch = (term) => (term ?? '').replace(/[%_*\\,()"]/g, ' ').replace(/\s+/g, ' ').trim();
