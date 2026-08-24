import React from 'react';
import { Sparkles } from 'lucide-react';

const HIGHLIGHT_ITEMS = [
  'FASILITAS MODERN',
  'GURU PRAKTISI INDUSTRI',
  'SERTIFIKASI KOMPETENSI BNSP',
  'ALUMNI BERPRESTASI',
  '100% BEBAS BIAYA PENDAFTARAN',
  'TEACHING FACTORY UNGGULAN',
  'MITRA 30+ KORPORASI TEKNOLOGI'
];

export const FeatureBand: React.FC = () => {
  return (
    <section className="bg-[#0D9488] text-white py-4.5 sm:py-5 overflow-hidden shadow-inner border-y border-teal-700/60 relative z-20">
      <div className="flex select-none whitespace-nowrap overflow-x-auto no-scrollbar">
        {/* Repeating text strip for ticker/banner feel */}
        <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-extrabold tracking-widest uppercase animate-marquee">
          {HIGHLIGHT_ITEMS.concat(HIGHLIGHT_ITEMS).map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-default">
                <span>{item}</span>
              </span>
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FDBA74] shrink-0" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
