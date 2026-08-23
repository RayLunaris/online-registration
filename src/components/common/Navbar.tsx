import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const configured = isSupabaseConfigured();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Jurusan', path: '/#jurusan' },
    { name: 'Syarat', path: '/#syarat' },
    { name: 'Alur Pendaftaran', path: '/#alur' },
    { name: 'Pengumuman', path: '/pengumuman' },
    { name: 'Cek Status', path: '/cek-status' },
    { name: 'FAQ', path: '/#faq' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md">
      {/* Top Banner if Supabase not configured */}
      {!configured && (
        <div className="bg-amber-500 text-white text-xs py-1 px-4 text-center font-medium">
          Mode Demo Lokal: Konfigurasi <code>.env</code> dengan URL & Anon Key Supabase untuk sinkronisasi database langsung.
        </div>
      )}

      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg block leading-none">SPMB Online</span>
            <span className="text-xs text-slate-500 block leading-tight">SMK Negeri 1 Digital</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/cek-status">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Cek Status
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                  Dashboard Admin
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => signOut()} className="text-xs text-red-600">
                Keluar
              </Button>
            </div>
          ) : (
            <Link to="/admin/login">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 hover:text-blue-600">
                <ShieldCheck className="h-4 w-4" />
                Portal Admin
              </Button>
            </Link>
          )}

          <Link to="/daftar">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-600/30">
              Daftar Sekarang
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-2 border-t flex flex-col gap-2">
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/cek-status" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Cek Status Pendaftaran
              </Button>
            </Link>
            <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-xs text-slate-500">
                Portal Admin / Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
