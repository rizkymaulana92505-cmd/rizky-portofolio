import { createCrudService } from './crud';

const COLUMNS = 'id, full_name, email, social_links, is_published, created_at, updated_at';

/** Profil dipakai bersama halaman Profil; di sini hanya untuk mengelola kanal kontak publik. */
export const socialLinksAdmin = createCrudService({
  table: 'profiles',
  select: COLUMNS,
  orderBy: [
    { column: 'is_published', ascending: false, nullsFirst: false },
    { column: 'created_at', ascending: false },
  ],
});
