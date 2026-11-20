import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ease } from '@/lib/motion';
import { getCategoryLabel, padIndex } from '@/lib/projects';
import Button from '@/components/ui/Button';
import Placeholder from '@/components/ui/Placeholder';
import ProjectImage from './ProjectImage';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Overlay pratinjau proyek.
 * Tutup lewat: tombol ×, tombol "Tutup", tekan Esc, atau klik latar gelap.
 * Fokus dikunci di dalam dialog dan dikembalikan ke pemicu saat ditutup.
 */
export default function ProjectPreview({ project, index = 0, onClose }) {
  const panelRef = useRef(null);
  const open = Boolean(project);

  useEffect(() => {
    if (!open) return undefined;

    const trigger = document.activeElement;
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    panelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      trigger?.focus?.();
    };
  }, [open, onClose]);

  const category = project ? getCategoryLabel(project.category) : null;
  const cover = project?.images.cover;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="preview"
          className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          {/* Latar gelap — klik untuk menutup */}
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-pointer bg-scrim/70 backdrop-blur-[2px]" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-judul"
            tabIndex={-1}
            className="relative grid max-h-[92vh] w-full max-w-5xl grid-cols-12 overflow-y-auto border border-ink bg-paper md:max-h-[85vh]"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="col-span-12 border-b border-ink md:col-span-7 md:border-b-0 md:border-r">
              <ProjectImage
                src={cover?.src}
                alt={cover?.alt ?? `Cover ${project.name} (belum tersedia)`}
                number={padIndex(index + 1)}
                ratio="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[26rem]"
                className="border-0"
              />
            </div>

            <div className="col-span-12 flex flex-col p-6 md:col-span-5 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <p className="label">
                  <span className="text-ink">{padIndex(index + 1)}</span> — {category ?? <Placeholder>Kategori</Placeholder>}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup pratinjau"
                  className="-m-2 p-2 transition-transform duration-300 ease-editorial hover:rotate-90"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <h2
                id="preview-judul"
                className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] font-stretch-display"
              >
                {project.name}
              </h2>

              <p className="mt-5 line-clamp-5 text-ink-soft">
                {project.description ?? <Placeholder>Deskripsi singkat belum diisi</Placeholder>}
              </p>

              {project.technologies.length > 0 && (
                <ul aria-label="Teknologi" className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="label text-ink before:mr-3 before:text-mute before:content-['/'] first:before:hidden">
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              {project.placeholder && <p className="label mt-5">Placeholder — isi di src/data/projects.js</p>}

              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Button to={`/proyek/${project.slug}`} withArrow onClick={onClose}>Lihat Detail</Button>
                <Button variant="outline" onClick={onClose}>Tutup</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
