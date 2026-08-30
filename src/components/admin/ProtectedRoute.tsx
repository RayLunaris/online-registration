import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // True 404 Cloaking: unauthorized visitors see a standard 404 page
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <NotFoundPage />
        </main>
        <Footer />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
