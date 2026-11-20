import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GridGuides from '@/components/layout/GridGuides';
import BackToTop from '@/components/layout/BackToTop';
import TestimonialLauncher from '@/components/credential/TestimonialLauncher';
import Loading from '@/components/ui/Loading';
import { SiteProvider } from '@/hooks/useSite';

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <SiteProvider>
    <div className="relative flex min-h-screen flex-col">
      <a href="#konten" className="skip-link">Lewati ke konten</a>
      <GridGuides />
      <Navbar />
      <main id="konten" className="relative z-10 flex-1 pt-nav">
        <Suspense fallback={<Loading />}>
          <motion.div key={pathname} {...pageTransition}>
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <TestimonialLauncher />
      <BackToTop />
    </div>
    </SiteProvider>
  );
}
