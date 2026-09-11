import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const location = useLocation();

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
    // Redirect unauthorized visitors to /admin/login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Akses Ditolak</h2>
            <p className="text-sm text-slate-400 mt-1">
              Akun ({user.email}) tidak memiliki hak akses administrator untuk mengakses panel ini.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Ganti Akun Admin
            </button>
            <Link
              to="/"
              className="inline-block py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
