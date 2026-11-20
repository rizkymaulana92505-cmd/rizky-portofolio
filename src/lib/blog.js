const WORDS_PER_MINUTE = 200;

const wordCount = (text) => (text ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Estimasi menit baca dari blok konten (kode dihitung setengah). Minimal 1. */
export function readingMinutes(post) {
  const words = (post.content ?? []).reduce((sum, b) => {
    if (b.type === 'list') return sum + (b.items ?? []).reduce((s, i) => s + wordCount(i), 0);
    if (b.type === 'code') return sum + wordCount(b.code) / 2;
    return sum + wordCount(b.text);
  }, 0);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export const readingLabel = (post) => `${readingMinutes(post)} menit baca`;

/** Terbaru dulu; tanpa tanggal di bawah (urutan asli dipertahankan). */
export const sortPosts = (list) =>
  [...list].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

export const collectPostCategories = (list) => [...new Set(list.map((p) => p.category))];
