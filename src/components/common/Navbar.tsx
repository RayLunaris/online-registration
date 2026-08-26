import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.majors'), path: '/#jurusan', hash: 'jurusan' },
    { name: language === 'id' ? 'Alur Daftar' : 'How to Apply', path: '/#alur', hash: 'alur' },
    { name: language === 'id' ? 'Syarat Berkas' : 'Requirements', path: '/#syarat', hash: 'syarat' },
    { name: t('nav.announcements'), path: '/pengumuman' },
  ];

  const handleNavClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    if (link.hash) {
      if (location.pathname === '/') {
        e.preventDefault();
        const elem = document.getElementById(link.hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${link.hash}`);
        }
      } else {
        navigate(`/#${link.hash}`);
      }
    }
    setMobileMenuOpen(false);
  };

  const isActive = (link: typeof navLinks[0]) => {
    if (link.path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (link.hash) {
      return location.pathname === '/' && location.hash === `#${link.hash}`;
    }
    return location.pathname.startsWith(link.path);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-8 lg:px-12">
        
        {/* 1. BRAND LOGO (Left) */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs group-hover:bg-teal-700 transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-none">
                SPMB Online
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded leading-none hidden sm:inline">
                2026/2027
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block leading-tight mt-0.5">
              SMK Negeri 1 Digital
            </span>
          </div>
        </Link>

        {/* 2. CENTER NAVIGATION LINKS (Minimalist Text Links) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive(link)
                  ? 'text-teal-700 font-bold bg-teal-50/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. RIGHT ACTIONS (Minimalist Actions) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Cek Status Link */}
          <Link
            to="/cek-status"
            className="text-xs font-medium text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {t('nav.checkStatus')}
          </Link>

          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors font-mono"
            title="Ganti Bahasa"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          {/* Admin Icon Link */}
          {user ? (
            <Link to="/admin">
              <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-teal-200 bg-teal-50/70 text-teal-700 font-semibold rounded-lg gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Button>
            </Link>
          ) : (
            <Link to="/admin/login" title="Portal Panitia SPMB">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Primary Teal CTA */}
          <Link to="/daftar">
            <Button size="sm" className="h-9 px-4.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs gap-1.5 group">
              <span>{t('nav.register')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* 4. MOBILE HAMBURGER TOGGLE */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-md font-mono"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-1 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive(link)
                    ? 'text-teal-700 bg-teal-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/cek-status"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('nav.checkStatus')}
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-10 rounded-lg text-xs">
                {t('nav.register')}
              </Button>
            </Link>

            {user ? (
              <div className="flex gap-2">
                <Link to="/admin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-semibold h-9 rounded-lg">
                    Dashboard Admin
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-xs text-red-600 h-9 px-3 rounded-lg"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-xs text-slate-500 h-9 rounded-lg gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Portal Panitia / Admin</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
