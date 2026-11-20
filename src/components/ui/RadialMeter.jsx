import { motion } from 'framer-motion';
import { ease, viewport } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { clampPercent, hasNumber } from '@/lib/format';
import CountUp from './CountUp';

/**
 * Cincin persentase. Letakkan di dalam elemen ber-class "group" agar
 * cincin berputar halus saat hover. value kosong → cincin titik-titik.
 */
export default function RadialMeter({ value, label, delay = 0, className }) {
  const filled = hasNumber(value);
  const pct = filled ? clampPercent(value) : 0;

  return (
    <div
      role="img"
      aria-label={filled ? `${label}: ${pct}%` : `${label}: belum diisi`}
      className={cn('relative aspect-square w-full', className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        fill="none"
        className="absolute inset-0 h-full w-full -rotate-90 transition-transform duration-700 ease-editorial group-hover:-rotate-[70deg]"
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          className={filled ? 'stroke-line' : 'stroke-line-strong'}
          strokeWidth="2"
          strokeDasharray={filled ? undefined : '1 4'}
        />
        {filled && (
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-ink"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: pct / 100 }}
            viewport={viewport}
            transition={{ duration: 1.1, ease, delay }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <CountUp
          value={value}
          delay={delay}
          className="font-display text-[clamp(1.25rem,2.4vw,1.875rem)] font-extrabold tabular-nums tracking-tight"
        />
      </div>
    </div>
  );
}
