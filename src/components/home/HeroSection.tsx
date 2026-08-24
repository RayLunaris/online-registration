import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Search, 
  Star, 
  GraduationCap, 
  Users, 
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { School } from '@/types/spmb';

interface HeroSectionProps {
  school: School | null;
  majorsCount?: number;
  totalQuota?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  school, 
  majorsCount = 4, 
  totalQuota = 400 
}) => {
  const [quickReg, setQuickReg] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReg.trim()) return;
    window.location.href = `/cek-status?reg=${encodeURIComponent(quickReg.trim())}`;
  };

  return (
    <section className="relative overflow-hidden bg-[#FAFAF9] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/80">
      {/* Background Organic Blobs & Dots */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#CCFBF1]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-[#FDBA74]/20 blur-3xl pointer-events-none" />
      
      {/* Decorative Organic Vector Shape */}
      <div className="absolute top-12 right-1/3 hidden lg:block opacity-30 pointer-events-none">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 0C32 17.6731 46.3269 32 64 32C46.3269 32 32 46.3269 32 64C32 46.3269 17.6731 32 0 32C17.6731 32 32 17.6731 32 0Z" fill="#0D9488" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Content & CTAs (55% / 7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left order-2 lg:order-1">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFBF1] border border-teal-200/80 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-pulse" />
              <span className="text-xs font-bold text-[#0D9488] tracking-wide">
                PPDB 2026/2027 Resmi Dibuka
              </span>
              <span className="text-xs text-teal-600/70 font-semibold hidden sm:inline">
                • 100% Bebas Biaya Pendaftaran
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Wujudkan Keahlian Vokasi & Masa Depan Cerah Bersama{' '}
                <span className="relative inline-block text-[#0D9488]">
                  SMK Unggulan
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" fill="none">
                    <path d="M0 5C20 1 40 8 60 4C80 0 95 6 100 3" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal pt-1">
                Portal pendaftaran resmi calon siswa <strong className="text-slate-900 font-semibold">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</strong>. Dapatkan kurikulum berbasis industri, sertifikasi internasional, dan fasilitas modern berstandar dunia kerja.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/daftar">
                <Button className="w-full sm:w-auto h-12 px-8 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all gap-2 group">
                  <span>Daftar Sekarang (Gratis)</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link to="/cek-status">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-7 border-2 border-slate-300 hover:border-[#0D9488] text-slate-700 hover:text-[#0D9488] font-bold text-sm rounded-full bg-white hover:bg-teal-50/50 transition-all">
                  Cek Status Pendaftaran
                </Button>
              </Link>
            </div>

            {/* Social Proof & Rating (EducateX Style) */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-t border-slate-200/80">
              <div className="flex items-center gap-3">
                {/* Overlapping Avatar Stack */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold ring-2 ring-white">
                    RPL
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-white text-xs font-bold ring-2 ring-white">
                    TKJ
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold ring-2 ring-white">
                    DKV
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold ring-2 ring-white">
                    AKL
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-900 ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    500+ Alumni Bekerja di Industri & Startup
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Registration Number Lookup Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs max-w-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-[#0D9488]" />
                  <span>Cek Status Nomor Pendaftaran:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">REG-2026-XXXXX</span>
              </div>
              <form onSubmit={handleQuickSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan Nomor Registrasi..."
                  value={quickReg}
                  onChange={(e) => setQuickReg(e.target.value.toUpperCase())}
                  className="flex-1 h-9 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0"
                >
                  Periksa
                </Button>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN: Photo with Organic Blob, Arch & Overlapping Badges (45% / 5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2">
            
            {/* Organic Background SVG Blob (Teal) */}
            <div className="absolute inset-0 -m-6 sm:-m-10 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 500 500" className="w-full h-full text-[#CCFBF1] opacity-75" fill="currentColor">
                <path d="M432,310.5Q414,371,360.5,404.5Q307,438,247,433.5Q187,429,134.5,395.5Q82,362,60.5,306Q39,250,56.5,191.5Q74,133,124,93Q174,53,237.5,56Q301,59,359.5,88.5Q418,118,434,184Q450,250,432,310.5Z" />
              </svg>
            </div>

            {/* Decorative Dot Grid Pattern */}
            <div className="absolute -top-4 -right-4 w-24 h-24 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-teal-800" />
              ))}
            </div>

            {/* Main Arch Photo Container */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
              <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-b from-teal-50 to-teal-100/50">
                <img
                  src="/images/hero-student.jpg"
                  alt="Siswa SMK Negeri 1 Digital Teknologi"
                  className="w-full h-[400px] sm:h-[480px] object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                
                {/* Subtle Inner Glow Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                
                {/* Bottom Image Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#0D9488]" />
                      Siswa Berprestasi Vokasi
                    </span>
                    <span className="text-[11px] font-semibold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-full">
                      Siap Kerja
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Top Left / Floating Overlap (EducateX style) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-teal-100 flex items-center gap-3 animate-bounce [animation-duration:4s]">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-[#0D9488] flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Pilihan Program</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{majorsCount} Jurusan Unggulan</span>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Right / Overlap Badge */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-orange-100 flex items-center gap-3 animate-pulse [animation-duration:3s]">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Daya Tampung</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{totalQuota} Total Kuota</span>
                </div>
              </div>

              {/* Floating Decorative Swirl / Clover */}
              <div className="absolute -top-6 right-8 h-10 w-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-[#0D9488] shadow-sm animate-spin [animation-duration:15s] pointer-events-none">
                <Sparkles className="h-5 w-5" />
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
