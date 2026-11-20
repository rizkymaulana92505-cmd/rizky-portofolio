import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import { ease } from '@/lib/motion';

function Panel({ title, subtitle, onClose, escapeDisabled, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  useDialog({
    open: true,
    onClose: () => { if (!escapeDisabled) onClose(); },
    panelRef,
    initialFocusRef: closeRef,
  });

  return (
    <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-scrim/40" onClick={onClose} aria-hidden />
      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: { duration: 0.45, ease } }}
        exit={{ x: '100%', transition: { duration: 0.3, ease } }}
        className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col border-l border-ink bg-paper"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink px-5 py-5 sm:px-8">
          <div className="min-w-0">
            {subtitle && <p className="label text-ink">{subtitle}</p>}
            <h2 id="drawer-title" className="mt-2 break-words font-display text-2xl font-extrabold uppercase leading-none tracking-tight sm:text-3xl">{title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">{children}</div>
      </motion.aside>
    </motion.div>
  );
}

/** Panel geser dari kanan untuk form tambah/edit. */
export default function Drawer({ open, title, subtitle, onClose, escapeDisabled = false, children }) {
  return createPortal(
    <AnimatePresence>
      {open && <Panel title={title} subtitle={subtitle} onClose={onClose} escapeDisabled={escapeDisabled}>{children}</Panel>}
    </AnimatePresence>,
    document.body,
  );
}
