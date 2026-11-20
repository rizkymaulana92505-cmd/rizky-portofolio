import { cn } from '@/lib/cn';
import { getCategoryLabel, padIndex } from '@/lib/projects';
import Button from '@/components/ui/Button';
import Placeholder from '@/components/ui/Placeholder';
import Reveal from '@/components/motion/Reveal';
import ProjectImage from './ProjectImage';

/**
 * Empat komposisi editorial yang berputar mengikuti urutan.
 * Kelas ditulis utuh (bukan dirakit) agar terbaca oleh Tailwind.
 */
const layouts = [
  // A — gambar lebar kiri, teks sempit kanan di bawah
  {
    media: 'md:col-span-8',
    ratio: 'aspect-[16/10]',
    body: 'md:col-span-4 md:self-end',
  },
  // B — teks kiri, gambar tinggi kanan turun sedikit
  {
    media: 'md:col-span-6 md:col-start-7 md:order-2 md:mt-20',
    ratio: 'aspect-[4/5]',
    body: 'md:col-span-4 md:col-start-1 md:order-1 md:self-start',
  },
  // C — gambar kecil menjorok, teks lebar kanan
  {
    media: 'md:col-span-5 md:col-start-2',
    ratio: 'aspect-[4/5]',
    body: 'md:col-span-5 md:col-start-8 md:self-center',
  },
  // D — gambar panorama penuh, teks dua kolom di bawah
  {
    media: 'md:col-span-12',
    ratio: 'aspect-[21/9]',
    body: 'md:col-span-7 md:col-start-6',
  },
];

export default function ProjectItem({ project, index, onPreview }) {
  const layout = layouts[index % layouts.length];
  const number = padIndex(index + 1);
  const category = getCategoryLabel(project.category);
  const cover = project.images.cover;
  const wide = index % layouts.length === 3;

  return (
    <article aria-labelledby={`proyek-${project.id}`} className="relative">
      <div className="grid grid-cols-12 items-start gap-x-4 gap-y-6 md:gap-y-0">
        {/* Gambar — klik membuka pratinjau */}
        <Reveal className={cn('col-span-12', layout.media)}>
          <button
            type="button"
            onClick={() => onPreview(project)}
            aria-label={`Pratinjau proyek ${project.name}`}
            className="group relative block w-full cursor-pointer text-left"
          >
            <ProjectImage
              src={cover?.src}
              alt={cover?.alt ?? `Cover ${project.name} (belum tersedia)`}
              number={number}
              ratio={layout.ratio}
            />
            <span className="absolute inset-0 flex items-end justify-end p-4">
              <span className="translate-y-2 bg-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper opacity-0 transition-all duration-500 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                Pratinjau +
              </span>
            </span>
          </button>
        </Reveal>

        {/* Teks */}
        <Reveal delay={0.1} className={cn('col-span-12', layout.body)}>
          <div className={cn(wide && 'grid gap-x-8 gap-y-6 md:grid-cols-2 md:pt-8')}>
            <div>
              <div className="flex items-start justify-between gap-4 border-t border-ink pt-3">
                <span className="font-display text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-transparent text-stroke-ink font-stretch-display">
                  {number}
                </span>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="label text-ink">{category ?? <Placeholder>Kategori</Placeholder>}</span>
                  {project.placeholder && <span className="label">Placeholder</span>}
                </div>
              </div>

              <h2
                id={`proyek-${project.id}`}
                className="mt-6 font-display text-[clamp(1.75rem,3.4vw,3rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] font-stretch-display"
              >
                {project.name}
              </h2>
            </div>

            <div>
              <p className="line-clamp-3 max-w-md mt-4 text-ink-soft md:mt-6">
                {project.description ?? <Placeholder>Deskripsi singkat belum diisi</Placeholder>}
              </p>

              <ul aria-label="Teknologi" className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
                {project.technologies.length ? (
                  project.technologies.map((tech) => (
                    <li key={tech} className="label text-ink before:mr-3 before:text-mute before:content-['/'] first:before:hidden">
                      {tech}
                    </li>
                  ))
                ) : (
                  <li className="label"><Placeholder>Teknologi belum diisi</Placeholder></li>
                )}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button to={`/proyek/${project.slug}`} size="sm" withArrow>Lihat Detail</Button>
                <Button variant="outline" size="sm" onClick={() => onPreview(project)}>Pratinjau</Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
