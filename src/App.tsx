import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HomePage } from '@/pages/HomePage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { StatusCheckPage } from '@/pages/StatusCheckPage';
import { AnnouncementListPage } from '@/pages/AnnouncementListPage';
import { AnnouncementDetailPage } from '@/pages/AnnouncementDetailPage';
import { LoginPage } from '@/pages/admin/LoginPage';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daftar" element={<RegistrationPage />} />
            <Route path="/cek-status" element={<StatusCheckPage />} />
            <Route path="/pengumuman" element={<AnnouncementListPage />} />
            <Route path="/pengumuman/:slug" element={<AnnouncementDetailPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
