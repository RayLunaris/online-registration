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
  return (
    <section id="tentang" className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden border-b border-slate-200/80">
      {/* Decorative Background Accents */}
      <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-[#CCFBF1]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-slate-100 blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Photo Stack & Decorative Badges (Mirroring "Who We Are" in EducateX) */}
          <div className="lg:col-span-6 relative">
            
            {/* Background Blob & Dots */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-teal-50 via-teal-100/40 to-transparent rounded-[3rem] -rotate-1 scale-95 pointer-events-none" />
            
            <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100">
              <img
                src="/images/about-students.jpg"
                alt="Siswa-siswi SMK Negeri 1 Digital Teknologi"
                className="w-full h-[380px] sm:h-[460px] object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Image Tag */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Teaching Factory</span>
                    <span className="text-[11px] text-slate-500 font-medium">Lab Standar Industri 4.0</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0D9488] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                  Resmi
                </span>
              </div>
            </div>

            {/* Overlapping Floating Circular Badge (EducateX style) */}
            <div className="absolute -top-4 -right-2 sm:-right-4 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-teal-100 flex items-center gap-3 animate-bounce [animation-duration:5s]">
              <div className="h-11 w-11 rounded-full bg-[#0D9488] text-white flex items-center justify-center shadow-sm shrink-0">
                <Award className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Akreditasi</span>
                <span className="text-sm font-extrabold text-slate-900">A (Unggul)</span>
              </div>
            </div>

            {/* Dot Grid Pattern Decor */}
            <div className="absolute -bottom-6 -left-4 w-20 h-20 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
              ))}
            </div>

          </div>

          {/* RIGHT: About Content & Real Metrics (6 cols) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>Tentang Sekolah</span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Mengapa Memilih{' '}
                <span className="text-[#0D9488]">{school?.name || 'SMK Negeri 1 Digital'}</span>?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Kami berkomitmen mencetak tenaga ahli vokasi yang tangguh, adaptif, dan siap langsung terjun ke dunia kerja maupun melanjutkan ke perguruan tinggi. Pembelajaran berfokus pada <em>Project-Based Learning</em>, penguasaan teknologi mutakhir, dan sertifikasi profesi resmi.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF9] border border-slate-200/80 text-xs font-bold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Kurikulum Standar Industri</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF9] border border-slate-200/80 text-xs font-bold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Sertifikasi BNSP & Global</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF9] border border-slate-200/80 text-xs font-bold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Penyaluran PKL 30+ Mitra</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF9] border border-slate-200/80 text-xs font-bold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Teaching Factory & Startup</span>
              </div>
            </div>

            {/* Big Statistics Counter Block (EducateX Style) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0D9488] font-mono block">
                  {majorsCount}+
                </span>
                <span className="text-xs font-bold text-slate-800 block">Jurusan Tersedia</span>
                <span className="text-[11px] text-slate-500">Pilihan kompetensi keahlian unggulan</span>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-orange-600 font-mono block">
                  {totalQuota}+
                </span>
                <span className="text-xs font-bold text-slate-800 block">Total Kuota Tersedia</span>
                <span className="text-[11px] text-slate-500">Daya tampung siswa baru 2026/2027</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <a href="#jurusan">
                <Button className="h-11 px-7 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-sm gap-2">
                  <span>Lihat Seluruh Jurusan</span>
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
