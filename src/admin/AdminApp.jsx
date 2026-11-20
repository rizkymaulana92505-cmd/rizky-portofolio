import { Route, Routes } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import RequireAdmin from './auth/RequireAdmin';
import { ToastProvider } from './components/Toast';
import { resources } from './config/resources';
import AdminLayout from './layout/AdminLayout';
import AdminNotFound from './pages/AdminNotFound';
import LoginPage from './pages/LoginPage';
import MessagesPage from './pages/MessagesPage';
import OverviewPage from './pages/OverviewPage';
import ResourcePage from './pages/ResourcePage';
import SettingsPage from './pages/SettingsPage';
import SocialLinksPage from './pages/SocialLinksPage';

/**
 * Seluruh area /admin. Dimuat lazy dari router publik, sehingga supabase-js dan kode
 * dashboard tidak ikut ke bundle pengunjung. Dibungkus AuthProvider + ToastProvider.
 */
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<OverviewPage />} />
              {resources.map((r) => (
                <Route key={r.key} path={r.path} element={<ResourcePage key={r.key} resource={r} />} />
              ))}
              <Route path="tautan" element={<SocialLinksPage />} />
              <Route path="pesan" element={<MessagesPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
