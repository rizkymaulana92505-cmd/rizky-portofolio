import { contact as localContact, profile as localProfile, resume as localResume, site as localSite } from '@/data';
import { BUCKETS, resolveImageUrl, safeUrl, shared, table, unwrap } from './core';

const COLUMNS =
  'id, full_name, headline, statement, bio, photo_path, photo_alt, school, class_name, major, location, email, ' +
  'social_links, education, interests, career_headline, career_description, career_dream, career_short_term, career_long_term, resume_headline, resume_summary, ' +
  'featured_project_slugs, cv_url';

/** Profil terbit (maks. satu baris) atau null bila belum ada. */
export function fetchPublishedProfile() {
  return shared('profile', async () =>
    unwrap(await table('profiles').select(COLUMNS).eq('is_published', true).maybeSingle()),
  );
}

/** Keahlian teknis terbit dengan level tertinggi — sumber "Keahlian Utama" dan pita teks di Beranda. */
function fetchTopSkills(limit = 8) {
  return shared(`top-skills-${limit}`, async () =>
    unwrap(
      await table('skills')
        .select('id, name, group_name, level')
        .eq('is_published', true)
        .eq('category', 'hard')
        .order('level', { ascending: false, nullsFirst: false })
        .order('sort_order')
        .limit(limit),
    ),
  );
}

/** Bentuk sama dengan src/data/site.js. Field kosong memakai nilai lokal. */
export function mapSite(row) {
  if (!row) return localSite;
  return {
    name: row.full_name,
    shortName: row.full_name.replace(/^M\.\s*/i, ''),
    school: row.school ?? localSite.school,
    className: row.class_name ?? localSite.className,
    location: row.location ?? localSite.location,
  };
}

/** Bentuk sama dengan src/data/about.js. */
export function mapAbout(row, localAbout) {
  if (!row) return localAbout;
  return {
    biodata: [
      { id: 'nama', label: 'Nama Lengkap', value: row.full_name },
      { id: 'sekolah', label: 'Sekolah', value: row.school },
      { id: 'kelas', label: 'Kelas', value: row.class_name },
      { id: 'jurusan', label: 'Jurusan', value: row.major },
      { id: 'domisili', label: 'Domisili', value: row.location },
    ],
    bio: row.bio ?? localAbout.bio ?? null,
    education: row.education?.length
      ? row.education.map((e, i) => ({ id: e.id ?? `edu-${i + 1}`, ...e, placeholder: false }))
      : localAbout.education,
    interests: row.interests?.length
      ? row.interests.map((name, i) => ({ id: `minat-${i + 1}`, name }))
      : localAbout.interests,
    careerGoals: {
      headline: row.career_headline,
      description: row.career_description,
      dream: row.career_dream ?? null,
      shortTerm: row.career_short_term ?? null,
      longTerm: row.career_long_term ?? null,
    },
  };
}

/** Bentuk sama dengan src/data/contact.js (kanal tetap: GitHub, Instagram, LinkedIn). */
export function mapContact(row) {
  if (!row) return localContact;
  const links = Array.isArray(row.social_links) ? row.social_links : [];
  const known = localContact.channels.map((c) => {
    const found = links.find((l) => l.id === c.id);
    return { ...c, url: safeUrl(found?.url), handle: found?.handle ?? null };
  });
  const extra = links
    .filter((l) => !localContact.channels.some((c) => c.id === l.id) && safeUrl(l.url))
    .map((l) => ({ id: l.id, label: l.label ?? l.id, url: safeUrl(l.url), handle: l.handle ?? null, hint: '' }));
  const channels = [...known, ...extra];

  return {
    location: row.location ?? localContact.location,
    email: row.email,
    channels,
    socials: channels.filter((c) => c.url).map(({ id, label, url }) => ({ id, label, url })),
  };
}

/**
 * Bentuk sama dengan src/data/resume.js. Tanpa profil terbit → data lokal.
 * Profil ada tetapi `cv_url` kosong → memakai berkas CV lokal yang sudah disiapkan.
 */
export function mapResume(row) {
  if (!row) return localResume;
  return {
    headline: row.resume_headline,
    summary: row.resume_summary ?? row.bio ?? localResume.summary,
    cvFile: row.cv_url
      ? { url: row.cv_url, fileName: `CV-${row.full_name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')}.pdf`, placeholder: false }
      : localResume.cvFile,
    featuredProjectSlugs: row.featured_project_slugs ?? [],
  };
}

/**
 * Bentuk sama dengan src/data/profile.js (Beranda, Tentang, CV). Semua nilai berasal dari database:
 * foto/pernyataan dari profil terbit; "Keahlian Utama" dan pita teks diturunkan dari tabel skills.
 * Tanpa profil terbit → pernyataan & foto lokal (kosong/naskah awal), keahlian tetap dari database.
 */
export function mapProfile(row, skills = []) {
  const top = skills.slice(0, 4).map((k) => ({
    id: k.id,
    name: k.name,
    label: k.group_name,
    note: k.level != null ? `Penguasaan ${k.level}%` : '',
  }));
  const ticker = [...new Set(['Portofolio Digital', row?.major, ...skills.map((k) => k.name), row?.location].filter(Boolean))];
  return {
    // Foto dari database (Storage); bila belum diunggah, pakai foto lokal (public/images/rizky.jpg).
    photo: row?.photo_path ? resolveImageUrl(BUCKETS.profile, row.photo_path) : localProfile.photo,
    photoAlt: row?.photo_alt || localProfile.photoAlt,
    headline: row?.headline ?? null,
    statement: row?.statement ?? localProfile.statement,
    focusSkills: top,
    ticker,
  };
}

/** Foto profil sebagai URL publik (belum dipakai halaman; disiapkan untuk Beranda/CV). */
export const mapProfilePhoto = (row) =>
  row ? { src: resolveImageUrl(BUCKETS.profile, row.photo_path), alt: row.photo_alt } : null;

export const getSite = async () => mapSite(await fetchPublishedProfile());
export const getAbout = async (localAbout) => mapAbout(await fetchPublishedProfile(), localAbout);
export const getContact = async () => mapContact(await fetchPublishedProfile());
export const getResume = async () => mapResume(await fetchPublishedProfile());
export const getProfile = async () => {
  const [row, skills] = await Promise.all([fetchPublishedProfile(), fetchTopSkills()]);
  return mapProfile(row, skills);
};
