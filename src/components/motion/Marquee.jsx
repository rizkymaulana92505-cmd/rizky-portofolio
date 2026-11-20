import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Pita teks berjalan. Selang-seling teks solid dan teks garis tepi.
 * Baris digandakan agar putarannya mulus (x: 0 → -50%).
 */
export default function Marquee({ items, duration = 40, className }) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((text, i) => (
        <li key={`${text}-${i}`} className="flex items-center whitespace-nowrap">
          <span
            className={cn(
              'px-6 md:px-10',
              i % 2 === 1 && 'text-transparent text-stroke-ink',
            )}
          >
            {text}
          </span>
          <span aria-hidden className="text-[0.5em] leading-none">✱</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {row}
        <div aria-hidden className="flex">{row}</div>
      </motion.div>
    </div>
  );
}
