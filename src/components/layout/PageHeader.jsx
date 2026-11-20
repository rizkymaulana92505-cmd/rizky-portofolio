import { getPage } from '@/data';
import { usePageTitle } from '@/hooks/usePageTitle';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

/** Kepala halaman standar (judul <h1> editorial + meta dari navigation.js). */
export default function PageHeader({ pageKey, title, description }) {
  const page = getPage(pageKey);
  usePageTitle(title ?? page.label);

  return (
    <section className="pt-16 md:pt-24">
      <Container>
        <SectionHeading
          as="h1"
          index={page.index}
          eyebrow={page.eyebrow}
          title={title ?? page.label}
          description={description ?? page.description}
        />
      </Container>
    </section>
  );
}
