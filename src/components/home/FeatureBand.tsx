import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const HIGHLIGHTS_ID = [
  'REKAYASA PERANGKAT LUNAK',
  'TEKNIK KOMPUTER & JARINGAN',
  'DESAIN KOMUNIKASI VISUAL',
  'AKUNTANSI KEUANGAN',
  '100% BEBAS BIAYA PENDAFTARAN',
  'TERAKREDITASI A (UNGGUL)',
  'SERTIFIKASI RESMI BNSP',
  'MITRA 30+ INDUSTRI'
];

const HIGHLIGHTS_EN = [
  'SOFTWARE ENGINEERING',
  'COMPUTER & NETWORK ENGINEERING',
  'VISUAL COMMUNICATION DESIGN',
  'ACCOUNTING & FINANCE',
  '100% FREE REGISTRATION',
  'ACCREDITED A (EXCELLENT)',
  'OFFICIAL BNSP CERTIFICATION',
  '30+ INDUSTRY PARTNERS'
];

export const FeatureBand: React.FC = () => {
  const { language } = useLanguage();
  const items = language === 'en' ? HIGHLIGHTS_EN : HIGHLIGHTS_ID;

  return (
    <section className="bg-[#0D9488] dark:bg-teal-950 text-white py-3.5 sm:py-4 overflow-hidden shadow-inner border-y border-teal-600/80 dark:border-teal-800/60 relative z-20 transition-colors">
      <div className="flex select-none whitespace-nowrap overflow-x-hidden">
        {/* Repeating text strip for ticker/banner feel */}
        <div className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-extrabold tracking-widest uppercase animate-marquee">
          {items.concat(items).map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="flex items-center gap-2 hover:text-teal-100 transition-colors cursor-default">
                <span>{item}</span>
              </span>
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-200 shrink-0" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

