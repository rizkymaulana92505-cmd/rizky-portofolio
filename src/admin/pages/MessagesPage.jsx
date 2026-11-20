import { useEffect, useRef, useState } from 'react';
import { Archive, Eye, EyeOff, Mail, Trash2 } from 'lucide-react';
import { messageCategories } from '@/data';
import { messagesAdmin } from '@/services/admin/messages';
import { formatDateTime } from '@/lib/admin/format';
import { adminNav } from '../config/nav';
import { useResourceList } from '../hooks/useResourceList';
import { useAdminTitle } from '../hooks/useAdminTitle';
import AdminPageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import Drawer from '../components/Drawer';
import IconButton from '../components/IconButton';
import ListToolbar from '../components/ListToolbar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, ListSkeleton } from '../components/States';
import { useToast } from '../components/Toast';
import { statusLabel, statusTone } from './OverviewPage';

const catLabel = (k) => messageCategories.find((c) => c.key === k)?.label ?? k;
const FILTERS = [
  { key: 'status', label: 'Status', options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })) },
  { key: 'category', label: 'Kategori', options: messageCategories.map((c) => ({ value: c.key, label: c.label })) },
];

/** Kotak masuk: baca detail, ubah status (baru / dibaca / diarsipkan), balas lewat email, hapus. */
export default function MessagesPage() {
  useAdminTitle('Pesan masuk');
  const index = adminNav.find((n) => n.key === 'pesan')?.index;
  const toast = useToast();
  const list = useResourceList(messagesAdmin, { pageSize: 10 });
  const [open, setOpen] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const autoRead = useRef(new Set()); // id yang sudah dicoba ditandai dibaca otomatis (tidak diulang)

  const act = async (fn, okMessage) => {
    setBusy(true);
    try {
      const updated = await fn();
      if (okMessage) toast.success(okMessage);
      // Perbarui panel detail hanya bila pesan yang sama sedang dibuka.
      if (updated) setOpen((cur) => (cur && cur.id === updated.id ? updated : cur));
      list.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (m, status, text) => {
    if (status === 'new') autoRead.current.delete(m.id);
    return act(() => messagesAdmin.setStatus(m.id, status), text);
  };

  // Membuka pesan baru = membacanya. Tanpa toast; admin bisa mengembalikannya ke "Baru".
  useEffect(() => {
    if (!open || open.status !== 'new' || autoRead.current.has(open.id)) return;
    autoRead.current.add(open.id);
    messagesAdmin.setStatus(open.id, 'read')
      .then((updated) => { setOpen((cur) => (cur && cur.id === updated.id ? updated : cur)); list.reload(); })
      .catch(() => { /* gagal senyap: status tetap Baru, admin dapat mengubahnya manual */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.id]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await messagesAdmin.remove(deleting.id);
      toast.success('Pesan berhasil dihapus.');
      setDeleting(null);
      setOpen(null);
      list.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const offset = (list.page - 1) * list.pageSize;
  const actionBtn = 'inline-flex h-11 items-center gap-2 border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors disabled:opacity-50';

  return (
    <>
      <AdminPageHeader index={index} title="Pesan masuk" description="Kesan dan pesan dari formulir kontak. Hanya admin yang dapat membaca pesan; email pengirim tidak pernah tampil di halaman publik." />

      <div className="mt-8">
        <ListToolbar list={list} searchLabel="Cari nama, email, subjek, atau isi…" filters={FILTERS} />
        <p className="label mt-4 tabular-nums text-ink" aria-live="polite">{list.loading ? 'Memuat…' : `${list.total} pesan${list.hasFilters ? ' (terfilter)' : ''}`}</p>
      </div>

      <div className="mt-4">
        {list.error ? <ErrorState message={list.error} onRetry={list.reload} />
          : list.loading && !list.rows.length ? <ListSkeleton />
          : !list.rows.length ? (
            <EmptyState
              title={list.hasFilters ? 'Tidak ada hasil' : 'Belum ada pesan'}
              description={list.hasFilters ? 'Ubah kata kunci atau filter.' : 'Pesan dari formulir kontak akan muncul di sini.'}
            />
          ) : (
            <ul className={`border-t border-ink ${list.loading ? 'opacity-50' : ''}`} aria-busy={list.loading}>
              {list.rows.map((m, i) => (
                <li key={m.id} data-row data-status={m.status} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-b border-line py-5 sm:grid-cols-[auto_1fr_auto]">
                  <span className="label w-6 pt-1.5 text-ink">{String(offset + i + 1).padStart(2, '0')}</span>
                  <button type="button" onClick={() => setOpen(m)} className="min-w-0 text-left" aria-label={`Buka pesan: ${m.subject}`}>
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={statusTone[m.status]}>{statusLabel[m.status]}</StatusBadge>
                      <StatusBadge>{catLabel(m.category)}</StatusBadge>
                      <span className="label">{formatDateTime(m.created_at)}</span>
                    </span>
                    <span className={`mt-2 block break-words font-display text-xl uppercase leading-tight tracking-tight ${m.status === 'new' ? 'font-extrabold' : 'font-bold text-ink-soft'}`}>{m.subject}</span>
                    <span className="mt-1 block break-words text-small text-mute">{m.name} · {m.email}</span>
                  </button>
                  <div className="col-span-2 flex justify-end gap-1 sm:col-span-1">
                    {m.status === 'new'
                      ? <IconButton icon={Eye} label={`Tandai dibaca: ${m.subject}`} disabled={busy} onClick={() => setStatus(m, 'read', 'Pesan ditandai dibaca.')} />
                      : <IconButton icon={EyeOff} label={`Tandai baru: ${m.subject}`} disabled={busy} onClick={() => setStatus(m, 'new', 'Pesan ditandai baru.')} />}
                    {m.status !== 'archived' && <IconButton icon={Archive} label={`Arsipkan: ${m.subject}`} disabled={busy} onClick={() => setStatus(m, 'archived', 'Pesan diarsipkan.')} />}
                    <IconButton icon={Trash2} label={`Hapus: ${m.subject}`} danger onClick={() => setDeleting(m)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} disabled={list.loading} />
      </div>

      <Drawer open={Boolean(open)} subtitle={open ? `${catLabel(open.category)} · ${formatDateTime(open.created_at)}` : ''} title={open?.subject ?? ''} onClose={() => setOpen(null)} escapeDisabled={Boolean(deleting)}>
        {open && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={statusTone[open.status]}>{statusLabel[open.status]}</StatusBadge>
              {open.reviewed_at && <span className="label">Ditangani {formatDateTime(open.reviewed_at)}</span>}
            </div>
            <dl className="mt-6 grid gap-4 border-y border-ink py-5 sm:grid-cols-2">
              <div><dt className="label">Pengirim</dt><dd className="mt-1 break-words font-medium">{open.name}</dd></div>
              <div><dt className="label">Email (privat)</dt><dd className="mt-1 break-all font-medium">{open.email}</dd></div>
            </dl>
            <p className="mt-6 whitespace-pre-line break-words text-lead text-ink-soft">{open.message}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              {open.status !== 'read' && <button type="button" disabled={busy} onClick={() => setStatus(open, 'read', 'Pesan ditandai dibaca.')} className={`${actionBtn} bg-ink text-paper hover:bg-ink-soft`}><Eye size={14} aria-hidden /> Tandai dibaca</button>}
              {open.status !== 'new' && <button type="button" disabled={busy} onClick={() => setStatus(open, 'new', 'Pesan ditandai baru.')} className={`${actionBtn} hover:bg-fog`}><EyeOff size={14} aria-hidden /> Tandai baru</button>}
              {open.status !== 'archived' && <button type="button" disabled={busy} onClick={() => setStatus(open, 'archived', 'Pesan diarsipkan.')} className={`${actionBtn} hover:bg-fog`}><Archive size={14} aria-hidden /> Arsipkan</button>}
              <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`} className={`${actionBtn} hover:bg-fog`}><Mail size={14} aria-hidden /> Balas lewat email</a>
              <button type="button" disabled={busy} onClick={() => setDeleting(open)} className={`${actionBtn} hover:bg-ink hover:text-paper`}><Trash2 size={14} aria-hidden /> Hapus</button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus pesan?"
        description={`Pesan “${deleting?.subject ?? ''}” dari ${deleting?.name ?? ''} akan dihapus permanen dan tidak bisa dikembalikan.`}
        confirmLabel="Ya, hapus"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
