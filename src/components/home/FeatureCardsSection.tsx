import React from 'react';
import { Sparkles, FileEdit, Award, FileCheck2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export const FeatureCardsSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: FileEdit,
      iconBg: 'bg-teal-50 text-[#0D9488] border border-teal-100',
      title: t('features.f1Title'),
      description: t('features.f1Desc'),
      link: '/daftar',
      linkText: t('features.f1Link'),
    },
    {
      icon: Award,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      title: t('features.f2Title'),
      description: t('features.f2Desc'),
      link: '#alur',
      linkText: t('features.f2Link'),
    },
    {
      icon: FileCheck2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      title: t('features.f3Title'),
      description: t('features.f3Desc'),
      link: '/cek-status',
      linkText: t('features.f3Link'),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FAFAF9] border-b border-slate-200/70 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('features.tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('features.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('features.desc')}
          </p>
        </div>

        {/* 3 Horizontal Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  <div className={`h-12 w-12 rounded-2xl ${feat.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="h-6 w-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0D9488] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center">
                  <Link
                    to={feat.link.startsWith('#') ? `/${feat.link}` : feat.link}
                    className="text-xs font-bold text-[#0D9488] hover:text-teal-800 flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    <span>{feat.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

