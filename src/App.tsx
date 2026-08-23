import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PublicLayout } from '@/components/common/PublicLayout';
import { HomePage } from '@/pages/HomePage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { RegistrationCardPage } from '@/pages/RegistrationCardPage';
import { StatusCheckPage } from '@/pages/StatusCheckPage';
import { AnnouncementListPage } from '@/pages/AnnouncementListPage';
import { AnnouncementDetailPage } from '@/pages/AnnouncementDetailPage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from '@/pages/admin/AdminStudentsPage';
import { AdminSelectionPage } from '@/pages/admin/AdminSelectionPage';
import { AdminMajorsPage } from '@/pages/admin/AdminMajorsPage';
import { AdminSourceSchoolsPage } from '@/pages/admin/AdminSourceSchoolsPage';
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
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
            </Route>

            {/* 2. ADMIN AUTH ROUTE */}
            <Route path="/admin/login" element={<LoginPage />} />

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
              <Route path="pendaftar" element={<AdminStudentsPage />} />
              <Route path="seleksi" element={<AdminSelectionPage />} />
              <Route path="jurusan" element={<AdminMajorsPage />} />
              <Route path="sekolah-asal" element={<AdminSourceSchoolsPage />} />
              <Route path="pengumuman" element={<AdminAnnouncementsPage />} />
              <Route path="pengaturan" element={<AdminSettingsPage />} />
            </Route>

            {/* 4. FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
