import { useCallback, useMemo, useState } from 'react';
import { getProjects } from '@/services/portfolioService';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  collectTechnologies,
  emptyFilters,
  filterProjects,
} from '@/lib/projects';
import PageHeader from '@/components/layout/PageHeader';
import Container from '@/components/ui/Container';
import DataBoundary from '@/components/ui/DataBoundary';
import Button from '@/components/ui/Button';
import Reveal from '@/components/motion/Reveal';
import ProjectFilters from '@/components/project/ProjectFilters';
import ProjectItem from '@/components/project/ProjectItem';
import ProjectPreview from '@/components/project/ProjectPreview';

function EmptyState({ noData, onReset }) {
  return (
    <Reveal className="border border-dashed border-line-strong px-6 py-16 text-center md:py-24">
      <p aria-hidden className="font-display text-[clamp(5rem,16vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-transparent text-stroke-ink font-stretch-display">
        0
      </p>
      <h2 className="mt-6 font-display text-display-sm uppercase">
        {noData ? 'Belum ada proyek' : 'Proyek tidak ditemukan'}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">
        {noData
          ? 'Proyek akan tampil di sini setelah dipublikasikan.'
          : 'Tidak ada proyek yang cocok dengan kata kunci atau filter yang dipilih. Coba kata kunci lain atau atur ulang filter.'}
      </p>
      {!noData && <Button onClick={onReset} className="mt-8">Reset filter</Button>}
    </Reveal>
  );
}

function ProjectsContent({ data }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [preview, setPreview] = useState(null);

  const technologies = useMemo(() => collectTechnologies(data), [data]);
  const results = useMemo(() => filterProjects(data, filters), [data, filters]);

  const update = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFilters(emptyFilters), []);
  const closePreview = useCallback(() => setPreview(null), []);

  // Nomor proyek mengikuti urutan asli (bukan hasil filter) agar konsisten dengan halaman detail.
  const previewIndex = preview ? data.findIndex((p) => p.id === preview.id) : 0;

  return (
    <section className="pb-section pt-14 md:pt-20">
      <Container>
        <ProjectFilters
          projects={data}
          technologies={technologies}
          filters={filters}
          onChange={update}
          onReset={reset}
          resultCount={results.length}
        />

        <div className="mt-16 md:mt-24">
          {results.length ? (
            // key berubah saat hasil berubah → animasi reveal berjalan ulang
            <div key={results.map((p) => p.id).join('|')} className="space-y-24 md:space-y-40">
              {results.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  index={data.indexOf(project)}
                  onPreview={setPreview}
                />
              ))}
            </div>
          ) : (
            <EmptyState noData={data.length === 0} onReset={reset} />
          )}
        </div>
      </Container>

      <ProjectPreview project={preview} index={previewIndex} onClose={closePreview} />
    </section>
  );
}

export default function Projects() {
  const state = useAsyncData(getProjects);

  return (
    <>
      <PageHeader pageKey="proyek" />
      <DataBoundary state={state}>{(data) => <ProjectsContent data={data} />}</DataBoundary>
    </>
  );
}
