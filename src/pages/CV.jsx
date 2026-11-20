import { Link } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';
import {
  getAbout, getContact, getExperiences, getProfile, getProjects, getResume, getSite, getSkills,
} from '@/services/portfolioService';
import { getInitials } from '@/lib/site';
import { useAsyncData } from '@/hooks/useAsyncData';
import { clampPercent, formatPeriod, hasNumber } from '@/lib/format';
import { groupSkills } from '@/lib/skills';
import { sortByStartDesc, toEntryProps } from '@/lib/experience';
import { getCategoryLabel, padIndex } from '@/lib/projects';
import PageHeader from '@/components/layout/PageHeader';
import Container from '@/components/ui/Container';
import ContentBlock from '@/components/ui/ContentBlock';
import DataBoundary from '@/components/ui/DataBoundary';
import Placeholder from '@/components/ui/Placeholder';
import PortraitFrame from '@/components/ui/PortraitFrame';
import ProgressBar from '@/components/ui/ProgressBar';
import TimelineEntry from '@/components/ui/TimelineEntry';
import Button from '@/components/ui/Button';
import Reveal from '@/components/motion/Reveal';

function Empty({ children }) {
  return (
    <p className="border border-dashed border-line-strong p-6 text-mute">
      <Placeholder>{children}</Placeholder>
    </p>
  );
}

