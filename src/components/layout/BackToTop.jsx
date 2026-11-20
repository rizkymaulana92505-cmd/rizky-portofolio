import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { ease } from '@/lib/motion';

/** Tombol kembali ke atas: muncul setelah scroll, dengan cincin progres baca. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useEffect(() => scrollY.on('change', (y) => setVisible(y > 600)), [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease }}
          className="group fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink transition-colors duration-300 hover:bg-ink hover:text-paper md:bottom-8 md:right-8"
        >
          <svg aria-hidden viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="24" cy="24" r="23" className="stroke-line-strong" strokeWidth="1" />
            <motion.circle
              cx="24"
              cy="24"
              r="23"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          <ArrowUp
            size={18}
            strokeWidth={1.5}
            className="relative transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
