import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileEdit, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export const RegistrationStepsSection: React.FC = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      step: '01',
      title: t('steps.s1Title'),
      icon: FileEdit,
      desc: t('steps.s1Desc'),
    },
    {
      step: '02',
      title: t('steps.s2Title'),
      icon: UploadCloud,
      desc: t('steps.s2Desc'),
    },
    {
      step: '03',
      title: t('steps.s3Title'),
      icon: FileText,
      desc: t('steps.s3Desc'),
    },
    {
      step: '04',
      title: t('steps.s4Title'),
      icon: ShieldCheck,
      desc: t('steps.s4Desc'),
    },
    {
      step: '05',
      title: t('steps.s5Title'),
      icon: CheckCircle2,
      desc: t('steps.s5Desc'),
    },
  ];

  return (
    <section id="alur" className="py-14 sm:py-20 bg-[#FAFAF9] border-b border-slate-200/70 scroll-mt-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('steps.tag')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('steps.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('steps.desc')}
            </p>
          </div>

          <Link to="/daftar">
            <Button className="h-11 px-6 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-xs gap-2">
              <span>{t('steps.btnStart')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* 5 Step Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Step Number Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#0D9488] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                    {language === 'en' ? 'Step' : 'Langkah'} {item.step}
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center group-hover:bg-[#0D9488] group-hover:text-white transition-colors duration-300">
                    <IconComp className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
