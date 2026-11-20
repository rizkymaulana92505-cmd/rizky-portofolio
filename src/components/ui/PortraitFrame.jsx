import { cn } from '@/lib/cn';
import SafeImage from './SafeImage';

/**
 * Bingkai potret bergaya editorial (rasio 4:5, bingkai bergeser, keterangan "Fig.").
 * Tanpa `src`, tampil placeholder monogram + grid sampai foto asli dipasang.
 */
export default function PortraitFrame({ src, alt, monogram = 'RM', figure = 'Fig. 01', className }) {
  return (
    <figure className={cn('relative isolate', className)}>
      <span aria-hidden className="absolute -bottom-2 -right-2 -z-10 h-full w-full border border-line-strong" />
      <div className="relative aspect-[4/5] overflow-hidden border border-ink bg-paper">
        <SafeImage
          src={src}
          alt={alt}
          loading="eager"
          className="h-full w-full object-cover grayscale"
          fallback={(
          <div
            role="img"
            aria-label={alt}
            className="grid-lines flex h-full w-full items-center justify-center bg-fog bg-[size:25%_20%]"
          >
            <span className="font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold tracking-[-0.06em] font-stretch-display">
              {monogram}
            </span>
          </div>
          )}
        />
        {['left-2 top-2', 'right-2 top-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
          <span key={pos} aria-hidden className={cn('absolute font-mono text-[10px] leading-none', pos)}>+</span>
        ))}
      </div>
      <figcaption className="label mt-3 flex justify-between gap-2">
        <span className="text-ink">{figure}</span>
        <span>{src ? 'Potret' : 'Foto menyusul'}</span>
      </figcaption>
    </figure>
  );
}
