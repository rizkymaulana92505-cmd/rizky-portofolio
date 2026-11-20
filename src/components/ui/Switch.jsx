import { cn } from '@/lib/cn';

/** Saklar on/off bergaya minimalis. */
export default function Switch({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('group/switch inline-flex min-h-10 items-center gap-3 py-2', className)}
    >
      <span
        aria-hidden
        className={cn(
          'relative h-5 w-9 border transition-colors duration-300 ease-editorial',
          checked ? 'border-ink bg-ink' : 'border-line-strong bg-transparent group-hover/switch:border-ink',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3.5 w-3.5 transition-all duration-300 ease-editorial',
            checked ? 'left-[1.1rem] bg-paper' : 'left-0.5 bg-ink',
          )}
        />
      </span>
      <span className="label text-ink">{label}</span>
    </button>
  );
}
