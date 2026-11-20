import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const base =
  'group relative inline-flex select-none items-center justify-center overflow-hidden border font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 ease-editorial';

const variants = {
  primary: { root: 'border-ink bg-ink text-paper hover:text-ink', fill: 'bg-paper' },
  outline: { root: 'border-ink bg-transparent text-ink hover:text-paper', fill: 'bg-ink' },
  ghost: { root: 'border-transparent text-ink hover:border-line-strong', fill: 'bg-transparent' },
};

const sizes = {
  sm: 'h-10 px-4',
  md: 'h-12 px-6',
  lg: 'h-14 px-8 text-xs',
};

/**
 * <Button to="/proyek">  → React Router Link
 * <Button href="https://..."> → tautan eksternal
 * <Button onClick={...}> → tombol biasa
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  className,
  children,
  ...rest
}) {
  const v = variants[variant];
  const classes = cn(base, v.root, sizes[size], className);

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-editorial group-hover:scale-y-100',
          v.fill,
        )}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {withArrow && (
          <ArrowUpRight
            size={14}
            strokeWidth={1.75}
            className="transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </span>
    </>
  );

  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) {
    // mailto: dibuka oleh aplikasi email, bukan tab baru.
    const isMail = href.startsWith('mailto:');
    return (
      <a
        href={href}
        {...(isMail ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
        className={classes}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return <button type="button" className={classes} {...rest}>{content}</button>;
}
