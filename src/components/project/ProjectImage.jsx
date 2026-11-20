import { cn } from '@/lib/cn';
import SafeImage from '@/components/ui/SafeImage';

/**
 * Cover proyek. Hitam-putih secara default, berwarna + zoom halus saat hover
 * (letakkan di dalam elemen ber-class "group"). Tanpa `src` tampil placeholder bergrid.
 */
export default function ProjectImage({ src, alt, number, ratio = 'aspect-[4/3]', className }) {
  return (
    <div className={cn('relative overflow-hidden border border-ink bg-fog', ratio, className)}>
      <SafeImage
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover grayscale transition-[transform,filter] duration-700 ease-editorial group-hover:scale-[1.04] group-hover:grayscale-0"
        fallback={(failed) => (
        <div
          role="img"
          aria-label={alt}
          className="grid-lines flex h-full w-full items-center justify-center bg-[size:12.5%_16.66%] transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
        >
          <span className="text-center">
            <span className="block font-display text-[clamp(3rem,9vw,8rem)] font-extrabold leading-none tracking-[-0.06em] text-ink/90 font-stretch-display">
              {number}
            </span>
            <span className="label mt-2 block">{failed ? 'Gambar tidak dapat dimuat' : 'Gambar menyusul'}</span>
          </span>
        </div>
        )}
      />
      {['left-2 top-2', 'right-2 top-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
        <span key={pos} aria-hidden className={cn('absolute font-mono text-[10px] leading-none', pos)}>+</span>
      ))}
    </div>
  );
}
