import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const AdmissionScheduleSection: React.FC = () => {
  const { t } = useLanguage();

  const scheduleItems = [
    {
      phase: t('schedule.p1Phase'),
      title: t('schedule.p1Title'),
      date: t('schedule.p1Date'),
      status: t('schedule.statusActive'),
      active: true,
      desc: t('schedule.p1Desc'),
    },
    {
      phase: t('schedule.p2Phase'),
      title: t('schedule.p2Title'),
      date: t('schedule.p2Date'),
      status: t('schedule.statusUpcoming'),
      active: false,
      desc: t('schedule.p2Desc'),
    },
    {
      phase: t('schedule.p3Phase'),
      title: t('schedule.p3Title'),
      date: t('schedule.p3Date'),
      status: t('schedule.statusUpcoming'),
      active: false,
      desc: t('schedule.p3Desc'),
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200/70 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              <span>{t('schedule.tag')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('schedule.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('schedule.desc')}
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full">
            {t('schedule.timezone')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scheduleItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                item.active
                  ? 'bg-teal-50/70 border-[#0D9488]/40 ring-2 ring-[#0D9488]/20 shadow-md'
                  : 'bg-[#FAFAF9] border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full font-mono ${
                      item.active ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.phase}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      item.active ? 'text-[#0D9488]' : 'text-slate-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs font-bold text-[#0D9488] mt-1.5 font-mono flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
