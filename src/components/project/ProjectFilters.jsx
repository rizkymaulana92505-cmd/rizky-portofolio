import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { projectCategories } from '@/data';
import { cn } from '@/lib/cn';
import { countByCategory, countByTechnology, hasActiveFilters } from '@/lib/projects';
import Button from '@/components/ui/Button';
import Placeholder from '@/components/ui/Placeholder';

function Chip({ active, disabled, onClick, children, count }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative inline-flex min-h-10 items-center border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300',
        active ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink hover:border-ink',
        disabled && 'cursor-not-allowed border-dashed text-mute hover:border-line-strong',
      )}
    >
      {children} <span aria-hidden className={active ? 'text-paper/60' : 'text-mute'}>({count})</span>
    </button>
  );
}

function Group({ label, children }) {
  return (
    <div className="grid grid-cols-12 items-start gap-x-4 gap-y-3 border-t border-line py-5">
      <p className="label col-span-12 pt-2 text-ink md:col-span-2">{label}</p>
      <div className="col-span-12 flex flex-wrap gap-2 md:col-span-10">{children}</div>
    </div>
  );
}

/**
 * Pencarian nama + filter kategori + filter teknologi + reset.
 * Komponen terkendali: state ada di halaman.
 */
export default function ProjectFilters({ projects, technologies, filters, onChange, onReset, resultCount }) {
  const active = hasActiveFilters(filters);

  return (
    <div role="search" aria-label="Cari dan filter proyek">
      {/* Pencarian */}
      <div className="flex items-end gap-4 border-b border-ink pb-3">
        <Search aria-hidden size={22} strokeWidth={1.5} className="mb-2 shrink-0" />
        <div className="relative flex-1">
          <label htmlFor="cari-proyek" className="label">Cari berdasarkan nama proyek</label>
          <input
            id="cari-proyek"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Ketik nama proyek…"
            autoComplete="off"
            className="mt-2 block w-full bg-transparent font-display text-[clamp(1.5rem,3.5vw,2.75rem)] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-line-strong [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        {filters.query && (
          <button
            type="button"
            onClick={() => onChange({ query: '' })}
            aria-label="Hapus kata kunci"
            className="mb-2 flex h-10 w-10 items-center justify-center transition-transform duration-300 ease-editorial hover:rotate-90"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="mt-6">
        <Group label="Kategori">
          <Chip active={filters.category === 'all'} count={projects.length} onClick={() => onChange({ category: 'all' })}>
            Semua
          </Chip>
          {projectCategories.map((cat) => {
            const count = countByCategory(projects, cat.key);
            return (
              <Chip
                key={cat.key}
                active={filters.category === cat.key}
                disabled={count === 0 && filters.category !== cat.key}
                count={count}
                onClick={() => onChange({ category: filters.category === cat.key ? 'all' : cat.key })}
              >
                {cat.label}
              </Chip>
            );
          })}
        </Group>

        <Group label="Teknologi">
          {technologies.length ? (
            <>
              <Chip active={filters.technology === 'all'} count={projects.length} onClick={() => onChange({ technology: 'all' })}>
                Semua
              </Chip>
              {technologies.map((tech) => (
                <Chip
                  key={tech}
                  active={filters.technology === tech}
                  count={countByTechnology(projects, tech)}
                  onClick={() => onChange({ technology: filters.technology === tech ? 'all' : tech })}
                >
                  {tech}
                </Chip>
              ))}
            </>
          ) : (
            <p className="label pt-2"><Placeholder>Belum ada teknologi yang tercatat</Placeholder></p>
          )}
        </Group>
      </div>

      {/* Status + reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-5">
        <motion.p key={resultCount} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} role="status" aria-live="polite" className="label">
          Menampilkan <span className="text-ink">{resultCount}</span> dari {projects.length} proyek
        </motion.p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!active}
          className="disabled:pointer-events-none disabled:opacity-40"
        >
          Reset filter
        </Button>
      </div>
    </div>
  );
}
