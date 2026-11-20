import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import { ease } from '@/lib/motion';

function Panel({ title, description, confirmLabel, cancelLabel, loading, onConfirm, onCancel }) {
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  // Fokus awal di "Batal" agar Enter tidak langsung menghapus.
  useDialog({ open: true, onClose: loading ? () => {} : onCancel, panelRef, initialFocusRef: cancelRef });

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-scrim/50" onClick={loading ? undefined : onCancel} aria-hidden />
      <motion.div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease } }}
        exit={{ y: 12, opacity: 0, transition: { duration: 0.15 } }}
        className="relative w-full max-w-md border border-ink bg-paper p-6 sm:p-8"
      >
        <h2 id="confirm-title" className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">{title}</h2>
        <p id="confirm-desc" className="mt-4 text-ink-soft">{description}</p>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-11 border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-fog disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-70"
          >
            {loading && <Loader2 size={14} aria-hidden className="animate-spin" />}
            {loading ? 'Memproses…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Dialog konfirmasi (dipakai sebelum menghapus / membuang perubahan). */
export default function ConfirmDialog({
  open, title, description, confirmLabel = 'Ya, lanjutkan', cancelLabel = 'Batal', loading = false, onConfirm, onCancel,
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <Panel
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          loading={loading}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
