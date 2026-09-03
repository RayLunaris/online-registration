import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Sparkles, 
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { School } from '@/types/spmb';
import { useLanguage } from '@/context/LanguageContext';

interface AboutSectionProps {
  school: School | null;
  majorsCount?: number;
  totalQuota?: number;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  school, 
  majorsCount = 4, 
  totalQuota = 400 
}) => {
  const { t } = useLanguage();

  return (
    <section id="tentang" className="py-12 sm:py-16 bg-white relative overflow-hidden border-b border-slate-200/70">
      {/* Decorative Mint Background Glow */}
      <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-[#CCFBF1]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-teal-50/40 blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Photo & Clean Accent Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 max-w-md mx-auto lg:max-w-none">
              <img
                src="/images/about-students.jpg"
                alt="Siswa SMK Negeri 1 Digital Teknologi"
                className="w-full h-[320px] sm:h-[400px] object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Image Tag */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{t('about.tefaTitle')}</span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate">{t('about.tefaSub')}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 shrink-0">
                  {t('about.bnspBadge')}
                </span>
              </div>
            </div>

            {/* Overlapping Accreditation Badge */}
            <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-lg border border-teal-100 flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-500 block">{t('about.accreditationLabel')}</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">{t('about.accreditationVal')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: About Content & Concise Metrics */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Section Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>{t('about.tag')}</span>
            </div>

            {/* Main Title & Paragraph - Ringkas */}
            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('about.title')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                <strong className="text-slate-900 font-semibold">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</strong>{' '}
                {t('about.descSuffix')}
              </p>
            </div>

            {/* Feature Checkpoints - Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>{t('about.checkIndustry')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>{t('about.checkBnsp')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>{t('about.checkPkl')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>{t('about.checkTefa')}</span>
              </div>
            </div>

            {/* Concise Stats Counter */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100/80 space-y-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0D9488] font-mono block">
                  {majorsCount}
                </span>
                <span className="text-xs font-bold text-slate-800 block">{t('about.statMajors')}</span>
                <span className="text-[11px] text-slate-500">{t('about.statMajorsSub')}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100/80 space-y-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono block">
                  {totalQuota}
                </span>
                <span className="text-xs font-bold text-slate-800 block">{t('about.statQuota')}</span>
                <span className="text-[11px] text-slate-500">{t('about.statQuotaSub')}</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-1">
              <a href="#jurusan">
                <Button className="h-10 px-6 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-xs gap-2 transition-all">
                  <span>{t('about.btnMajors')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

