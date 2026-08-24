import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ScoringSimulatorSection: React.FC = () => {
  const [calcRapor, setCalcRapor] = useState<number>(85);
  const [calcPrestasi, setCalcPrestasi] = useState<number>(0);

  const calculatedTotal = (calcRapor * 0.7) + (calcPrestasi * 0.3);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
            <Calculator className="h-3.5 w-3.5" />
            <span>Transparansi Seleksi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Formula Perhitungan Skor & Simulasi Nilai Akhir
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Sistem perankingan seleksi berjalan secara otomatis, adil, dan transparan berdasarkan gabungan nilai rapor 5 semester dan piagam prestasi kejuaraan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 3 Weighted Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Box 1: 70% Rapor */}
            <div className="p-6 rounded-3xl bg-[#FAFAF9] border border-slate-200/90 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-2xl bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-sm font-mono">
                70%
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Rata-rata Rapor (Sem. 1-5)</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  5 Mapel Utama: Matematika, Bahasa Indonesia, Bahasa Inggris, IPA, dan IPS.
                </p>
              </div>
            </div>

            {/* Box 2: 30% Prestasi */}
            <div className="p-6 rounded-3xl bg-[#FAFAF9] border border-slate-200/90 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm font-mono">
                30%
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Piagam Prestasi Juara</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  Internasional: 100 pt<br />
                  Nasional: 80 pt • Provinsi: 60 pt<br />
                  Kabupaten/Kota: 40 pt
                </p>
              </div>
            </div>

            {/* Box 3: Total Skor */}
            <div className="p-6 rounded-3xl bg-[#0D9488] text-white space-y-3 shadow-md">
              <div className="h-10 w-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-sm font-mono">
                100%
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Total Skor Akhir</h3>
                <p className="text-[11px] text-teal-100 leading-relaxed mt-1">
                  (Rapor × 0.7) + (Prestasi × 0.3). Perangkingan otomatis per kuota jurusan.
                </p>
              </div>
            </div>

          </div>

          {/* Right: Interactive Simulator Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#111827] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#0D9488] font-bold uppercase tracking-wider block">
                  Simulasi Mandiri
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">Kalkulator Prediksi Skor</h3>
              </div>
              <Sparkles className="h-4 w-4 text-[#FDBA74]" />
            </div>

            {/* Slider Rapor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Rata-rata Nilai Rapor:</span>
                <span className="font-mono font-bold text-[#0D9488] text-sm">{calcRapor.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="100" 
                step="0.5"
                value={calcRapor}
                onChange={(e) => setCalcRapor(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>60.0</span>
                <span>80.0</span>
                <span>100.0</span>
              </div>
            </div>

            {/* Select Prestasi */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">Tingkat Prestasi Tertinggi:</label>
              <select 
                value={calcPrestasi}
                onChange={(e) => setCalcPrestasi(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0D9488] font-mono"
              >
                <option value={0}>Tidak Ada Piagam (0 Poin)</option>
                <option value={20}>Tingkat Sekolah (20 Poin)</option>
                <option value={40}>Tingkat Kabupaten/Kota (40 Poin)</option>
                <option value={60}>Tingkat Provinsi (60 Poin)</option>
                <option value={80}>Tingkat Nasional (80 Poin)</option>
                <option value={100}>Tingkat Internasional (100 Poin)</option>
              </select>
            </div>

            {/* Result Box */}
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Estimasi Skor Seleksi:</span>
                <span className="text-2xl sm:text-3xl font-black text-[#0D9488] font-mono">
                  {calculatedTotal.toFixed(2)}
                </span>
              </div>
              <Link to="/daftar">
                <Button size="sm" className="bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-full px-5 h-10 shadow-xs">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
