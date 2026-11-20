import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { pages, primaryNav } from '@/data';
import { useSite } from '@/hooks/useSite';
import { getInitials } from '@/lib/site';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/cn';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const site = useSite();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();

  // Tutup menu saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  // Kunci scroll & dukung tombol Escape saat menu terbuka
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-nav border-b border-line bg-paper/90 backdrop-blur">
        <Container className="flex h-full items-center justify-between">
          {/* Logo: monogram inisial + nama */}
          <Link to="/" className="group flex items-center gap-3" aria-label={`${site.name} — Beranda`}>
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center border border-ink bg-ink font-display text-sm font-extrabold tracking-tight text-paper transition-colors duration-300 ease-editorial group-hover:bg-paper group-hover:text-ink"
            >
              {getInitials(site.shortName)}
            </span>
            <span className="hidden font-display text-base font-bold uppercase tracking-tight xs:block">
              {site.shortName}
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 lg:flex">
            {primaryNav.map((item) => (
              <NavLink key={item.key} to={item.path} className="group relative py-2">
                {({ isActive }) => (
                  <>
                    {/* indikator halaman aktif: titik + garis bawah */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-3 top-1/2 h-1 w-1 -translate-y-1/2 bg-ink transition-transform duration-300 ease-editorial',
                        isActive ? 'scale-100' : 'scale-0',
                      )}
                    />
                    <span
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-mute group-hover:text-ink',
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ink transition-transform duration-300 ease-editorial',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
            <ThemeToggle />
            <Button to="/cv" variant={pathname === '/cv' ? 'primary' : 'outline'} size="sm">CV</Button>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-seluler"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              className="flex h-10 w-10 items-center justify-center border border-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </Container>

        {/* progres baca halaman */}
        <motion.span
          aria-hidden
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-ink"
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-seluler"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper pt-nav lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <Container className="flex-1 py-8">
              <ul>
                {pages.map((item, i) => (
                  <motion.li
                    key={item.key}
                    className="border-t border-line last:border-b"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.05 + i * 0.04 }}
                  >
                    <NavLink to={item.path} end={item.path === '/'} className="group flex items-center gap-4 py-4">
                      {({ isActive }) => (
                        <>
                          <span className="label w-6 shrink-0 text-ink">{item.index}</span>
                          <span
                            className={cn(
                              'font-display text-4xl font-extrabold uppercase tracking-tight transition-transform duration-300 ease-editorial group-hover:translate-x-2',
                              isActive ? 'text-ink' : 'text-ink/40 group-hover:text-ink',
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="ml-auto flex items-center gap-2">
                            {isActive && <span aria-hidden className="h-2 w-2 bg-ink" />}
                            <ArrowUpRight
                              size={20}
                              strokeWidth={1.5}
                              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            />
                          </span>
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </Container>
            <Container className="pb-8">
              <p className="label">{site.className} — {site.school}</p>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
