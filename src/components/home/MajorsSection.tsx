import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Server, 
  Palette, 
  Calculator, 
  ArrowRight, 
  Users, 
  Building2, 
  BookOpen,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Major } from '@/types/spmb';

// Major Metadata & Industrial Specifications
export const MAJOR_META: Record<string, {
  icon: React.ElementType;
  themeColor: string;
  accentBg: string;
  badgeBg: string;
  tagColor: string;
  borderHover: string;
  buttonBg: string;
  category: string;
  categoryGroup: 'all' | 'tech' | 'creative' | 'business';
  imageCover: string;
  shortDesc: string;
  focusStudy: string[];
  careerProspects: string[];
  facilities: string;
  partnerIndustries: string[];
}> = {
  AKL: {
    icon: Calculator,
    themeColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800',
    tagColor: 'bg-emerald-500/90 text-white',
    borderHover: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10 dark:hover:border-emerald-500/50',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    category: 'Bisnis & Keuangan Digital',
    categoryGroup: 'business',
    imageCover: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Tata kelola akuntansi modern berbantuan komputer, perpajakan e-Faktur & e-SPT, perbankan syariah, serta sistem keuangan digital.',
    focusStudy: ['Komputer Akuntansi (Accurate & MYOB)', 'Perpajakan & Pengisian e-Faktur', 'Akuntansi Keuangan & Perbankan', 'Spreadsheet Advanced Finansial'],
    careerProspects: ['Staf Akuntansi & Keuangan', 'Staf Administrasi Perpajakan', 'Customer Service / Teller Bank', 'Junior Financial Auditor'],
    facilities: 'Laboratorium Mini Bank Digital dengan software akuntansi berlisensi resmi, mesin hitung uang, dan simulasi teller perbankan.',
    partnerIndustries: ['Bank Mandiri', 'Bank Syariah Indonesia (BSI)', 'Kantor Akuntan Publik (KAP)', 'PT Pegadaian'],
  },
  DKV: {
    icon: Palette,
    themeColor: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-400 dark:border-purple-800',
    tagColor: 'bg-purple-500/90 text-white',
    borderHover: 'hover:border-purple-500/60 hover:shadow-purple-500/10 dark:hover:border-purple-500/50',
    buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    category: 'Industri Seni & Kreatif Digital',
    categoryGroup: 'creative',
    imageCover: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Kombinasi seni visual dan media digital: desain UI/UX, branding grafis, motion graphics, sinematografi, dan fotografi studio.',
    focusStudy: ['Desain Grafis & Branding (Photoshop, AI)', 'UI/UX Design & Prototyping (Figma)', 'Motion Graphics & Video Editing', 'Fotografi Studio & Sinematografi'],
    careerProspects: ['Graphic Designer', 'UI/UX Junior Designer', 'Motion Graphic Artist', 'Creative Video Editor'],
    facilities: 'Studio Kreatif Multimedia dengan Cyclorama Green Screen, Lighting Kit Pro, Drawing Pen Display, dan Workstation Rendering.',
    partnerIndustries: ['Tribun Digital Media', 'Narasi TV', 'Kreavi Creative Agency', 'Arsana Studios'],
  },
  RPL: {
    icon: Code,
    themeColor: 'text-teal-600 dark:text-teal-400',
    accentBg: 'bg-teal-600',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/80 dark:text-teal-400 dark:border-teal-800',
    tagColor: 'bg-teal-500/90 text-white',
    borderHover: 'hover:border-teal-500/60 hover:shadow-teal-500/10 dark:hover:border-teal-500/50',
    buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white',
    category: 'Teknologi Informasi & Software',
    categoryGroup: 'tech',
    imageCover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Rekayasa perangkat lunak modern: frontend web, fullstack application, mobile apps (Flutter), cloud backend, dan AI integration.',
    focusStudy: ['Web Development (React & Node.js)', 'Mobile Apps (Flutter & Kotlin)', 'Cloud DB & Enterprise API', 'Dasar AI & Machine Learning'],
    careerProspects: ['Junior Web Developer', 'Mobile Application Developer', 'Frontend Engineer', 'Junior Database Administrator'],
    facilities: 'Laboratorium Rekayasa Perangkat Lunak dengan 40 unit PC Intel Core i7, Fiber Optic Dedicated 1 Gbps, dan server staging lokal.',
    partnerIndustries: ['PT Telkom Indonesia', 'Gojek Tech Academy', 'Agate Studio', 'Midtrans'],
  },
  TKJ: {
    icon: Server,
    themeColor: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800',
    tagColor: 'bg-blue-500/90 text-white',
    borderHover: 'hover:border-blue-500/60 hover:shadow-blue-500/10 dark:hover:border-blue-500/50',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    category: 'Infrastruktur Jaringan & Cyber',
    categoryGroup: 'tech',
    imageCover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Administrasi server enterprise Linux/Windows, konfigurasi router Cisco & MikroTik, cloud computing, fiber optic, dan cybersecurity.',
    focusStudy: ['Routing & Switching (Cisco & MikroTik)', 'Administrasi Server Linux Enterprise', 'Keamanan Jaringan & Firewall', 'Fiber Optic Splicing & OTDR'],
    careerProspects: ['Network Technician / Administrator', 'Junior System Administrator', 'IT Support Specialist', 'Fiber Optic Engineer'],
    facilities: 'Laboratorium Jaringan Komputer dilengkapi Cisco Rack Router, MikroTik Cloud Router, Server Rack 42U, dan Fusion Splicer.',
    partnerIndustries: ['PT Telkom Akses', 'Biznet Networks', 'Lintasarta', 'Indosat Ooredoo Hutchison'],
  },
};

