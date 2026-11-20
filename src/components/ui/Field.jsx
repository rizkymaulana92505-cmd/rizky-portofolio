import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Pesan error / petunjuk di bawah field. Dipakai juga oleh ChoiceGroup. */
export function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-small font-medium text-ink">
        <AlertCircle size={15} strokeWidth={2} aria-hidden className="mt-[3px] shrink-0" />
        <span>{error}</span>
      </p>
    );
  }
  if (hint) {
    return <p id={`${id}-hint`} className="mt-2 text-small text-mute">{hint}</p>;
  }
  return null;
}

const control =
  'block w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-lead text-ink placeholder:text-mute/70 ' +
  'outline-none transition-[border-color,box-shadow] duration-300 ease-editorial ' +
  'hover:border-ink focus:border-ink focus:shadow-[0_1px_0_0_rgb(var(--color-ink))] disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Field minimalis bergaris bawah. as="input" (default) atau as="textarea".
 * `error` → pesan error · `hint` → petunjuk · `counter` → { current, max }
 */
export default function Field({
  id,
  label,
  as: Tag = 'input',
  error,
  hint,
  counter,
  suffix,
  required,
  className,
  ...rest
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label text-ink">
          {label}
          {required && <span aria-hidden> *</span>}
        </label>
        {counter && (
          <span aria-hidden className={cn('label tabular-nums', counter.current > counter.max && 'text-ink')}>
            {counter.current} / {counter.max}
          </span>
        )}
      </div>
      <div className="relative">
        <Tag
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(control, error ? 'border-ink' : 'border-line-strong', Tag === 'textarea' && 'min-h-[9rem] resize-y', suffix && 'pr-9')}
          {...rest}
        />
        {suffix && <span aria-hidden className="label pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-ink">{suffix}</span>}
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}
