import { Inbox, LayoutDashboard, Link2, Settings } from 'lucide-react';
import { resources } from './resources';

const configured = resources.map((r) => ({
  key: r.key,
  label: r.label,
  to: `/admin/${r.path}`,
  icon: r.icon,
}));

const profilAt = configured.findIndex((item) => item.key === 'profiles');
const tautan = { key: 'tautan', label: 'Tautan Sosial', to: '/admin/tautan', icon: Link2 };
const resourceNav = profilAt >= 0
  ? [...configured.slice(0, profilAt + 1), tautan, ...configured.slice(profilAt + 1)]
  : [...configured, tautan];

const pad = (n) => String(n).padStart(2, '0');

/** Navigasi admin: indeks dihitung otomatis agar selalu sinkron dengan header tiap halaman. */
export const adminNav = [
  { key: 'overview', label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true, index: pad(1) },
  ...resourceNav.map((item, i) => ({ ...item, index: pad(i + 2) })),
  { key: 'pesan', label: 'Pesan masuk', to: '/admin/pesan', icon: Inbox, index: pad(resourceNav.length + 2) },
  { key: 'pengaturan', label: 'Pengaturan', to: '/admin/pengaturan', icon: Settings, index: pad(resourceNav.length + 3) },
];
