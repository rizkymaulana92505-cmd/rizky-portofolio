/**
 * Data halaman /keahlian.
 *
 * `level` = persentase 0–100. Nilai `null` berarti BELUM DIISI: halaman menampilkan
 * bar/lingkaran putus-putus dan "—". Isi angka sesuai penilaian jujur kamu sendiri,
 * visualisasi akan terisi otomatis. Tidak ada nilai bawaan yang dikarang.
 *
 * @typedef {Object} Skill
 * @property {string} id
 * @property {string} name
 * @property {'hard'|'soft'} category
 * @property {string} group          // pengelompokan tampilan
 * @property {number|null} level     // 0–100 atau null
 */

/** @type {{ key: 'hard'|'soft', label: string }[]} */
export const skillCategories = [
  { key: 'hard', label: 'Hard Skills' },
  { key: 'soft', label: 'Soft Skills' },
];

/** @type {Skill[]} */
export const skills = [
  { id: 'html', name: 'HTML', category: 'hard', group: 'Frontend', level: 80 },
  { id: 'css', name: 'CSS', category: 'hard', group: 'Frontend', level: 70 },
  { id: 'javascript', name: 'JavaScript', category: 'hard', group: 'Frontend', level: 65 },
  { id: 'react', name: 'React JS', category: 'hard', group: 'Frontend', level: null },
  { id: 'php', name: 'PHP', category: 'hard', group: 'Backend', level: null },
  { id: 'laravel', name: 'Laravel', category: 'hard', group: 'Backend', level: null },
  { id: 'mysql', name: 'MySQL', category: 'hard', group: 'Database', level: null },
  { id: 'git-github', name: 'Git & GitHub', category: 'hard', group: 'Tools', level: null },
  { id: 'ui-ux', name: 'UI/UX Design', category: 'hard', group: 'Desain', level: null },

  { id: 'komunikasi', name: 'Komunikasi', category: 'soft', group: 'Soft Skills', level: null },
  { id: 'kerja-sama-tim', name: 'Kerja Sama Tim', category: 'soft', group: 'Soft Skills', level: null },
  { id: 'problem-solving', name: 'Problem Solving', category: 'soft', group: 'Soft Skills', level: null },
  { id: 'manajemen-waktu', name: 'Manajemen Waktu', category: 'soft', group: 'Soft Skills', level: null },
  { id: 'adaptabilitas', name: 'Adaptabilitas', category: 'soft', group: 'Soft Skills', level: null },
];
