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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* 1. BRAND LOGO (Left) */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D9488] text-white shadow-xs group-hover:bg-teal-700 transition-colors">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
              SPMB Online
            </span>
            <span className="text-[11px] text-[#0D9488] font-bold block leading-tight mt-1">
              SMK Negeri 1 Digital
            </span>
          </div>
        </Link>

        {/* 2. CENTER NAVIGATION LINKS (Middle) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FAFAF9] p-1 rounded-full border border-slate-200/80">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                isActive(link)
                  ? 'text-[#0D9488] bg-teal-50 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. RIGHT ACTIONS (EducateX Style) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Cek Status Link */}
          <Link
            to="/cek-status"
            className="text-xs font-bold text-slate-600 hover:text-[#0D9488] px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            {t('nav.checkStatus')}
          </Link>

          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors font-mono"
            title="Ganti Bahasa"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          {/* Admin Icon Link */}
          {user ? (
            <Link to="/admin">
              <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs border-teal-200 bg-teal-50 text-[#0D9488] font-bold rounded-full gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Button>
            </Link>
          ) : (
            <Link to="/admin/login" title="Portal Panitia">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Solid Teal Rounded-Full Pill CTA */}
          <Link to="/daftar">
            <Button size="sm" className="h-10 px-5 bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-full shadow-xs gap-1.5 group">
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
            className="px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-full font-mono"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold ${
                  isActive(link)
                    ? 'text-[#0D9488] bg-teal-50 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/cek-status"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              {t('nav.checkStatus')}
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold h-11 rounded-full text-xs">
                {t('nav.register')}
              </Button>
            </Link>

            {user ? (
              <div className="flex gap-2">
                <Link to="/admin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold h-10 rounded-full">
                    Dashboard Admin
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-xs text-red-600 h-10 px-4 rounded-full"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-xs text-slate-500 h-10 rounded-full gap-1.5">
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
