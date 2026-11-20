import { useState } from 'react';
import { motion } from 'framer-motion';
import { experienceTypes } from '@/data';
import { getExperiences } from '@/services/portfolioService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { cn } from '@/lib/cn';
import { sortByStartDesc, toEntryProps } from '@/lib/experience';
import PageHeader from '@/components/layout/PageHeader';
import Container from '@/components/ui/Container';
import DataBoundary from '@/components/ui/DataBoundary';
import Placeholder from '@/components/ui/Placeholder';
import TimelineEntry from '@/components/ui/TimelineEntry';
import Reveal from '@/components/motion/Reveal';

const SOURCE_EXP = 'src/data/experiences.js';
const tabs = [{ key: 'all', label: 'Semua' }, ...experienceTypes.map((t) => ({ key: t.key, label: t.label }))];

function TypeSection({ type, index, entries }) {
  const realCount = entries.filter((e) => !e.placeholder).length;

  return (
    <section aria-labelledby={`pengalaman-${type.key}`}>
      <Reveal className="flex items-end justify-between gap-4 border-t border-ink pt-4">
        <div className="flex items-baseline gap-4">
          <span className="label text-ink">{index}</span>
          <h2
            id={`pengalaman-${type.key}`}
            className="font-display text-[clamp(2.5rem,8vw,7rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] font-stretch-display"
          >
            {type.label}
          </h2>
        </div>
        <p className="label hidden text-right sm:block">
          {type.long}
          <br />
          <span className="text-ink">{realCount ? `${realCount} entri` : 'Belum diisi'}</span>
        </p>
      </Reveal>

      {/* Timeline: garis di kiri (mobile) / di tengah dengan entri berselang-seling (desktop) */}
      <ol className="relative mt-10 md:mt-14">
        <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-ink md:left-1/2" />
        {entries.length ? (
          entries.map((exp, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal
                as="li"
                key={exp.id}
                className={cn(
                  'group relative pb-10 pl-6 md:w-1/2 md:pb-14',
                  left ? 'md:pl-0 md:pr-10' : 'md:ml-auto md:pl-10',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 bg-ink transition-transform duration-300 ease-editorial group-hover:scale-150',
                    left && 'md:left-auto md:right-0 md:translate-x-1/2',
                  )}
                />
                <TimelineEntry variant="bare" {...toEntryProps(exp)} source={SOURCE_EXP} />
              </Reveal>
            );
          })
        ) : (
          <li className="relative pb-10 pl-6 md:w-1/2 md:pr-10 md:pl-0">
            <Placeholder>Belum ada pengalaman {type.label.toLowerCase()}</Placeholder>
          </li>
        )}
      </ol>
    </section>
  );
}

function ExperienceContent({ data }) {
  const [filter, setFilter] = useState('all');

  const countFor = (key) =>
    data.filter((e) => !e.placeholder && (key === 'all' || e.type === key)).length;
  const visibleTypes = experienceTypes.filter((t) => filter === 'all' || t.key === filter);

  return (
    <section className="pb-section pt-14 md:pt-20">
      <Container>
        <div
          role="tablist"
          aria-label="Filter pengalaman"
          className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line"
        >
          {tabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'relative flex min-h-10 items-center pb-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300',
                  active ? 'text-ink' : 'text-mute hover:text-ink',
                )}
              >
                {tab.label} <span aria-hidden>({countFor(tab.key)})</span>
                {active && (
                  <motion.span
                    layoutId="pengalaman-tab"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-px bg-ink"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-16 space-y-24 md:mt-24 md:space-y-32">
          {visibleTypes.map((type) => (
            <TypeSection
              key={type.key}
              type={type}
              index={String(experienceTypes.indexOf(type) + 1).padStart(2, '0')}
              entries={sortByStartDesc(data.filter((e) => e.type === type.key))}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function Experience() {
  const state = useAsyncData(getExperiences);

  return (
    <>
      <PageHeader pageKey="pengalaman" />
      <DataBoundary state={state}>{(data) => <ExperienceContent data={data} />}</DataBoundary>
    </>
  );
}
