/** Error Supabase/jaringan → pesan ramah untuk pengunjung (Bahasa Indonesia). */
export function describePublicError(error) {
  const raw = String(error?.message ?? '');
  const code = error?.code;
  if (code === 'SUPABASE_NOT_CONFIGURED') return 'Layanan data belum dikonfigurasi.';
  if (/failed to fetch|networkerror|load failed|network request failed|fetch/i.test(raw) && !code) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.';
  }
  if (code === '42501' || code === 'PGRST301') return 'Permintaan ditolak oleh server.';
  if (code === '23514') return 'Isian tidak memenuhi aturan server. Periksa kembali isian kamu.';
  if (code === '23505') return 'Data tersebut sudah ada.';
  return 'Terjadi kesalahan pada server. Coba lagi beberapa saat lagi.';
}
