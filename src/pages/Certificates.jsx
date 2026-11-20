import { useMemo, useState } from 'react';
import { PenLine } from 'lucide-react';
import {
  achievementCategories,
  certificateCategories,
  testimonialTypes,
} from '@/data';
import { getAchievements, getCertificates, getTestimonials, submitTestimonial } from '@/services/portfolioService';
import { usesSupabaseData } from '@/lib/supabaseConfig';
import { useAsyncData } from '@/hooks/useAsyncData';
import { achievementView, certificateView, sortByDateDesc } from '@/lib/credentials';
import PageHeader from '@/components/layout/PageHeader';
import Container from '@/components/ui/Container';
import ContentBlock from '@/components/ui/ContentBlock';
import DataBoundary from '@/components/ui/DataBoundary';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import TextLink from '@/components/ui/TextLink';
import Placeholder from '@/components/ui/Placeholder';
import CredentialCard from '@/components/credential/CredentialCard';
import CredentialLightbox from '@/components/credential/CredentialLightbox';
import TestimonialItem from '@/components/credential/TestimonialItem';
import TestimonialForm from '@/components/credential/TestimonialForm';

const sections = [
  { id: 'sertifikat-daftar', index: '01', label: 'Sertifikat' },
  { id: 'prestasi-daftar', index: '02', label: 'Prestasi' },
  { id: 'testimoni', index: '03', label: 'Testimoni' },
];

function EmptyNote({ children }) {
  return (
    <p className="border border-dashed border-line-strong p-8 text-center text-mute">
      <Placeholder>{children}</Placeholder>
    </p>
  );
}

/** Daftar kartu + filter kategori + lightbox. Dipakai untuk sertifikat dan prestasi. */
function CredentialSection({ items, categories, layoutId, emptyText }) {
  const [category, setCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState(null);

  const tabs = [
    { key: 'all', label: 'Semua', count: items.filter((i) => !i.placeholder).length },
    ...categories.map((c) => ({
      key: c.key,
      label: c.label,
      count: items.filter((i) => !i.placeholder && i.categoryKey === c.key).length,
    })),
  ];
  const shown = category === 'all' ? items : items.filter((i) => i.categoryKey === category);

  return (
    <>
      <Tabs tabs={tabs} value={category} onChange={setCategory} label="Filter kategori" layoutId={layoutId} />
      <div className="mt-12 md:mt-16">
        {shown.length ? (
          <div key={category} className="grid grid-cols-12 gap-x-4 gap-y-14 md:gap-y-16">
            {shown.map((item, i) => (
              <CredentialCard key={item.id} item={item} index={i} onOpen={() => setOpenIndex(i)} />
            ))}
          </div>
        ) : (
          <EmptyNote>{emptyText}</EmptyNote>
        )}
      </div>
      <CredentialLightbox items={shown} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}

function Testimonials({ data }) {
  const [type, setType] = useState('all');
  const [writing, setWriting] = useState(false);
  const tabs = [
    { key: 'all', label: 'Semua', count: data.filter((t) => !t.placeholder).length },
    ...testimonialTypes.map((t) => ({
      key: t.key,
      label: t.label,
      count: data.filter((x) => !x.placeholder && x.type === t.key).length,
    })),
  ];
  const shown = type === 'all' ? data : data.filter((t) => t.type === type);

  return (
    <>
      <div className="flex flex-col gap-5 border border-ink p-5 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-small text-ink-soft">
          Pernah bekerja atau berinteraksi dengan saya? Bagikan pengalamanmu. Testimoni akan ditinjau pemilik portofolio sebelum ditampilkan.
        </p>
        <Button onClick={() => setWriting((v) => !v)} size="sm" className="shrink-0" aria-expanded={writing}>
          <PenLine size={14} strokeWidth={1.75} aria-hidden />
          {writing ? 'Tutup formulir' : 'Tulis testimoni'}
        </Button>
      </div>

      {writing && (
        <TestimonialForm
          className="mt-6"
          onSubmit={submitTestimonial}
          simulated={!usesSupabaseData}
          onClose={() => setWriting(false)}
        />
      )}

      <div className="mt-12">
        <Tabs tabs={tabs} value={type} onChange={setType} label="Filter jenis testimoni" layoutId="tab-testimoni" />
      </div>
      <div key={type} className="mt-12 grid grid-cols-12 gap-x-4 gap-y-14 md:mt-16 md:gap-y-20">
        {shown.map((item, i) => {
          const meta = testimonialTypes.find((t) => t.key === item.type);
          return <TestimonialItem key={item.id} item={item} index={i} typeLabel={meta.label} roleHint={meta.roleHint} />;
        })}
      </div>
    </>
  );
}

function CertificatesContent({ data: [certs, achs, testimonials] }) {
  const certItems = useMemo(
    () => sortByDateDesc(certs, 'issuedAt').map((c) => ({ ...certificateView(c), categoryKey: c.category })),
    [certs],
  );
  const achItems = useMemo(
    () => sortByDateDesc(achs, 'achievedAt').map((a) => ({ ...achievementView(a), categoryKey: a.category })),
    [achs],
  );

  return (
    <section className="pb-section pt-14 md:pt-20">
      <Container>
        {/* Pintasan antarbagian */}
        <nav aria-label="Bagian halaman" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-ink pb-4">
          {sections.map((s) => (
            <TextLink key={s.id} href={`#${s.id}`} className="label">
              <span className="text-ink">{s.index}</span> {s.label}
            </TextLink>
          ))}
        </nav>

        <div className="mt-16 space-y-28 md:mt-24 md:space-y-44">
          <div id="sertifikat-daftar" className="scroll-mt-24">
            <ContentBlock index="01" title="Sertifikat" size="lg">
              <CredentialSection
                items={certItems}
                categories={certificateCategories}
                layoutId="tab-sertifikat"
                emptyText="Belum ada sertifikat pada kategori ini"
              />
            </ContentBlock>
          </div>

          <div id="prestasi-daftar" className="scroll-mt-24">
            <ContentBlock index="02" title="Prestasi" size="lg">
              <CredentialSection
                items={achItems}
                categories={achievementCategories}
                layoutId="tab-prestasi"
                emptyText="Belum ada prestasi pada kategori ini"
              />
            </ContentBlock>
          </div>

          <div id="testimoni" className="scroll-mt-24">
            <ContentBlock index="03" title="Testimoni" size="lg">
              <Testimonials data={testimonials} />
            </ContentBlock>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function Certificates() {
  const state = useAsyncData(() => Promise.all([getCertificates(), getAchievements(), getTestimonials()]));

  return (
    <>
      <PageHeader pageKey="sertifikat" description="Sertifikat, prestasi, dan testimoni — lengkap dengan pratinjau gambar." />
      <DataBoundary state={state}>{(data) => <CertificatesContent data={data} />}</DataBoundary>
    </>
  );
}
