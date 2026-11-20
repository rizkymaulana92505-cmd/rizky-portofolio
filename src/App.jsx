import { MotionConfig } from 'framer-motion';
import AppRoutes from '@/routes';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function App() {
  return (
    // reducedMotion="user" → hormati preferensi "kurangi gerakan" di perangkat
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </MotionConfig>
  );
}
