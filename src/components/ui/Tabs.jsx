import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Filter berbentuk tab bergaris bawah (gaya sama dengan /pengalaman).
 * tabs: [{ key, label, count? }] · layoutId harus unik per instance di halaman.
 */
export default function Tabs({ tabs, value, onChange, label, layoutId }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line">
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative flex min-h-10 items-center pb-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300',
              active ? 'text-ink' : 'text-mute hover:text-ink',
            )}
          >
            {tab.label}
            {tab.count !== undefined && <span aria-hidden> ({tab.count})</span>}
            {active && (
              <motion.span layoutId={layoutId} aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-ink" />
            )}
          </button>
        );
      })}
    </div>
  );
}
