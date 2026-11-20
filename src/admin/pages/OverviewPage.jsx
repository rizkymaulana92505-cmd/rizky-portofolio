import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Inbox, Link2 } from 'lucide-react';
import { getOverview } from '@/services/admin/overview';
import { formatRelative, truncate } from '@/lib/admin/format';
import { messageCategories } from '@/data';
import { adminNav } from '../config/nav';
import { useAdminTitle } from '../hooks/useAdminTitle';
import AdminPageHeader from '../components/PageHeader';
import StatusBadge, { PublishBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState } from '../components/States';

const catLabel = (k) => messageCategories.find((c) => c.key === k)?.label ?? k;
export const statusTone = { new: 'solid', read: 'outline', archived: 'muted' };
export const statusLabel = { new: 'Baru', read: 'Dibaca', archived: 'Diarsipkan' };

function Tile({ index, label, value, to, lines, loading }) {
  return (
    <Link to={to} className="group relative flex min-h-[11rem] flex-col justify-between border border-ink p-5 transition-colors duration-300 hover:bg-ink hover:text-paper">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">{index} · {label}</span>
        <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
      <div>
        <p className="font-display text-[clamp(3.5rem,7vw,5.5rem)] font-extrabold leading-[0.85] tracking-[-0.05em] tabular-nums" aria-label={`${label}: ${loading ? 'memuat' : value}`}>
          {loading ? <span className="inline-block h-[0.8em] w-[1.5ch] animate-pulse bg-fog align-baseline group-hover:bg-ink-soft" /> : value}
        </p>
        <p className="mt-3 text-small opacity-80">{lines}</p>
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  useAdminTitle('Overview');
  const index = adminNav.find((n) => n.key === 'overview')?.index;
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ data: await getOverview(), loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e.message });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const { data, loading, error } = state;
  const c = data?.counts;
  const draft = (x) => x.total - x.published;

  return (
    <>
      <AdminPageHeader index={index} title="Overview" description="Ringkasan konten dan pesan yang tersimpan di database. Semua angka dihitung langsung dari Supabase." />

      <div className="mt-8">
        <Link to="/admin/tautan" className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft">
          <Link2 size={14} aria-hidden /> Tambah/edit tautan sosial
        </Link>
      </div>

      {error ? (
        <div className="mt-8"><ErrorState message={error} onRetry={load} /></div>
      ) : (
        <>
          {c?.messages.unread > 0 && (
            <Link to="/admin/pesan" className="mt-8 flex items-center justify-between gap-4 border border-ink bg-ink p-4 text-paper transition-colors hover:bg-ink-soft">
              <span className="flex items-center gap-3 font-medium"><Inbox size={18} aria-hidden /> {c.messages.unread} pesan baru belum dibaca</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]">Buka →</span>
            </Link>
          )}

          <section aria-label="Statistik" className="mt-8 grid gap-px sm:grid-cols-2 xl:grid-cols-3">
            <Tile index="01" label="Proyek" to="/admin/proyek" loading={loading} value={c?.projects.total}
              lines={c && `${c.projects.published} terbit · ${draft(c.projects)} draf`} />
            <Tile index="02" label="Keahlian" to="/admin/keahlian" loading={loading} value={c?.skills.total}
              lines={c && `${c.skills.published} terbit · ${draft(c.skills)} draf`} />
            <Tile index="03" label="Sertifikat" to="/admin/sertifikat" loading={loading} value={c?.certificates.total}
              lines={c && `${c.certificates.total - c.certificates.achievements} sertifikat · ${c.certificates.achievements} prestasi`} />
            <Tile index="04" label="Artikel" to="/admin/blog" loading={loading} value={c?.blog.total}
              lines={c && `${c.blog.published} terbit · ${draft(c.blog)} draf`} />
            <Tile index="05" label="Pesan masuk" to="/admin/pesan" loading={loading} value={c?.messages.total}
              lines={c && `${c.messages.unread} belum dibaca`} />
          </section>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <section aria-labelledby="ov-pesan">
              <div className="flex items-end justify-between border-b border-ink pb-3">
                <h2 id="ov-pesan" className="font-display text-2xl font-extrabold uppercase tracking-tight">Pesan terbaru</h2>
                <Link to="/admin/pesan" className="font-mono text-[11px] uppercase tracking-[0.12em] underline">Semua →</Link>
              </div>
              {loading ? <div className="mt-4 h-40 animate-pulse bg-fog" /> : data.recentMessages.length === 0 ? (
                <div className="mt-4"><EmptyState title="Belum ada pesan" description="Pesan dari formulir kontak akan muncul di sini." /></div>
              ) : (
                <ul>
                  {data.recentMessages.map((m) => (
                    <li key={m.id} className="border-b border-line py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={statusTone[m.status]}>{statusLabel[m.status]}</StatusBadge>
                        <StatusBadge>{catLabel(m.category)}</StatusBadge>
                        <span className="label ml-auto">{formatRelative(m.created_at)}</span>
                      </div>
                      <p className="mt-2 break-words font-display text-lg font-bold uppercase leading-tight tracking-tight">{m.subject}</p>
                      <p className="mt-1 break-words text-small text-mute">{m.name} — {truncate(m.message, 90)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="ov-aktivitas">
              <div className="border-b border-ink pb-3">
                <h2 id="ov-aktivitas" className="font-display text-2xl font-extrabold uppercase tracking-tight">Konten terakhir diubah</h2>
              </div>
              {loading ? <div className="mt-4 h-40 animate-pulse bg-fog" /> : data.activity.length === 0 ? (
                <div className="mt-4"><EmptyState title="Belum ada konten" description="Tambahkan konten pertama lewat menu di samping." /></div>
              ) : (
                <ul>
                  {data.activity.map((a) => {
                    const created = Math.abs(new Date(a.updatedAt) - new Date(a.createdAt)) < 2000;
                    return (
                      <li key={a.id} className="border-b border-line">
                        <Link to={a.path} className="group flex items-start justify-between gap-4 py-4 transition-colors hover:bg-fog">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge>{a.label}</StatusBadge>
                              <PublishBadge published={a.isPublished} />
                            </div>
                            <p className="mt-2 break-words font-display text-lg font-bold uppercase leading-tight tracking-tight">{a.title}</p>
                          </div>
                          <span className="label shrink-0 pt-1">{created ? 'Dibuat' : 'Diubah'} {formatRelative(a.updatedAt)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
