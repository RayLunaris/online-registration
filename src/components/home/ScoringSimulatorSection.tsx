import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export const ScoringSimulatorSection: React.FC = () => {
  const { t } = useLanguage();
  const [calcRapor, setCalcRapor] = useState<number>(85);
  const [calcPrestasi, setCalcPrestasi] = useState<number>(0);

  const calculatedTotal = (calcRapor * 0.7) + (calcPrestasi * 0.3);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200/70 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
            <Calculator className="h-3.5 w-3.5" />
            <span>{t('simulator.tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('simulator.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('simulator.desc')}
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
                <h3 className="text-xs font-bold text-slate-900">{t('simulator.boxRaporTitle')}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  {t('simulator.boxRaporDesc')}
                </p>
              </div>
            </div>

            {/* Box 2: 30% Prestasi */}
            <div className="p-6 rounded-3xl bg-[#FAFAF9] border border-slate-200/90 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm font-mono">
                30%
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{t('simulator.boxPrestasiTitle')}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  {t('simulator.boxPrestasiDesc')}
                </p>
              </div>
            </div>

            {/* Box 3: Total Skor */}
            <div className="p-6 rounded-3xl bg-[#0D9488] text-white space-y-3 shadow-md">
              <div className="h-10 w-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-sm font-mono">
                100%
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{t('simulator.boxTotalTitle')}</h3>
                <p className="text-[11px] text-teal-100 leading-relaxed mt-1">
                  {t('simulator.boxTotalDesc')}
                </p>
              </div>
            </div>

          </div>

          {/* Right: Interactive Simulator Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#111827] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#0D9488] font-bold uppercase tracking-wider block">
                  {t('simulator.tag')}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{t('simulator.simCardTitle')}</h3>
              </div>
              <Sparkles className="h-4 w-4 text-[#FDBA74]" />
            </div>

            {/* Slider Rapor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="simulator-rapor-range" className="text-slate-300 font-medium cursor-pointer">
                  {t('simulator.labelRapor')}
                </label>
                <span className="font-mono font-bold text-[#0D9488] text-sm">{calcRapor.toFixed(1)}</span>
              </div>
              <input 
                id="simulator-rapor-range"
                name="calcRapor"
                type="range" 
                min="60" 
                max="100" 
                step="0.5"
                value={calcRapor}
                onChange={(e) => setCalcRapor(parseFloat(e.target.value))}
                aria-label={t('simulator.labelRapor')}
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
              <label htmlFor="simulator-prestasi-select" className="text-xs text-slate-300 font-medium block cursor-pointer">
                {t('simulator.labelPrestasi')}
              </label>
              <select 
                id="simulator-prestasi-select"
                name="calcPrestasi"
                value={calcPrestasi}
                onChange={(e) => setCalcPrestasi(parseInt(e.target.value))}
                aria-label={t('simulator.labelPrestasi')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0D9488] font-mono"
              >
                <option value={0}>{t('simulator.prestasiNone')}</option>
                <option value={40}>{t('simulator.prestasiCity')}</option>
                <option value={60}>{t('simulator.prestasiProv')}</option>
                <option value={80}>{t('simulator.prestasiNat')}</option>
                <option value={100}>{t('simulator.prestasiInt')}</option>
              </select>
            </div>

            {/* Result Box */}
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">{t('simulator.resultLabel')}</span>
                <span className="text-2xl sm:text-3xl font-black text-[#0D9488] font-mono">
                  {calculatedTotal.toFixed(2)}
                </span>
              </div>
              <Link to="/daftar">
                <Button size="sm" className="bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-full px-5 h-10 shadow-xs">
                  {t('hero.btnRegister')}
                </Button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
