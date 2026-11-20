import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PenLine, X } from 'lucide-react';
import { submitTestimonial } from '@/services/portfolioService';
import { usesSupabaseData } from '@/lib/supabaseConfig';
import { useDialog } from '@/hooks/useDialog';
import { ease } from '@/lib/motion';
import TestimonialForm from './TestimonialForm';

function Dialog({ onClose }) {
  const panelRef = useRef(null);
  useDialog({ open: true, onClose, panelRef });

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-scrim/40" onClick={onClose} aria-hidden />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tulis testimoni"
        tabIndex={-1}
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease } }}
        exit={{ y: 24, opacity: 0, transition: { duration: 0.2 } }}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-ink bg-paper sm:m-6"
      >
        <div className="sticky top-0 z-10 flex justify-end bg-paper p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center border border-ink bg-paper transition-colors hover:bg-ink hover:text-paper"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <TestimonialForm
          bare
          className="px-5 pb-5 sm:px-8 sm:pb-8"
          onSubmit={submitTestimonial}
          simulated={!usesSupabaseData}
          onClose={onClose}
        />
      </motion.div>
    </motion.div>
  );
}

export default function TestimonialLauncher() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tulis testimoni"
        className="fixed bottom-5 left-5 z-30 inline-flex h-12 items-center gap-2 border border-ink bg-paper px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 hover:bg-ink hover:text-paper md:bottom-8 md:left-8"
      >
        <PenLine size={16} strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline">Tulis testimoni</span>
        <span className="sm:hidden">Testimoni</span>
      </button>
      {createPortal(
        <AnimatePresence>{open && <Dialog onClose={close} />}</AnimatePresence>,
        document.body,
      )}
    </>
  );
}
