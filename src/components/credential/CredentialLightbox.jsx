import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { ease } from '@/lib/motion';
import { padIndex } from '@/lib/projects';
import { useDialog } from '@/hooks/useDialog';
import Placeholder from '@/components/ui/Placeholder';
import SafeImage from '@/components/ui/SafeImage';
import ProjectImage from '@/components/project/ProjectImage';

/**
 * Lightbox gambar sertifikat/prestasi dengan navigasi sebelumnya/berikutnya.
 * Tutup: ×, Esc, atau klik latar. Panah ← → berpindah item.
 * `index` = null → tertutup.
 */
export default function CredentialLightbox({ items, index, onIndexChange, onClose }) {
  const panelRef = useRef(null);
  const item = index !== null ? items[index] : null;
  const total = items.length;

  useDialog({ open: Boolean(item), onClose, panelRef });

  const go = useCallback(
    (step) => onIndexChange((index + step + total) % total),
    [index, total, onIndexChange],
  );

  useEffect(() => {
    if (!item || total < 2) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, total, go]);

  const number = index !== null ? padIndex(index + 1) : '';

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-zoom-out bg-scrim/80 backdrop-blur-[2px]" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Gambar: ${item.title ?? item.titleHint}`}
            tabIndex={-1}
            className="relative grid max-h-[94vh] w-full max-w-6xl grid-cols-12 overflow-y-auto border border-ink bg-paper md:max-h-[88vh]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="col-span-12 flex items-center justify-center border-b border-ink bg-fog p-4 md:col-span-8 md:border-b-0 md:border-r md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  className="w-full"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <SafeImage
                    src={item.image?.src}
                    alt={item.image?.alt}
                    className="mx-auto max-h-[60vh] w-auto max-w-full border border-ink bg-paper object-contain"
                    fallback={<ProjectImage src={null} alt={`Gambar ${item.kind} belum tersedia`} number={number} ratio="aspect-[4/3]" />}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="col-span-12 flex flex-col p-6 md:col-span-4 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <p className="label">
                  <span className="text-ink">{number}</span> / {padIndex(total)} — {item.kind}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="-m-2 p-2 transition-transform duration-300 ease-editorial hover:rotate-90"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <h2 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] font-stretch-display">
                {item.title ?? <Placeholder>{item.titleHint}</Placeholder>}
              </h2>
              {item.tag && <p className="label mt-3 text-ink">{item.tag}</p>}

              <dl className="mt-6 border-t border-line text-small">
                {[
                  { k: item.orgLabel, v: item.org },
                  { k: 'Tanggal', v: item.date },
                  { k: 'Kategori', v: item.category },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line py-2">
                    <dt className="label">{k}</dt>
                    <dd className="text-right">{v ?? <Placeholder>Belum diisi</Placeholder>}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-ink-soft">
                {item.description ?? <Placeholder>Deskripsi singkat belum diisi</Placeholder>}
              </p>
              {item.placeholder && <p className="label mt-4">Placeholder — isi di src/data</p>}

              {total > 1 && (
                <div className="mt-auto flex gap-3 pt-8">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Sebelumnya"
                    className="flex h-12 w-12 items-center justify-center border border-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
                  >
                    <ArrowLeft size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Berikutnya"
                    className="flex h-12 w-12 items-center justify-center border border-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
                  >
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
