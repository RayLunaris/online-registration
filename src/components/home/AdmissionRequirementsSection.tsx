import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export const AdmissionRequirementsSection: React.FC = () => {
  const { t } = useLanguage();

  const requiredDocs = [
    {
      title: t('requirements.d1Title'),
      format: t('requirements.d1Format'),
      note: t('requirements.d1Note'),
    },
    {
      title: t('requirements.d2Title'),
      format: t('requirements.d2Format'),
      note: t('requirements.d2Note'),
    },
    {
      title: t('requirements.d3Title'),
      format: t('requirements.d3Format'),
      note: t('requirements.d3Note'),
    },
    {
      title: t('requirements.d4Title'),
      format: t('requirements.d4Format'),
      note: t('requirements.d4Note'),
    },
  ];

  return (
    <section id="syarat" className="py-14 sm:py-20 bg-[#FAFAF9] dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-800/70 scroll-mt-16 relative transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 text-[#0D9488] dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
              <FileCheck className="h-3.5 w-3.5" />
              <span>{t('requirements.tag')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('requirements.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('requirements.desc')}
            </p>
          </div>

          <Link to="/daftar">
            <Button className="h-11 px-6 bg-[#0D9488] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs rounded-full shadow-xs gap-2">
              <span>{t('requirements.btnOpen')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {requiredDocs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#0D9488] dark:text-teal-400 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] dark:text-teal-400 shrink-0" />
                <span>{doc.title}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md block w-fit">
                {doc.format}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {doc.note}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
