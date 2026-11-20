import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Instagram, Linkedin } from 'lucide-react';
import { sectionPages } from '@/data';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSite } from '@/hooks/useSite';
import { getContact } from '@/services/portfolioService';
import Container from '@/components/ui/Container';
import Reveal from '@/components/motion/Reveal';

const socialIcons = { github: Github, instagram: Instagram, linkedin: Linkedin };

export default function Footer() {
  const site = useSite();
  const year = new Date().getFullYear();
  const { data: contact } = useAsyncData(getContact, []);
  const socials = contact?.socials ?? [];

  return (
    <footer className="relative z-10 border-t border-ink bg-paper">
      <Container className="pb-24 pt-16 md:pb-28 md:pt-24">
        <div className="grid grid-cols-12 gap-x-4 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <p className="label">Portofolio</p>
            <p className="mt-4 max-w-sm text-lead">
              {site.name}. {site.className}, {site.school}.
            </p>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3">
                {socials.map((social) => {
                  const Icon = socialIcons[social.id] ?? ArrowUpRight;
                  return (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${social.label} (tab baru)`}
                        className="inline-flex h-11 w-11 items-center justify-center border border-line-strong transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                      >
                        <Icon size={18} strokeWidth={1.5} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
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
