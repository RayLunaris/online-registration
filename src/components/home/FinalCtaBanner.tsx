import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export const FinalCtaBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-20 bg-[#111827] text-white relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#0D9488]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#FDBA74]/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-6 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-800/80 text-teal-300 text-xs font-bold tracking-wide">
          <Award className="h-4 w-4 text-[#FDBA74]" />
          <span>{t('finalCta.badge')}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
          {t('finalCta.title')}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {t('finalCta.desc')}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/daftar">
            <Button className="w-full sm:w-auto h-12 px-8 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-lg gap-2">
              <span>{t('finalCta.btnRegister')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/cek-status">
            <Button className="w-full sm:w-auto h-12 px-7 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-full border border-slate-600 transition-colors shadow-sm">
              {t('finalCta.btnCheck')}
            </Button>
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
            {t('finalCta.p1')}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
            {t('finalCta.p2')}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
            {t('finalCta.p3')}
          </span>
        </div>

      </div>
    </section>
  );
};
