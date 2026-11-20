import { Link } from 'react-router-dom';
import { sectionPages } from '@/data';
import { useSite } from '@/hooks/useSite';
import Container from '@/components/ui/Container';
import Reveal from '@/components/motion/Reveal';

export default function Footer() {
  const site = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-ink bg-paper">
      <Container className="pb-24 pt-16 md:pb-28 md:pt-24">
        <div className="grid grid-cols-12 gap-x-4 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <p className="label">Portofolio</p>
            <p className="mt-4 max-w-sm text-lead">
              {site.name}. {site.className}, {site.school}.
            </p>
          </div>

          <nav aria-label="Navigasi footer" className="col-span-12 md:col-span-5 md:col-start-7">
            <p className="label">Halaman</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {sectionPages.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="flex items-baseline gap-3 py-2 transition-colors hover:text-mute"
                  >
                    <span className="label">{item.index}</span>
                    <span className="font-display text-xl font-bold uppercase tracking-tight">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Reveal variant="fade" className="mt-16 md:mt-24">
          <p
            aria-hidden
            className="select-none overflow-hidden whitespace-nowrap font-display text-[10.5vw] font-extrabold uppercase leading-[0.8] tracking-[-0.05em] font-stretch-display"
          >
            {site.shortName}
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label">© {year} {site.name}</p>
          <p className="label">Dibuat dengan React + Vite</p>
        </div>
      </Container>
    </footer>
  );
}
