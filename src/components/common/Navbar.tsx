import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight,
  Code2,
  Network,
  Palette,
  Calculator,
  Route,
  FileCheck2,
  CalendarDays,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useLanguage } from '@/context/LanguageContext';
import { schoolService, DEFAULT_MAJORS } from '@/services/schoolService';
import { School, Major } from '@/types/spmb';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'jurusan' | 'panduan' | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>(DEFAULT_MAJORS);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // Load school profile & leaderboard toggle setting (PRD 5.5.5 & 5.6)
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = () => {
      schoolService.getSchoolProfile().then((profile) => {
        if (isMounted && profile) {
          setSchool(profile);
          setShowLeaderboard(profile.show_public_leaderboard !== false);
        }
      }).catch(() => {
        if (isMounted) setShowLeaderboard(true);
      });

      schoolService.getMajors().then((data) => {
        if (isMounted && data && data.length > 0) {
          setMajors(data.filter(m => m.is_active));
        }
      }).catch(() => {});
    };

    fetchMetadata();

    const handleSettingsUpdate = () => {
      fetchMetadata();
    };

    window.addEventListener('school_settings_updated', handleSettingsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('school_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Handle hash scrolling
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpandedSection(null);
  }, [location.pathname]);

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
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  // Helper icons for majors
  const getMajorIcon = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'RPL':
        return <Code2 className="h-4 w-4 text-cyan-700" />;
      case 'TKJ':
        return <Network className="h-4 w-4 text-indigo-700" />;
      case 'DKV':
        return <Palette className="h-4 w-4 text-amber-700" />;
      case 'AKL':
        return <Calculator className="h-4 w-4 text-emerald-700" />;
      default:
        return <BookOpen className="h-4 w-4 text-teal-700" />;
    }
  };

  const getMajorBadgeColor = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'RPL':
        return 'bg-cyan-50 border-cyan-200/70 text-cyan-800';
      case 'TKJ':
        return 'bg-indigo-50 border-indigo-200/70 text-indigo-800';
      case 'DKV':
        return 'bg-amber-50 border-amber-200/70 text-amber-800';
      case 'AKL':
        return 'bg-emerald-50 border-emerald-200/70 text-emerald-800';
      default:
        return 'bg-teal-50 border-teal-200/70 text-teal-800';
    }
  };

  // 6 Information cards (PRD 5.1.1 & 5.1.2) - structured like bundui navigation-menu4 accessories panel
  const guideMenuItems = [
    {
      title: language === 'id' ? 'Alur Pendaftaran' : 'Admission Steps',
      description: language === 'id' ? '4 tahapan registrasi daring' : '4 easy steps to register online',
      icon: Route,
      hash: 'alur',
      badge: 'Step by Step',
      color: 'text-teal-700 bg-teal-50 border-teal-200/60'
    },
    {
      title: language === 'id' ? 'Syarat & Dokumen' : 'Requirements',
      description: language === 'id' ? 'Rapor, pas foto, KK & ijazah' : 'Report card, photo, & family card',
      icon: FileCheck2,
      hash: 'syarat',
      badge: 'Berkas Wajib',
      color: 'text-blue-700 bg-blue-50 border-blue-200/60'
    },
    {
      title: language === 'id' ? 'Simulasi Seleksi' : 'Score Simulator',
      description: language === 'id' ? 'Bobot 70% rapor + 30% sertifikat' : 'Weight: 70% report + 30% awards',
      icon: Calculator,
      hash: 'simulasi',
      badge: 'Kalkulator',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
    },
    {
      title: language === 'id' ? 'Jadwal & Gelombang' : 'Schedule & Dates',
      description: language === 'id' ? 'Timeline gelombang pendaftaran' : 'Registration waves & deadline',
      icon: CalendarDays,
      hash: 'jadwal',
      badge: 'Kalender',
      color: 'text-amber-700 bg-amber-50 border-amber-200/60'
    },
    {
      title: language === 'id' ? 'Tanya Jawab (FAQ)' : 'FAQ & Support',
      description: language === 'id' ? 'Jawaban pertanyaan umum SPMB' : 'Frequently asked questions',
      icon: HelpCircle,
      hash: 'faq',
      badge: 'Bantuan',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200/60'
    },
    {
      title: language === 'id' ? 'Cek Kelulusan' : 'Check Status',
      description: language === 'id' ? 'Transparansi hasil & cetak PDF' : 'Verify results & download PDF',
      icon: ShieldCheck,
      path: '/cek-status',
      badge: 'Hasil Seleksi',
      color: 'text-rose-700 bg-rose-50 border-rose-200/60'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="w-full max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-8 lg:px-12">
        
        {/* 1. BRAND LOGO & SCHOOL IDENTITY (PRD 5.1.1) */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/90 shadow-xs group-hover:border-teal-400 group-hover:shadow-sm transition-all overflow-hidden p-1">
            <img 
              src={school?.logo_url || "/images/logo-icon.png"} 
              alt="Logo SPMB" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-none">
                SPMB Online
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-1.5 py-0.5 rounded leading-none hidden sm:inline">
                {school?.academic_year || '2026/2027'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block leading-tight mt-0.5">
              {school?.name || 'SMK Negeri 1 Digital'}
            </span>
          </div>
        </Link>

        {/* 2. ANIMATED NAVIGATION MENU (Bundui / 21st.dev navigation-menu4 pattern) */}
        <nav className="hidden lg:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              
              {/* ITEM 1: BERANDA */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={`${navigationMenuTriggerStyle()} ${
                      location.pathname === '/' && !location.hash
                        ? 'text-teal-800 bg-teal-50/80 font-bold'
                        : ''
                    }`}
                  >
                    {t('nav.home')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* ITEM 2: JURUSAN & KEAHLIAN (Mega Menu Panel with Featured Card - Bundui Collections style) */}
              <NavigationMenuItem value="jurusan">
                <NavigationMenuTrigger className="text-slate-700 font-medium">
                  <span>{t('nav.majors')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[680px] lg:w-[760px] grid-cols-12 gap-4 p-4">
                    
                    {/* Left 7 Cols: List of Vocational Majors */}
                    <div className="col-span-7 flex flex-col justify-between space-y-2">
                      <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                          {language === 'id' ? 'Pilihan Program Keahlian' : 'Vocational Majors'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {language === 'id' ? 'Kurikulum Industri' : 'Industry Curriculum'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {majors.slice(0, 4).map((m) => (
                          <Link
                            key={m.id || m.code}
                            to="/#jurusan"
                            onClick={(e) => handleHashNav(e, 'jurusan')}
                            className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-teal-50/70 border border-transparent hover:border-teal-100 transition-all text-left"
                          >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${getMajorBadgeColor(m.code)}`}>
                              {getMajorIcon(m.code)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                                  {m.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {m.code}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                                {m.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0 pt-0.5">
                              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                {m.quota || 108} {language === 'id' ? 'Kursi' : 'Seats'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <Link
                        to="/#jurusan"
                        onClick={(e) => handleHashNav(e, 'jurusan')}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50/60 hover:bg-teal-100/70 rounded-lg transition-colors group mt-1"
                      >
                        <span>{language === 'id' ? 'Lihat Semua Silabus & Fasilitas Jurusan' : 'View Full Curriculum & Labs'}</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>

                    {/* Right 5 Cols: Featured Dual-Choice Card (PRD 5.4 2-Tahap Seleksi) */}
                    <div className="col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-400/20 border border-teal-300/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" />
                          <span>{language === 'id' ? 'Revisi PRD v1.1' : 'PRD v1.1 Dual-Choice'}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-white tracking-tight leading-snug">
                          {language === 'id' ? 'Seleksi 2 Pilihan Jurusan' : 'Dual-Choice Major System'}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {language === 'id'
                            ? 'Siswa bebas mengisi Pilihan 1 & Pilihan 2. Bila kuota pilihan 1 penuh, otomatis dievaluasi di pilihan 2 secara transparan.'
                            : 'Choose 2 preferred majors. Automatically re-evaluated for choice 2 if choice 1 quota is filled.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 relative z-10">
                        <Link to="/daftar">
                          <Button size="sm" className="w-full h-8 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm gap-1.5">
                            <span>{t('nav.register')}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ITEM 3: PANDUAN & INFORMASI (6-Item Grid Panel - Bundui Accessories style) */}
              <NavigationMenuItem value="panduan">
                <NavigationMenuTrigger className="text-slate-700 font-medium">
                  <span>{language === 'id' ? 'Panduan & Info' : 'Guide & Info'}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[580px] lg:w-[640px] p-4">
                    <div className="px-2 pb-2 mb-2 flex items-center justify-between border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {language === 'id' ? 'Panduan Pendaftaran & Informasi Seleksi' : 'Admission Guides & Selection Info'}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        PPDB {school?.academic_year || '2026/2027'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {guideMenuItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isLink = !!item.path;

                        const content = (
                          <div className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100/80 hover:border-teal-200 transition-all text-left h-full">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                                  {item.title}
                                </span>
                                <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );

                        return isLink ? (
                          <NavigationMenuLink asChild key={idx}>
                            <Link to={item.path!}>
                              {content}
                            </Link>
                          </NavigationMenuLink>
                        ) : (
                          <NavigationMenuLink asChild key={idx}>
                            <Link
                              to={`/#${item.hash}`}
                              onClick={(e) => handleHashNav(e, item.hash!)}
                            >
                              {content}
                            </Link>
                          </NavigationMenuLink>
                        );
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ITEM 4: PENGUMUMAN (Direct Link) */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/pengumuman"
                    className={`${navigationMenuTriggerStyle()} ${
                      location.pathname.startsWith('/pengumuman')
                        ? 'text-teal-800 bg-teal-50/80 font-bold'
                        : ''
                    }`}
                  >
                    {t('nav.announcements')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* ITEM 5: PERINGKAT PUBLIK (LEADERBOARD) - PRD 5.6 */}
              {showLeaderboard && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/peringkat"
                      className={`${navigationMenuTriggerStyle()} ${
                        location.pathname === '/peringkat'
                          ? 'text-teal-800 bg-teal-50/80 font-bold'
                          : ''
                      }`}
                    >
                      {t('nav.leaderboard') || (language === 'id' ? 'Lihat Peringkat' : 'Leaderboard')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* 3. RIGHT HEADER ACTIONS (PRD 5.1.2) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Cek Status Link */}
          <Link
            to="/cek-status"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('nav.checkStatus')}</span>
          </Link>

          {/* Bilingual Language Switcher (ID / EN) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors font-mono"
            title={language === 'id' ? 'Ganti ke English' : 'Switch to Indonesian'}
            aria-label="Toggle language"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          {/* Primary Teal CTA: Daftar Sekarang (PRD 5.1.2) */}
          <Link to="/daftar">
            <Button size="sm" className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs gap-1.5 group">
              <span>{t('nav.register')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* 4. MOBILE MENU HAMBURGER & LANGUAGE TOGGLE */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200 rounded-md font-mono"
            aria-label="Toggle language"
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE RESPONSIVE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-1 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            
            {/* Beranda */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                location.pathname === '/' && !location.hash
                  ? 'text-teal-800 bg-teal-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Accordion 1: Jurusan & Keahlian */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'jurusan' ? null : 'jurusan')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>{t('nav.majors')}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${mobileExpandedSection === 'jurusan' ? 'rotate-180' : ''}`} />
              </button>

              {mobileExpandedSection === 'jurusan' && (
                <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                  {majors.map((m) => (
                    <Link
                      key={m.id || m.code}
                      to="/#jurusan"
                      onClick={(e) => handleHashNav(e, 'jurusan')}
                      className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-teal-50 text-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 border text-[10px] font-bold ${getMajorBadgeColor(m.code)}`}>
                          {m.code}
                        </div>
                        <span className="truncate">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded shrink-0">
                        {m.quota} {language === 'id' ? 'Kuota' : 'Quota'}
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/#jurusan"
                    onClick={(e) => handleHashNav(e, 'jurusan')}
                    className="block text-center text-[11px] font-bold text-teal-700 bg-teal-50/60 p-2 rounded-md hover:bg-teal-100/60 transition-colors mt-1"
                  >
                    {language === 'id' ? 'Lihat Semua Silabus & Fasilitas →' : 'View All Majors Details →'}
                  </Link>
                </div>
              )}
            </div>

            {/* Accordion 2: Panduan & Info */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'panduan' ? null : 'panduan')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                  <span>{language === 'id' ? 'Panduan & Info' : 'Guide & Info'}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${mobileExpandedSection === 'panduan' ? 'rotate-180' : ''}`} />
              </button>

              {mobileExpandedSection === 'panduan' && (
                <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                  {guideMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return item.path ? (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-xs"
                      >
                        <Icon className="h-4 w-4 text-teal-700 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    ) : (
                      <Link
                        key={idx}
                        to={`/#${item.hash}`}
                        onClick={(e) => handleHashNav(e, item.hash!)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-xs"
                      >
                        <Icon className="h-4 w-4 text-teal-700 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Berita & Pengumuman */}
            <Link
              to="/pengumuman"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                location.pathname.startsWith('/pengumuman')
                  ? 'text-teal-800 bg-teal-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('nav.announcements')}
            </Link>

            {/* Peringkat Publik (Leaderboard) */}
            {showLeaderboard && (
              <Link
                to="/peringkat"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  location.pathname === '/peringkat'
                    ? 'text-teal-800 bg-teal-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t('nav.leaderboard') || (language === 'id' ? 'Lihat Peringkat' : 'Leaderboard')}
              </Link>
            )}

            {/* Cek Status */}
            <Link
              to="/cek-status"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Search className="h-3.5 w-3.5 text-teal-600" />
              <span>{t('nav.checkStatus')}</span>
            </Link>
          </nav>

          {/* Primary Mobile CTA */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-10 rounded-lg text-xs gap-1.5 shadow-sm">
                <span>{t('nav.register')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