function ContactRows({ contact, site }) {
  const rows = [
    {
      key: 'email',
      label: 'Email',
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : null,
      hint: 'Email belum diisi',
    },
    { key: 'lokasi', label: 'Lokasi', value: site.location, hint: '' },
    ...contact.socials.map((s) => ({ key: s.id, label: s.label, value: s.url, href: s.url, hint: '' })),
  ];
  return (
    <ul className="border-t border-ink">
      {rows.map((r) => (
        <li key={r.key} className="border-b border-line py-3">
          <p className="label">{r.label}</p>
          <p className="mt-1 break-words font-display text-lg font-bold leading-tight tracking-tight">
            {r.value ? (
              r.href ? (
                <a href={r.href} target={r.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:underline">
                  {r.value} <ArrowUpRight size={14} />
                </a>
              ) : (
                r.value
              )
            ) : (
              <Placeholder>{r.hint}</Placeholder>
            )}
          </p>
        </li>
      ))}
      {contact.socials.length === 0 && (
        <li className="py-3"><p className="label"><Placeholder>Media sosial belum diisi</Placeholder></p></li>
      )}
    </ul>
  );
}

function CVContent({ data: [resume, about, skills, experiences, projects, contact, profile, site] }) {
  const headline = resume.headline ?? profile.headline ?? [site.school, site.className].filter(Boolean).join(' · ');
  const summary = resume.summary ?? profile.statement;
  const hard = groupSkills(skills.filter((s) => s.category === 'hard'));
  const soft = skills.filter((s) => s.category === 'soft');
  const realExp = sortByStartDesc(experiences.filter((e) => !e.placeholder));
  const featured = (
    resume.featuredProjectSlugs.length
      ? resume.featuredProjectSlugs.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean)
      : projects.slice(0, 3)
  );
  const { cvFile } = resume;

  return (
    <section className="pb-section pt-14 md:pt-20">
      <Container>
        <div className="grid grid-cols-12 gap-x-4 gap-y-16">
          {/* Identitas — menempel saat scroll di desktop */}
          <aside className="col-span-12 md:col-span-4">
            <div className="md:sticky md:top-24">
              <Reveal>
                <PortraitFrame className="w-44 md:w-52" src={profile.photo} alt={profile.photoAlt} monogram={getInitials(site.shortName)} figure="Fig. 03" />
              </Reveal>

              <Reveal delay={0.1}>
                <h2 className="mt-10 font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] font-stretch-display">
                  {site.name}
                </h2>
                <p className="label mt-3 text-ink">{headline}</p>
                <p className="label mt-1">{site.className}</p>
              </Reveal>

              <Reveal delay={0.15} className="mt-8">
                <ContactRows contact={contact} site={site} />
              </Reveal>

              <Reveal delay={0.2} className="mt-8">
                {cvFile ? (
                  <Button href={cvFile.url} download={cvFile.fileName} size="lg" className="w-full">
                    <Download size={14} strokeWidth={1.75} /> Unduh CV (PDF)
                  </Button>
                ) : (
                  <p className="border border-dashed border-line-strong p-4 text-small text-mute">
                    Berkas CV (PDF) belum tersedia untuk diunduh.
                  </p>
                )}
                {cvFile?.placeholder && (
                  <p className="label mt-3">Berkas contoh — belum CV asli.</p>
                )}
              </Reveal>
            </div>
          </aside>

          {/* Isi CV */}
          <div className="col-span-12 space-y-20 md:col-span-7 md:col-start-6 md:space-y-28">
            <ContentBlock index="01" title="Profil">
              {summary && <p className="max-w-xl text-ink-soft">{summary}</p>}
              {!summary && <Empty>Ringkasan profil belum diisi</Empty>}
            </ContentBlock>

            <ContentBlock index="02" title="Pendidikan">
              <ul>
                {about.education.map((edu) => (
                  <Reveal as="li" key={edu.id}>
                    <TimelineEntry
                      period={formatPeriod(edu.start, edu.end)}
                      title={edu.institution}
                      titleHint={`Nama sekolah ${edu.level}`}
                      subtitle={[edu.level, edu.program].filter(Boolean).join(' · ') || null}
                      description={edu.note}
                      placeholder={edu.placeholder}
                    />
                  </Reveal>
                ))}
              </ul>
            </ContentBlock>

            <ContentBlock index="03" title="Keahlian">
              {hard.length === 0 && soft.length === 0 ? (
                <Empty>Belum ada keahlian yang ditambahkan</Empty>
              ) : (
              <div className="space-y-8">
                {hard.map(({ group, items }) => (
                  <div key={group} className="grid grid-cols-12 gap-x-4 gap-y-3 border-t border-line pt-4">
                    <p className="label col-span-12 text-ink md:col-span-3">{group}</p>
                    <ul className="col-span-12 grid gap-x-6 gap-y-4 sm:grid-cols-2 md:col-span-9">
                      {items.map((s) => (
                        <li key={s.id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em]">{s.name}</span>
                            <span className="font-mono text-[11px] tabular-nums text-ink">
                              {hasNumber(s.level) ? `${clampPercent(s.level)}%` : '—'}
                            </span>
                          </div>
                          <ProgressBar value={s.level} label={`${s.name} — CV`} className="mt-2" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {soft.length > 0 && (
                <div className="grid grid-cols-12 gap-x-4 gap-y-2 border-t border-line pt-4">
                  <p className="label col-span-12 text-ink md:col-span-3">Soft Skills</p>
                  <ul className="col-span-12 flex flex-wrap gap-x-6 gap-y-2 md:col-span-9">
                    {soft.map((s) => (
                      <li key={s.id} className="font-mono text-[11px] uppercase tracking-[0.12em]">
                        {s.name}
                        <span className="ml-2 tabular-nums text-ink">
                          {hasNumber(s.level) ? `${clampPercent(s.level)}%` : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                )}
              </div>
              )}
            </ContentBlock>

            <ContentBlock index="04" title="Pengalaman">
              {realExp.length ? (
                <ul>
                  {realExp.map((exp) => (
                    <Reveal as="li" key={exp.id}>
                      <TimelineEntry {...toEntryProps(exp, { withTag: true })} />
                    </Reveal>
                  ))}
                </ul>
              ) : (
                <Empty>Belum ada pengalaman yang ditambahkan</Empty>
              )}
            </ContentBlock>

            <ContentBlock index="05" title="Proyek Pilihan">
              {featured.length ? (
                <ul className="border-t border-ink">
                  {featured.map((p, i) => (
                    <Reveal as="li" key={p.id} delay={i * 0.06}>
                      <Link
                        to={`/proyek/${p.slug}`}
                        className="group flex items-baseline gap-4 border-b border-line py-5 transition-colors duration-300 hover:bg-fog"
                      >
                        <span className="label text-ink">{padIndex(i + 1)}</span>
                        <span className="flex-1">
                          <span className="block font-display text-[clamp(1.25rem,2.4vw,1.875rem)] font-extrabold uppercase leading-tight tracking-tight transition-transform duration-300 ease-editorial group-hover:translate-x-1">
                            {p.name}
                          </span>
                          <span className="label mt-1 block">
                            {getCategoryLabel(p.category) ?? <Placeholder>Kategori</Placeholder>}
                            {p.technologies.length > 0 && ` · ${p.technologies.join(' / ')}`}
                            {p.placeholder && ' · Placeholder'}
                          </span>
                        </span>
                        <ArrowUpRight aria-hidden size={20} strokeWidth={1.5} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              ) : (
                <Empty>Belum ada proyek</Empty>
              )}
            </ContentBlock>

            <Reveal className="flex flex-wrap gap-3 border-t border-line pt-8">
              <Button to="/proyek" withArrow>Lihat Semua Proyek</Button>
              <Button to="/sertifikat" variant="outline">Sertifikat & Testimoni</Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CV() {
  const state = useAsyncData(() =>
    Promise.all([getResume(), getAbout(), getSkills(), getExperiences(), getProjects(), getContact(), getProfile(), getSite()]),
  );

  return (
    <>
      <PageHeader pageKey="cv" title="CV Digital" />
      <DataBoundary state={state}>{(data) => <CVContent data={data} />}</DataBoundary>
    </>
  );
}
