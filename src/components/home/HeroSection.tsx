import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Star, 
  GraduationCap, 
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { School } from '@/types/spmb';
import { useLanguage } from '@/context/LanguageContext';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

interface HeroSectionProps {
  school: School | null;
  majorsCount?: number;
  totalQuota?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  school, 
  majorsCount = 4
}) => {
  const { isOpen: isRegistrationOpen } = useRegistrationStatus();
  const [quickReg, setQuickReg] = useState('');
  const { t } = useLanguage();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReg.trim()) return;
    window.location.href = `/cek-status?reg=${encodeURIComponent(quickReg.trim())}`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4]/70 via-[#F2FBF7]/30 to-[#FAFAF9] dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 pt-6 pb-12 lg:pt-12 lg:pb-20 border-b border-slate-200/70 dark:border-slate-800 transition-colors">
      {/* Mint Glowing Ambient Backgrounds */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[26rem] h-[26rem] rounded-full bg-[#99F6E4]/25 dark:bg-teal-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 -ml-20 w-72 h-72 rounded-full bg-[#A7F3D0]/20 dark:bg-emerald-600/10 blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Content & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left order-2 lg:order-1">
            
            {/* Top Pill Eyebrow Badge - Ringkas */}
            {isRegistrationOpen ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-teal-800/80 shadow-2xs backdrop-blur-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-pulse" />
                <span className="text-xs font-bold text-[#0D9488] dark:text-teal-400 tracking-wide">
                  {t('hero.badge')}
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  {t('hero.badgeSub')}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-red-200 dark:border-red-800 shadow-2xs backdrop-blur-xs">
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-red-700 dark:text-red-400 tracking-wide">
                  Pendaftaran Periode Ini Telah Ditutup
                </span>
              </div>
            )}

            {/* Main Headline - Ringkas & Bertenaga */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                {t('hero.titlePrefix')}{' '}
                <span className="relative inline-block text-[#0D9488] dark:text-teal-400">
                  {t('hero.titleHighlight')}
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 120 8" preserveAspectRatio="none" fill="none">
                    <path d="M0 5C25 1 50 7 75 3C95 0 115 6 120 3" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-normal">
                {t('hero.descPrefix')}{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</strong>. {t('hero.descSuffix')}
              </p>
            </div>

            {/* Action Buttons - Ringkas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-0.5">
              {!isRegistrationOpen ? (
                <Button 
                  disabled 
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-7 border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm rounded-full cursor-not-allowed shadow-none select-none"
                >
                  <span>Pendaftaran Ditutup</span>
                </Button>
              ) : (
                <Link to="/daftar">
                  <Button className="w-full sm:w-auto h-11 px-7 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all gap-2 group">
                    <span>{t('hero.btnRegister')}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}

              <a href="#jurusan">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-6 border border-slate-200 dark:border-slate-800 hover:border-[#0D9488] dark:hover:border-teal-400 text-slate-700 dark:text-slate-200 hover:text-[#0D9488] dark:hover:text-teal-400 font-bold text-xs sm:text-sm rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-teal-50/50 dark:hover:bg-teal-950/50 transition-all">
                  {t('hero.btnMajors')}
                </Button>
              </a>
            </div>

            {/* Integrated Quick Status Search & Social Proof */}
            <div className="pt-2 space-y-3 max-w-md">
              <form onSubmit={handleQuickSearch} className="flex items-center gap-2 p-1.5 bg-white/95 dark:bg-slate-900/95 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs focus-within:ring-2 focus-within:ring-[#0D9488]/30 focus-within:border-[#0D9488] transition-all">
                <div className="flex items-center gap-2 pl-2.5 flex-1 min-w-0">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-quick-reg-search" className="sr-only">Nomor Registrasi</label>
                  <input
                    id="hero-quick-reg-search"
                    name="quickReg"
                    type="text"
                    placeholder={t('hero.searchPlaceholder')}
                    value={quickReg}
                    onChange={(e) => setQuickReg(e.target.value.toUpperCase())}
                    autoComplete="off"
                    aria-label="Nomor Registrasi SPMB"
                    className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <Button 
                  type="submit"
                  size="sm"
                  className="h-8 px-4 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shrink-0"
                >
                  {t('hero.btnCheck')}
                </Button>
              </form>

              {/* Social Proof & Rating Strip */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 dark:text-white">{t('hero.ratingScore')}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>{t('hero.ratingDesc')}</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Photo with Clean, Minimal Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2">
            
            {/* Organic Background SVG Mint Shape */}
            <div className="absolute inset-0 -m-6 sm:-m-10 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 500 500" className="w-full h-full text-[#CCFBF1]/70 dark:text-teal-950/40" fill="currentColor">
                <path d="M432,310.5Q414,371,360.5,404.5Q307,438,247,433.5Q187,429,134.5,395.5Q82,362,60.5,306Q39,250,56.5,191.5Q74,133,124,93Q174,53,237.5,56Q301,59,359.5,88.5Q418,118,434,184Q450,250,432,310.5Z" />
              </svg>
            </div>

            {/* Main Arch Photo Container */}
            <div className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-gradient-to-b from-teal-50 to-teal-100/50 dark:from-slate-900 dark:to-slate-800">
                <img
                  src="/images/hero-student.jpg"
                  alt="Siswa SMK Negeri 1 Digital Teknologi"
                  className="w-full h-[360px] sm:h-[420px] object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                
                {/* Subtle Inner Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                
                {/* Bottom Image Integrated Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-2.5 border border-white/80 dark:border-slate-800 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#0D9488] dark:text-teal-400" />
                      {majorsCount} {t('hero.majorsCountLabel')}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0D9488] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800/60">
                      {t('hero.readyBadge')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Top Right / Akreditasi A */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-lg border border-teal-100 dark:border-teal-900/60 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-slate-800 text-[#0D9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">{t('hero.accreditationLabel')}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('hero.accreditationVal')}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

