import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight,
  ChevronDown,
  Search,
  FileCheck2,
  HelpCircle,
  Trophy,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { useSchool } from '@/context/SchoolContext';

export const Navbar: React.FC = () => {
  const { isOpen: isRegistrationOpen } = useRegistrationStatus();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { school } = useSchool();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // Handle hash scrolling when navigating to an anchor
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, [location]);

  // Close mobile menu & dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHashNav = (e: React.MouseEvent, hash: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const elem = document.getElementById(hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${hash}`);
      }
    } else {
      navigate(`/#${hash}`);
    }
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/' && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const isHomeActive = location.pathname === '/' && !location.hash;
  const isJurusanActive = location.pathname === '/' && location.hash === '#jurusan';
  const isAlurActive = location.pathname === '/' && location.hash === '#alur';
  const isAnnouncementsActive = location.pathname.startsWith('/pengumuman');
  const isRankingActive = location.hash === '#ranking' || location.hash === '#peringkat' || location.pathname === '/peringkat';
  const isSyaratActive = location.hash === '#syarat';
  const isFaqActive = location.hash === '#faq';
  const isTentangActive = location.hash === '#tentang';
  const isInfoActive = isRankingActive || isSyaratActive || isFaqActive || isTentangActive;
  const isCheckStatusActive = location.pathname.startsWith('/cek-status') || location.pathname.startsWith('/status');

  return (
    <>
      {/* Ticker bar (opsional, hanya kredensial resmi): NPSN: 20109988 · Akreditasi: A (Unggul) */}
      <div className="bg-[#0f172a] text-slate-300 border-b border-slate-800 text-[11px] sm:text-xs py-1.5 px-4 font-mono select-none">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-center gap-2 sm:gap-2.5 text-center">
          <span className="text-slate-400">NPSN: <strong className="text-slate-100 font-semibold">{school?.npsn || '20109988'}</strong></span>
          <span className="text-slate-600 select-none">·</span>
          <span className="text-slate-400">Akreditasi: <strong className="text-teal-400 font-semibold">{t('topStrip.accreditationVal') || 'A (Unggul)'}</strong></span>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-all">
        <div className="w-full max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* [Logo + Nama Sekolah] */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group shrink-0 select-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs group-hover:border-teal-500 group-hover:shadow-xs transition-all overflow-hidden p-1">
              <img 
                src={school?.logo_url || "/images/logo-icon.png"} 
                alt="Logo Sekolah" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo-icon.png';
                }}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {school?.name || 'SMK Negeri 1 Digital Teknologi'}
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium leading-none mt-0.5">
                SPMB Online {school?.academic_year ? `• T.A. ${school.academic_year}` : ''}
              </span>
            </div>
          </Link>

          {/* 2. CENTER NAVIGATION LINKS (DESKTOP) */}
          {/* Beranda · Jurusan · Alur Pendaftaran · Pengumuman · dropdown "Informasi" */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Beranda */}
            <Link
              to="/"
              onClick={handleHomeClick}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHomeActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/80 dark:bg-teal-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
              }`}
            >
              {t('nav.home') || 'Beranda'}
            </Link>

            {/* Jurusan */}
            <Link
              to="/#jurusan"
              onClick={(e) => handleHashNav(e, 'jurusan')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isJurusanActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/80 dark:bg-teal-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
              }`}
            >
              {t('nav.majors') || 'Jurusan'}
            </Link>

            {/* Alur Pendaftaran */}
            <Link
              to="/#alur"
              onClick={(e) => handleHashNav(e, 'alur')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAlurActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/80 dark:bg-teal-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
              }`}
            >
              {t('nav.flow') || 'Alur Pendaftaran'}
            </Link>

            {/* Pengumuman */}
            <Link
              to="/pengumuman"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAnnouncementsActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/80 dark:bg-teal-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
              }`}
            >
              {t('nav.announcements') || 'Pengumuman'}
            </Link>

            {/* Dropdown "Informasi": Ranking, Syarat, FAQ, Tentang Sekolah */}
            <div 
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dropdownOpen || isInfoActive
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
                }`}
              >
                <span>{t('nav.info') || 'Informasi'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-teal-700 dark:text-teal-400' : 'text-slate-400'}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-950 p-1.5 shadow-lg ring-1 ring-slate-900/5 dark:ring-slate-800 border border-slate-100 dark:border-slate-800 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                  <Link
                    to="/#ranking"
                    onClick={(e) => handleHashNav(e, 'ranking')}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isRankingActive
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Trophy className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.ranking') || 'Ranking'}</span>
                  </Link>

                  <Link
                    to="/#syarat"
                    onClick={(e) => handleHashNav(e, 'syarat')}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isSyaratActive
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <FileCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.requirementsShort') || 'Syarat'}</span>
                  </Link>

                  <Link
                    to="/#faq"
                    onClick={(e) => handleHashNav(e, 'faq')}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isFaqActive
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.faqShort') || 'FAQ'}</span>
                  </Link>

                  <Link
                    to="/#tentang"
                    onClick={(e) => handleHashNav(e, 'tentang')}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isTentangActive
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.aboutSchool') || 'Tentang Sekolah'}</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* 3. RIGHT HEADER ACTIONS (DESKTOP) */}
          {/* [Theme Toggle] [ID|EN] [Cek Status] [Daftar Sekarang] */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-teal-600" />
              )}
            </button>

            {/* [ID|EN] Bilingual Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 text-xs font-mono transition-colors"
              title={language === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
              aria-label="Toggle language"
            >
              <span className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                language === 'id' 
                  ? 'bg-white dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-400 shadow-2xs' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}>
                ID
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-[10px] px-0.5 select-none">|</span>
              <span className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                language === 'en' 
                  ? 'bg-white dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-400 shadow-2xs' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}>
                EN
              </span>
            </button>

            {/* [Cek Status] */}
            <Link
              to="/cek-status"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-all ${
                isCheckStatusActive ? 'text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700' : ''
              }`}
            >
              <Search className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t('nav.checkStatus') || 'Cek Status'}</span>
            </Link>

            {/* [Daftar Sekarang] or [Pendaftaran Ditutup] */}
            {!isRegistrationOpen ? (
              <Button 
                size="sm" 
                disabled 
                className="h-9 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed shadow-none select-none"
              >
                Pendaftaran Ditutup
              </Button>
            ) : (
              <Link to="/daftar">
                <Button size="sm" className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs gap-1.5 group">
                  <span>{t('nav.register') || 'Daftar Sekarang'}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            )}
          </div>

          {/* 4. MOBILE HAMBURGER & CONTROLS */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Theme Toggle Button (Mobile) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-teal-600" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 text-xs font-mono"
              aria-label="Toggle language"
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${language === 'id' ? 'bg-white dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}>ID</span>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">|</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${language === 'en' ? 'bg-white dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}>EN</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE RESPONSIVE DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-1 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              {/* Beranda */}
              <Link
                to="/"
                onClick={handleHomeClick}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isHomeActive
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {t('nav.home')}
              </Link>

              {/* Jurusan */}
              <Link
                to="/#jurusan"
                onClick={(e) => handleHashNav(e, 'jurusan')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isJurusanActive
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {t('nav.majors')}
              </Link>

              {/* Alur Pendaftaran */}
              <Link
                to="/#alur"
                onClick={(e) => handleHashNav(e, 'alur')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isAlurActive
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {t('nav.flow')}
              </Link>

              {/* Pengumuman */}
              <Link
                to="/pengumuman"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isAnnouncementsActive
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {t('nav.announcements')}
              </Link>

              {/* Dropdown "Informasi" items in Mobile */}
              <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('nav.info')}
                </span>
                <div className="mt-1 space-y-1">
                  {/* Ranking */}
                  <Link
                    to="/#ranking"
                    onClick={(e) => handleHashNav(e, 'ranking')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                      isRankingActive
                        ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Trophy className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.ranking')}</span>
                  </Link>

                  {/* Syarat */}
                  <Link
                    to="/#syarat"
                    onClick={(e) => handleHashNav(e, 'syarat')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                      isSyaratActive
                        ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <FileCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.requirementsShort') || 'Syarat'}</span>
                  </Link>

                  {/* FAQ */}
                  <Link
                    to="/#faq"
                    onClick={(e) => handleHashNav(e, 'faq')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                      isFaqActive
                        ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.faqShort') || 'FAQ'}</span>
                  </Link>

                  {/* Tentang Sekolah */}
                  <Link
                    to="/#tentang"
                    onClick={(e) => handleHashNav(e, 'tentang')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                      isTentangActive
                        ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t('nav.aboutSchool') || 'Tentang Sekolah'}</span>
                  </Link>
                </div>
              </div>

              {/* Cek Status */}
              <Link
                to="/cek-status"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 ${
                  isCheckStatusActive
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <Search className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{t('nav.checkStatus')}</span>
              </Link>
            </nav>

            {/* Primary Mobile CTA */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {!isRegistrationOpen ? (
                <Button 
                  disabled 
                  className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold h-10 rounded-lg text-sm shadow-none cursor-not-allowed select-none"
                >
                  Pendaftaran Ditutup
                </Button>
              ) : (
                <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-10 rounded-lg text-sm gap-1.5 shadow-sm">
                    <span>{t('nav.register')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
