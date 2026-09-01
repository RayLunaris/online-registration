import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PublicLayout } from '@/components/common/PublicLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ADMIN_AUTH_CONFIG } from '@/config/authConfig';

// Helper to retry dynamic chunk import in case of transient network/HMR hiccups
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 400
): React.LazyExoticComponent<T> {
  return React.lazy(
    () =>
      new Promise<{ default: T }>((resolve, reject) => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }
            setTimeout(() => {
              factory()
                .then(resolve)
                .catch((retryErr) => {
                  if (retriesLeft <= 1) {
                    reject(retryErr);
                  } else {
                    setTimeout(() => {
                      factory().then(resolve).catch(reject);
                    }, interval);
                  }
                });
            }, interval);
          });
      })
  );
}

// Route-level code splitting with auto-retry
const HomePage = lazyRetry(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const RegistrationPage = lazyRetry(() => import('@/pages/RegistrationPage').then(m => ({ default: m.RegistrationPage })));
const RegistrationCardPage = lazyRetry(() => import('@/pages/RegistrationCardPage').then(m => ({ default: m.RegistrationCardPage })));
const StatusCheckPage = lazyRetry(() => import('@/pages/StatusCheckPage').then(m => ({ default: m.StatusCheckPage })));
const AnnouncementListPage = lazyRetry(() => import('@/pages/AnnouncementListPage').then(m => ({ default: m.AnnouncementListPage })));
const AnnouncementDetailPage = lazyRetry(() => import('@/pages/AnnouncementDetailPage').then(m => ({ default: m.AnnouncementDetailPage })));
const LoginPage = lazyRetry(() => import('@/pages/admin/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminDashboardPage = lazyRetry(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminStudentsPage = lazyRetry(() => import('@/pages/admin/AdminStudentsPage').then(m => ({ default: m.AdminStudentsPage })));
const AdminStudentDetailPage = lazyRetry(() => import('@/pages/admin/AdminStudentDetailPage').then(m => ({ default: m.AdminStudentDetailPage })));
const AdminSelectionPage = lazyRetry(() => import('@/pages/admin/AdminSelectionPage').then(m => ({ default: m.AdminSelectionPage })));
const AdminMajorsPage = lazyRetry(() => import('@/pages/admin/AdminMajorsPage').then(m => ({ default: m.AdminMajorsPage })));
const AdminSourceSchoolsPage = lazyRetry(() => import('@/pages/admin/AdminSourceSchoolsPage').then(m => ({ default: m.AdminSourceSchoolsPage })));
const AdminAnnouncementsPage = lazyRetry(() => import('@/pages/admin/AdminAnnouncementsPage').then(m => ({ default: m.AdminAnnouncementsPage })));
const AdminSettingsPage = lazyRetry(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
import { NotFoundPage } from '@/pages/NotFoundPage';

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    <span className="text-xs text-slate-500 font-medium">Memuat halaman...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* 1. PUBLIC ROUTES WITH PUBLIC LAYOUT */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/daftar" element={<RegistrationPage />} />
                    
                    {/* Cek Status (both /status and /cek-status) */}
                    <Route path="/status" element={<StatusCheckPage />} />
                    <Route path="/cek-status" element={<StatusCheckPage />} />
                    
                    {/* Kartu Peserta */}
                    <Route path="/kartu-peserta/:regNumber" element={<RegistrationCardPage />} />

                    {/* Pengumuman List & Detail (both :slug and :id) */}
                    <Route path="/pengumuman" element={<AnnouncementListPage />} />
                    <Route path="/pengumuman/:slug" element={<AnnouncementDetailPage />} />

                    {/* Catch all unmatched public routes */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* 2. ADMIN AUTH ROUTE (/admin/login) */}
                  <Route path="/admin/login" element={<LoginPage />} />
                  {ADMIN_AUTH_CONFIG.getLoginPath() !== '/admin/login' && (
                    <Route path={ADMIN_AUTH_CONFIG.getLoginPath()} element={<LoginPage />} />
                  )}

                  {/* 3. PROTECTED ADMIN ROUTES WITH ADMIN LAYOUT */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="pendaftar" element={<AdminStudentsPage />} />
                    <Route path="pendaftar/:id" element={<AdminStudentDetailPage />} />
                    <Route path="siswa" element={<AdminStudentsPage />} />
                    <Route path="siswa/:id" element={<AdminStudentDetailPage />} />
                    <Route path="seleksi" element={<AdminSelectionPage />} />
                    <Route path="jurusan" element={<AdminMajorsPage />} />
                    <Route path="sekolah-asal" element={<AdminSourceSchoolsPage />} />
                    <Route path="pengumuman" element={<AdminAnnouncementsPage />} />
                    <Route path="pengaturan" element={<AdminSettingsPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