interface MajorsSectionProps {
  majors: Major[];
}

export const MajorsSection: React.FC<MajorsSectionProps> = ({ majors }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'tech' | 'creative' | 'business'>('all');
  const [selectedMajorModal, setSelectedMajorModal] = useState<Major | null>(null);

  const filterTabs = [
    { key: 'all', label: 'Semua Jurusan' },
    { key: 'tech', label: 'Teknologi & IT' },
    { key: 'creative', label: 'Desain Kreatif' },
    { key: 'business', label: 'Bisnis & Keuangan' },
  ] as const;

  const filteredMajors = majors.filter((m) => {
    if (activeFilter === 'all') return true;
    const meta = MAJOR_META[m.code];
    return meta ? meta.categoryGroup === activeFilter : true;
  });

  return (
    <section id="jurusan" className="py-16 sm:py-24 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-200/70 dark:border-slate-800/80 scroll-mt-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Program Keahlian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Pilihan Program Keahlian Unggulan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Setiap calon siswa dapat memilih maksimal 2 program keahlian (Pilihan 1 Prioritas & Pilihan 2 Alternatif).
            </p>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.key
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-COLUMN RESPONSIVE GRID (Perfect 4-in-a-row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMajors.map((major) => {
            const meta = MAJOR_META[major.code] || MAJOR_META.RPL;
            const IconComponent = meta.icon;

            return (
              <div
                key={major.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 ${meta.borderHover}`}
              >
                <div>
                  {/* Card Cover Image with Overlaid Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={meta.imageCover}
                      alt={major.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
                    
                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white font-mono font-extrabold text-xs shadow-xs border border-white/80 dark:border-slate-700">
                        {major.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 dark:bg-slate-950/90 text-white font-bold text-xs shadow-xs backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-teal-400" />
                        <span>{major.quota} Kuota</span>
                      </span>
                    </div>

                    {/* Bottom Category Tag */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-semibold text-white bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/10 inline-block truncate max-w-full">
                        {meta.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg ${meta.badgeBg}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase">
                          {major.code}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug line-clamp-2">
                        {major.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {meta.shortDesc}
                      </p>
                    </div>

                    {/* Competency Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Fokus Kompetensi:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.focusStudy.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {item.split('(')[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMajorModal(major)}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1 p-0 cursor-pointer"
                  >
                    <span>Rincian & Lab</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <Link to="/daftar">
                    <Button 
                      size="sm" 
                      className={`h-8 px-3.5 ${meta.buttonBg} text-xs font-bold rounded-full shadow-xs gap-1`}
                    >
                      <span>Pilih</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMajors.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Tidak ada program keahlian pada kategori ini.
          </div>
        )}

      </div>

      {/* DETAIL MODAL FOR MAJOR */}
      {selectedMajorModal && (
        <Dialog open={Boolean(selectedMajorModal)} onOpenChange={(open) => !open && setSelectedMajorModal(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative z-50 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Header Modal */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
                    {selectedMajorModal.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedMajorModal.name}</h3>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-bold font-mono">Daya Tampung: {selectedMajorModal.quota} Siswa</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedMajorModal(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 text-base font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Isi Modal */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Deskripsi Kompetensi</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedMajorModal.description || MAJOR_META[selectedMajorModal.code]?.shortDesc}</p>
                </div>

                {MAJOR_META[selectedMajorModal.code] && (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>Fasilitas Laboratorium Praktek</span>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {MAJOR_META[selectedMajorModal.code].facilities}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-2">
                      <h4 className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>Perusahaan Mitra & Tempat PKL</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {MAJOR_META[selectedMajorModal.code].partnerIndustries.map((partner, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800 text-xs shadow-2xs">
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>Prospek Karir & Profesi Lulusan</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {MAJOR_META[selectedMajorModal.code].careerProspects.map((career, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            <span>{career}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <Button variant="outline" onClick={() => setSelectedMajorModal(null)} className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-9 rounded-full">
                  Tutup
                </Button>
                <Link to="/daftar">
                  <Button className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold h-9 rounded-full px-5">
                    Daftar di Jurusan Ini
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
};

