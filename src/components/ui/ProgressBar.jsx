import { motion } from 'framer-motion';
import { ease, viewport } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { clampPercent, hasNumber } from '@/lib/format';

/**
 * Bar persentase dengan tanda potong di 25/50/75.
 * value kosong (null) → track putus-putus (belum diisi).
 */
export default function ProgressBar({ value, label, delay = 0, className }) {
  const filled = hasNumber(value);
  const pct = filled ? clampPercent(value) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={filled ? pct : undefined}
      aria-valuetext={filled ? `${pct}%` : 'Belum diisi'}
      className={cn('relative h-3', className)}
    >
      <div aria-hidden className={cn('absolute inset-x-0 top-[3px] h-1.5', filled ? 'bg-line' : 'track-dashed')} />
      {filled && (
        <motion.div
          aria-hidden
          className="absolute left-0 top-[3px] h-1.5 w-full origin-left bg-ink"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: pct / 100 }}
          viewport={viewport}
          transition={{ duration: 1, ease, delay }}
        />
      )}
      {[25, 50, 75].map((tick) => (
        <span
          key={tick}
          aria-hidden
          className="absolute top-[3px] h-1.5 w-px bg-paper"
          style={{ left: `${tick}%` }}
        />
      ))}
    </div>
  );
}
