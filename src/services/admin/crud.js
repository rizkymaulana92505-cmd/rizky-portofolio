import { run, sanitizeSearch, table } from './core';

/**
 * Service CRUD generik untuk satu tabel (RLS: hanya admin yang boleh menulis).
 * Dipakai oleh seluruh modul konten sehingga logika query tidak diulang.
 *
 * @param {Object} cfg
 * @param {string} cfg.table                nama tabel
 * @param {string} [cfg.select]             kolom yang dibaca (default semua kecuali kolom generated)
 * @param {Array<{column:string, ascending?:boolean, nullsFirst?:boolean}>} [cfg.orderBy]
 * @param {string[]} [cfg.searchColumns]    kolom teks untuk pencarian (ILIKE)
 */
export function createCrudService({ table: name, select = '*', orderBy = [{ column: 'created_at', ascending: false }], searchColumns = [] }) {
  return {
    name,

    /** Daftar berhalaman. `published`: 'published' | 'draft' | '' · `filters`: { kolom: nilai } */
    async list({ page = 1, pageSize = 10, search = '', filters = {}, published = '' } = {}) {
      let q = table(name).select(select, { count: 'exact' });
      Object.entries(filters).forEach(([col, val]) => {
        if (val !== '' && val != null) q = q.eq(col, val);
      });
      if (published === 'published') q = q.eq('is_published', true);
      if (published === 'draft') q = q.eq('is_published', false);

      const term = sanitizeSearch(search);
      if (term && searchColumns.length) {
        q = q.or(searchColumns.map((c) => `${c}.ilike.%${term}%`).join(','));
      }
      orderBy.forEach((o) => {
        q = q.order(o.column, { ascending: o.ascending ?? true, nullsFirst: o.nullsFirst });
      });
      const safePage = Math.max(1, Math.floor(Number(page)) || 1);
      const safePageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);
      const from = (safePage - 1) * safePageSize;
      const { data, count } = await run(q.range(from, from + safePageSize - 1));
      return { rows: data ?? [], total: count ?? 0 };
    },

    async create(values) {
      const { data } = await run(table(name).insert(values).select(select).single());
      return data;
    },

    async update(id, values) {
      const { data } = await run(table(name).update(values).eq('id', id).select(select).single());
      return data;
    },

    /** Hapus; memastikan ada baris yang benar-benar terhapus (RLS menolak senyap = 0 baris). */
    async remove(id) {
      const { data } = await run(table(name).delete().eq('id', id).select('id'));
      if (!data?.length) {
        const err = new Error('Data tidak ditemukan atau Anda tidak memiliki izin menghapusnya.');
        err.code = 'NOT_DELETED';
        throw err;
      }
    },
  };
}
