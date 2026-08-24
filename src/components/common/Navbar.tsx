import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck 
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

  // Simplified core navigation links
  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.majors'), path: '/#jurusan', hash: 'jurusan' },
    { name: language === 'id' ? 'Alur & Syarat' : 'Admission Guide', path: '/#alur', hash: 'alur' },
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 1. BRAND LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs group-hover:bg-teal-700 transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
              SPMB Online
            </span>
            <span className="text-[10px] text-teal-700 font-semibold block leading-tight mt-0.5">
              SMKN 1 Digital
            </span>
          </div>
        </Link>

        {/* 2. SIMPLE CENTER NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive(link)
                  ? 'text-teal-700 bg-teal-50/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. CLEAN RIGHT ACTIONS */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Cek Status Link */}
          <Link
            to="/cek-status"
            className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {t('nav.checkStatus')}
          </Link>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Ganti Bahasa"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          {/* Admin Icon Link */}
          {user ? (
            <Link to="/admin">
              <Button size="sm" variant="outline" className="h-9 px-3 text-xs border-teal-200 bg-teal-50 text-teal-800 font-semibold gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>Admin</span>
              </Button>
            </Link>
          ) : (
            <Link to="/admin/login" title="Portal Panitia">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Primary CTA */}
          <Link to="/daftar">
            <Button size="sm" className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs">
              <span>{t('nav.register')}</span>
            </Button>
          </Link>
        </div>

        {/* 4. MOBILE HAMBURGER TOGGLE */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-md"
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
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
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
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('nav.checkStatus')}
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-10">
                {t('nav.register')}
              </Button>
            </Link>

            {user ? (
              <div className="flex gap-2">
                <Link to="/admin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-semibold h-9">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-xs text-red-600 h-9 px-3"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-xs text-slate-500 h-9 gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Portal Panitia</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
