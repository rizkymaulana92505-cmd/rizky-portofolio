import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State daftar berhalaman: halaman, pencarian (debounce), filter, status terbit.
 * Menjaga agar respons lama tidak menimpa respons terbaru, dan mundur satu halaman
 * bila halaman aktif jadi kosong (mis. setelah menghapus baris terakhir).
 */
export function useResourceList(service, { pageSize = 10 } = {}) {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [published, setPublished] = useState('');
  const seq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((prev) => {
        if (prev !== searchInput) setPage(1);
        return searchInput;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await service.list({ page, pageSize, search, filters, published });
      if (id !== seq.current) return;
      if (result.rows.length === 0 && result.total > 0 && page > 1) {
        const target = Math.min(page, Math.max(1, Math.ceil(result.total / pageSize)));
        if (target !== page) {
          setPage(target);
          return;
        }
      }
      setData(result);
      setLoading(false);
    } catch (e) {
      if (id !== seq.current) return;
      setError(e.message || 'Data gagal dimuat.');
      setLoading(false);
    }
  }, [service, page, pageSize, search, filters, published]);

  useEffect(() => { load(); }, [load]);

  return {
    ...data, loading, error, page, pageSize, reload: load,
    setPage,
    searchInput, setSearchInput,
    filters,
    setFilter: (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); },
    published,
    setPublished: (v) => { setPublished(v); setPage(1); },
    hasFilters: Boolean(search || published || Object.values(filters).some(Boolean)),
    reset: () => { setSearchInput(''); setSearch(''); setFilters({}); setPublished(''); setPage(1); },
  };
}
