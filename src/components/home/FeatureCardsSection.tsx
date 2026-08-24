import React from 'react';
import { Laptop, Award, Handshake, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Laptop,
    iconBg: 'bg-teal-100 text-[#0D9488]',
    borderHover: 'hover:border-teal-300',
    title: 'Fasilitas & Lab Modern',
    description: 'Laboratorium komputer spesifikasi Intel Core i7, fiber optic dedicated 1 Gbps, rack server enterprise, studio podcast, dan mini bank digital.',
  },
  {
    icon: Award,
    iconBg: 'bg-orange-100 text-orange-600',
    borderHover: 'hover:border-orange-300',
    title: 'Sertifikasi Kompetensi',
    description: 'Lulusan dibekali sertifikat kompetensi resmi Badan Nasional Sertifikasi Profesi (BNSP) serta lisensi vendor teknologi global (Cisco, MikroTik, Adobe).',
  },
  {
    icon: Handshake,
    iconBg: 'bg-emerald-100 text-emerald-700',
    borderHover: 'hover:border-emerald-300',
    title: 'Link & Match Industri',
    description: 'Kerjasama aktif dengan 30+ perusahaan teknologi dan BUMN untuk program Praktik Kerja Lapangan (PKL), kelas industri, serta rekrutmen lulusan.',
  },
];

export const FeatureCardsSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-18 bg-[#FAFAF9] border-b border-slate-200/80 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Keunggulan Utama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pendidikan Vokasi Unggulan & Fasilitas Berstandar Dunia Kerja
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Mempersiapkan siswa dengan kompetensi teknis terapan, etos kerja profesional, dan portofolio nyata.
          </p>
        </div>

        {/* 3 Horizontal Cards (EducateX Core Features Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-start space-y-4 group ${feat.borderHover}`}
              >
                <div className={`h-14 w-14 rounded-2xl ${feat.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                  <IconComp className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0D9488] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.description}
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
