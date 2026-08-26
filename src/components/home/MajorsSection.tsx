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
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Major } from '@/types/spmb';

// Major Metadata & Industrial Specifications
export const MAJOR_META: Record<string, {
  icon: React.ElementType;
  accentBg: string;
  badgeColor: string;
  category: string;
  categoryGroup: 'all' | 'tech' | 'creative' | 'business';
  imageCover: string;
  shortDesc: string;
  focusStudy: string[];
  careerProspects: string[];
  facilities: string;
  partnerIndustries: string[];
}> = {
  RPL: {
    icon: Code,
    accentBg: 'bg-teal-600',
    badgeColor: 'bg-teal-50 text-[#0D9488] border-teal-200',
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
    accentBg: 'bg-cyan-700',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    category: 'Infrastruktur Jaringan & Cyber',
    categoryGroup: 'tech',
    imageCover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Administrasi server enterprise Linux/Windows, konfigurasi router Cisco & MikroTik, cloud computing, fiber optic, dan cybersecurity.',
    focusStudy: ['Routing & Switching (Cisco & MikroTik)', 'Administrasi Server Linux Enterprise', 'Keamanan Jaringan & Firewall', 'Fiber Optic Splicing & OTDR'],
    careerProspects: ['Network Technician / Administrator', 'Junior System Administrator', 'IT Support Specialist', 'Fiber Optic Engineer'],
    facilities: 'Laboratorium Jaringan Komputer dilengkapi Cisco Rack Router, MikroTik Cloud Router, Server Rack 42U, dan Fusion Splicer.',
    partnerIndustries: ['PT Telkom Akses', 'Biznet Networks', 'Lintasarta', 'Indosat Ooredoo Hutchison'],
  },
  DKV: {
    icon: Palette,
    accentBg: 'bg-indigo-600',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    category: 'Industri Seni & Kreatif Digital',
    categoryGroup: 'creative',
    imageCover: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Kombinasi seni rupa visual dan media digital: desain UI/UX, branding grafis, motion graphics, video cinematography, dan fotografi studio.',
    focusStudy: ['Desain Grafis & Branding (Photoshop, AI)', 'UI/UX Design & Prototyping (Figma)', 'Motion Graphics & Video Editing', 'Fotografi Studio & Sinematografi'],
    careerProspects: ['Graphic Designer', 'UI/UX Junior Designer', 'Motion Graphic Artist', 'Creative Video Editor'],
    facilities: 'Studio Kreatif Multimedia dengan Cyclorama Green Screen, Lighting Kit Pro, Drawing Pen Display, dan Workstation Rendering.',
    partnerIndustries: ['Tribun Digital Media', 'Narasi TV', 'Kreavi Creative Agency', 'Arsana Studios'],
  },
  AKL: {
    icon: Calculator,
    accentBg: 'bg-emerald-700',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    category: 'Bisnis & Keuangan Digital',
    categoryGroup: 'business',
    imageCover: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    shortDesc: 'Tata kelola akuntansi modern berbantuan komputer, perpajakan e-Faktur & e-SPT, perbankan syariah, serta sistem keuangan digital.',
    focusStudy: ['Komputer Akuntansi (Accurate & MYOB)', 'Perpajakan & Pengisian e-Faktur/e-SPT', 'Akuntansi Keuangan & Perbankan', 'Spreadsheet Advanced Finansial'],
    careerProspects: ['Staf Akuntansi & Keuangan', 'Staf Administrasi Perpajakan', 'Customer Service / Teller Bank', 'Junior Auditor'],
    facilities: 'Laboratorium Mini Bank Digital dengan software akuntansi berlisensi resmi, mesin hitung uang, dan simulasi teller perbankan.',
    partnerIndustries: ['Bank Mandiri', 'Bank Syariah Indonesia (BSI)', 'Kantor Akuntan Publik (KAP)', 'PT Pegadaian'],
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
    <section id="jurusan" className="py-16 sm:py-20 bg-white border-b border-slate-200/70 scroll-mt-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Header & Filter Controls (EducateX Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Program Keahlian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pilihan Program Keahlian Unggulan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Setiap calon siswa dapat memilih maksimal 2 program keahlian (Pilihan 1 Prioritas & Pilihan 2 Alternatif).
            </p>
          </div>

          {/* Filter Pill Tabs (EducateX Style) */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#FAFAF9] rounded-2xl border border-slate-200 shrink-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.key
                    ? 'bg-[#0D9488] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Card Grid (EducateX "Our Courses" Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredMajors.map((major) => {
            const meta = MAJOR_META[major.code] || MAJOR_META.RPL;

            return (
              <div
                key={major.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Cover Image with Overlaid Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={meta.imageCover}
                      alt={major.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-mono font-bold text-xs shadow-xs border border-white/80">
                        {major.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#0D9488] text-white font-bold text-xs shadow-xs flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{major.quota} Kuota</span>
                      </span>
                    </div>

                    {/* Bottom Category Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[11px] font-semibold text-teal-200 bg-slate-900/80 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {meta.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0D9488] transition-colors leading-snug">
                        {major.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {meta.shortDesc}
                      </p>
                    </div>

                    {/* Competency Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Fokus Kompetensi:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.focusStudy.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {item.split('(')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMajorModal(major)}
                    className="text-xs font-bold text-[#0D9488] hover:text-teal-800 transition-colors inline-flex items-center gap-1 p-0"
                  >
                    <span>Rincian & Lab</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <Link to="/daftar">
                    <Button size="sm" className="h-9 px-4 bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-full shadow-xs">
                      Pilih Jurusan
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* DETAIL MODAL FOR MAJOR */}
      {selectedMajorModal && (
        <Dialog open={Boolean(selectedMajorModal)} onOpenChange={(open) => !open && setSelectedMajorModal(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative z-50 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Header Modal */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
                    {selectedMajorModal.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedMajorModal.name}</h3>
                    <span className="text-xs text-[#0D9488] font-bold font-mono">Daya Tampung: {selectedMajorModal.quota} Siswa</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedMajorModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 text-base font-bold rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Isi Modal */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Deskripsi Kompetensi</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedMajorModal.description}</p>
                </div>

                {MAJOR_META[selectedMajorModal.code] && (
                  <>
                    <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-[#0D9488]" />
                        <span>Fasilitas Laboratorium Praktek</span>
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {MAJOR_META[selectedMajorModal.code].facilities}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                      <h4 className="font-bold text-teal-900 uppercase tracking-wider">Perusahaan Mitra & Tempat PKL</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {MAJOR_META[selectedMajorModal.code].partnerIndustries.map((partner, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-white text-teal-900 font-semibold border border-teal-200 text-xs shadow-2xs">
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <Button variant="outline" onClick={() => setSelectedMajorModal(null)} className="text-xs border-slate-300 text-slate-700 h-9 rounded-full">
                  Tutup
                </Button>
                <Link to="/daftar">
                  <Button className="text-xs bg-[#0D9488] hover:bg-teal-700 text-white font-bold h-9 rounded-full px-5">
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
