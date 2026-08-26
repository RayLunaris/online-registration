import React from 'react';
import { Sparkles } from 'lucide-react';

const HIGHLIGHT_ITEMS = [
  'REKAYASA PERANGKAT LUNAK',
  'TEKNIK KOMPUTER & JARINGAN',
  'DESAIN KOMUNIKASI VISUAL',
  'AKUNTANSI KEUANGAN',
  '100% BEBAS BIAYA FORMULIR',
  'TERAKREDITASI A (UNGGUL)',
  'SERTIFIKASI PROFESI BNSP',
  'LINK & MATCH 30+ MITRA INDUSTRI'
];

export const FeatureBand: React.FC = () => {
  return (
    <section className="bg-[#0D9488] text-white py-4 sm:py-4.5 overflow-hidden shadow-inner border-y border-teal-600/80 relative z-20">
      <div className="flex select-none whitespace-nowrap overflow-x-hidden">
        {/* Repeating text strip for ticker/banner feel */}
        <div className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-extrabold tracking-widest uppercase animate-marquee">
          {HIGHLIGHT_ITEMS.concat(HIGHLIGHT_ITEMS).map((item, idx) => (
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

