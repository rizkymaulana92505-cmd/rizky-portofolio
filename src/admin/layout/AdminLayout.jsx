import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Menu, X } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import { ease } from '@/lib/motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth } from '../auth/AuthContext';
import { adminNav } from '../config/nav';
import Sidebar from './Sidebar';

function MobileMenu({ onClose, ...props }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  useDialog({ open: true, onClose, panelRef, initialFocusRef: closeRef });
  return (
    <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-scrim/40" onClick={onClose} aria-hidden />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu admin"
        initial={{ x: '-100%' }}
        animate={{ x: 0, transition: { duration: 0.4, ease } }}
        exit={{ x: '-100%', transition: { duration: 0.25, ease } }}
        className="absolute inset-y-0 left-0 w-[min(20rem,85vw)] border-r border-ink bg-paper"
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup menu" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border border-ink bg-paper">
          <X size={18} aria-hidden />
        </button>
        <Sidebar {...props} onNavigate={onClose} />
      </motion.div>
    </motion.div>
  );
}

/** Kerangka dashboard: sidebar (desktop tetap, mobile berupa drawer), header, dan area konten. */
export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const current = adminNav.find((i) => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)));

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="min-h-screen bg-paper">
      <a href="#admin-konten" className="skip-link">Lewati ke konten</a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink bg-paper lg:block">
        <Sidebar user={user} onSignOut={handleSignOut} signingOut={signingOut} />
      </aside>

      {createPortal(
        <AnimatePresence>
          {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} user={user} onSignOut={handleSignOut} signingOut={signingOut} />}
        </AnimatePresence>,
        document.body,
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink bg-paper/95 px-gutter backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink lg:hidden"
            >
              <Menu size={18} aria-hidden />
            </button>
            <p className="label truncate text-ink">
              <span className="text-mute">Admin / </span>{current?.label ?? 'Halaman'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <ThemeToggle />
            <Link to="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] hover:underline">
              <span className="hidden sm:inline">Lihat situs</span> <ExternalLink size={14} aria-hidden />
              <span className="sr-only">(tab baru)</span>
            </Link>
            <span className="hidden max-w-[14rem] truncate text-small text-ink-soft md:block" title={user?.email}>{user?.email}</span>
          </div>
        </header>

        <main id="admin-konten" tabIndex={-1} className="px-gutter py-8 outline-none md:py-12">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
