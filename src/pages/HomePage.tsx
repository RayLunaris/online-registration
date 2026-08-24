import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Code, 
  Server, 
  Palette, 
  Calculator, 
  Calendar, 
  GraduationCap, 
  Check, 
  Sparkles,
  Search,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { FAQSection } from '@/components/common/FAQSection';
import { schoolService } from '@/services/schoolService';
import { announcementService } from '@/services/announcementService';
import { School, Major, Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

// Program Keahlian Real Content
const MAJOR_INFO: Record<string, {
  icon: React.ElementType;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  shortDesc: string;
  focusStudy: string[];
  careerProspects: string[];
  facilities: string;
  partnerIndustries: string[];
}> = {
  RPL: {
    icon: Code,
    accentBg: 'bg-teal-600',
    accentText: 'text-teal-700',
    badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
    shortDesc: 'Mempelajari rekayasa perangkat lunak modern: pengembangan web, aplikasi mobile, cloud database, dan integrasi API industri.',
    focusStudy: ['Web Development (React, Next.js, Node.js)', 'Mobile Apps (Flutter, Kotlin)', 'Cloud Backend & SQL Database', 'Dasar AI & Machine Learning'],
    careerProspects: ['Junior Web Developer', 'Mobile Application Developer', 'Frontend Engineer', 'Junior Database Administrator'],
    facilities: 'Laboratorium Rekayasa Perangkat Lunak dengan 40 unit PC Intel Core i7, Fiber Optic Dedicated 1 Gbps, dan server staging lokal.',
    partnerIndustries: ['PT Telkom Indonesia', 'Gojek Tech Academy', 'Agate Studio', 'Midtrans'],
  },
  TKJ: {
    icon: Server,
    accentBg: 'bg-cyan-700',
    accentText: 'text-cyan-800',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    shortDesc: 'Fokus pada infrastruktur jaringan komputer, instalasi fiber optic, administrasi server Linux/Windows, cloud computing, dan cybersecurity.',
    focusStudy: ['Routing & Switching (Cisco & MikroTik)', 'Administrasi Server Linux Enterprise', 'Keamanan Jaringan & Firewall', 'Fiber Optic Splicing & OTDR'],
    careerProspects: ['Network Technician / Administrator', 'Junior System Administrator', 'IT Support Specialist', 'Fiber Optic Engineer'],
    facilities: 'Laboratorium Jaringan Komputer dilengkapi Cisco Rack Router, MikroTik Cloud Router, Server Rack 42U, dan Fusion Splicer.',
    partnerIndustries: ['PT Telkom Akses', 'Biznet Networks', 'Lintasarta', 'Indosat Ooredoo Hutchison'],
  },
  DKV: {
    icon: Palette,
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    shortDesc: 'Menggabungkan seni visual dan teknologi kreatif: desain grafis, antarmuka UI/UX, motion graphics, fotografi studio, dan sinematografi digital.',
    focusStudy: ['Desain Grafis & Branding (Photoshop, Illustrator)', 'UI/UX Design & Prototyping (Figma)', 'Motion Graphics & Video (After Effects, Premiere)', 'Fotografi & Sinematografi Digital'],
    careerProspects: ['Graphic Designer', 'UI/UX Junior Designer', 'Motion Graphic Artist', 'Creative Video Editor'],
    facilities: 'Studio Kreatif Multimedia dengan Cyclorama Green Screen, Lighting Kit Pro, Drawing Pen Display, dan Workstation Rendering.',
    partnerIndustries: ['Tribun Digital Media', 'Narasi TV', 'Kreavi Creative Agency', 'Arsana Studios'],
  },
  AKL: {
    icon: Calculator,
    accentBg: 'bg-emerald-700',
    accentText: 'text-emerald-800',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    shortDesc: 'Mempelajari tata kelola akuntansi modern berbasis komputer, perpajakan e-Faktur, perbankan syariah, dan sistem pelaporan keuangan digital.',
    focusStudy: ['Komputer Akuntansi (Accurate & MYOB)', 'Perpajakan & Pengisian e-Faktur/e-SPT', 'Akuntansi Keuangan & Perbankan', 'Spreadsheet Advanced Finansial'],
    careerProspects: ['Staf Akuntansi & Keuangan', 'Staf Administrasi Perpajakan', 'Customer Service / Teller Bank', 'Junior Auditor'],
    facilities: 'Laboratorium Mini Bank Digital dengan software akuntansi berlisensi resmi, mesin hitung uang, dan simulasi teller perbankan.',
    partnerIndustries: ['Bank Mandiri', 'Bank Syariah Indonesia (BSI)', 'Kantor Akuntan Publik (KAP)', 'PT Pegadaian'],
  },
};

const SCHEDULE_ITEMS = [
  {
    phase: 'Tahap 1',
    title: 'Pendaftaran Online & Upload Berkas',
    date: '1 Mei - 20 Juni 2026',
    status: 'Sedang Berlangsung',
    active: true,
    desc: 'Pengisian biodata, nilai rapor semester 1-5, dan unggah dokumen persyaratan di website resmi.',
  },
  {
    phase: 'Tahap 2',
    title: 'Verifikasi & Validasi Dokumen',
    date: '21 - 25 Juni 2026',
    status: 'Akan Datang',
    active: false,
    desc: 'Pemeriksaan keabsahan nilai rapor dan piagam kejuaraan oleh Panitia SPMB Sekolah.',
  },
  {
    phase: 'Tahap 3',
    title: 'Pengumuman Hasil Seleksi',
    date: '28 Juni 2026 (Pukul 10.00 WIB)',
    status: 'Akan Datang',
    active: false,
    desc: 'Pengumuman kelulusan berbasis sistem perangkingan nilai akhir kuota jurusan di portal Cek Status.',
  },
  {
    phase: 'Tahap 4',
    title: 'Daftar Ulang Peserta Diterima',
    date: '30 Juni - 4 Juli 2026',
    status: 'Akan Datang',
    active: false,
    desc: 'Verifikasi fisik berkas asli dan penyerahan surat pernyataan di Sekretariat SPMB Sekolah.',
  },
];

export const HomePage: React.FC = () => {
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quickReg, setQuickReg] = useState('');
  const [selectedMajorModal, setSelectedMajorModal] = useState<Major | null>(null);

  // Interactive Scoring Calculator State
  const [calcRapor, setCalcRapor] = useState<number>(85);
  const [calcPrestasi, setCalcPrestasi] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const [schoolData, majorsData, announcementsData] = await Promise.all([
        schoolService.getSchoolProfile(),
        schoolService.getMajors(),
        announcementService.getPublishedAnnouncements(3),
      ]);
      setSchool(schoolData);
      setMajors(majorsData);
      setAnnouncements(announcementsData);
    };
    loadData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReg.trim()) return;
    window.location.href = `/cek-status?reg=${encodeURIComponent(quickReg.trim())}`;
  };

  const calculatedTotal = (calcRapor * 0.7) + (calcPrestasi * 0.3);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. OFFICIAL INSTITUTIONAL NOTICE STRIP */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs py-2 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-white font-semibold">Penerimaan Peserta Didik Baru (SPMB) T.A. 2026/2027</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">SMK Negeri 1 Digital Teknologi Jakarta</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>NPSN: <strong className="text-slate-200">20109988</strong></span>
            <span>Akreditasi: <strong className="text-teal-400">A (Unggul)</strong></span>
            <span className="text-emerald-400 font-semibold">100% Gratis</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION - ASYMMETRIC SPLIT 7/5 COL (Strict SKILL Compliance) */}
      <section className="bg-white border-b border-slate-200 pt-10 sm:pt-14 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                  <GraduationCap className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Pusat Keunggulan Pendidikan Vokasi Teknologi</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Pendidikan Kejuruan Berkualitas, Siap Kerja dan Berdaya Saing Global.
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                  Portal resmi pendaftaran daring calon siswa <strong className="text-slate-900 font-semibold">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</strong> dengan 4 program keahlian unggulan standar industri.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link to="/daftar">
                  <Button className="w-full sm:w-auto h-11 px-7 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs gap-2">
                    <span>Daftar Sekarang (Gratis)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/cek-status">
                  <Button variant="outline" className="w-full sm:w-auto h-11 px-6 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs">
                    Cek Status Pendaftaran
                  </Button>
                </Link>
              </div>

              {/* Quick Status Check Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-lg space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Sudah mendaftar? Cek status nomor registrasi:</span>
                  <span className="text-[11px] text-slate-400 font-mono font-normal">Contoh: REG-2026-00001</span>
                </label>
                <form onSubmit={handleQuickSearch} className="flex gap-2">
                  <Input 
                    placeholder="Masukkan Nomor Registrasi..."
                    value={quickReg}
                    onChange={(e) => setQuickReg(e.target.value.toUpperCase())}
                    className="h-9 bg-white border-slate-300 text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:ring-teal-600"
                  />
                  <Button 
                    type="submit"
                    className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0"
                  >
                    <Search className="h-3.5 w-3.5 mr-1" />
                    <span>Periksa</span>
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Card: Institutional Telemetry & Key Metrics (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                      Informasi Daya Tampung
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Tahun Ajaran 2026/2027
                    </h3>
                  </div>
                  <Badge className="bg-teal-950 text-teal-300 border-teal-800 text-[11px] font-mono">
                    Online
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                    <span className="text-xs text-slate-400 block">Daya Tampung</span>
                    <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                      {school?.target_students || 400} Siswa
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                    <span className="text-xs text-slate-400 block">Program Keahlian</span>
                    <span className="text-2xl font-black text-teal-400 font-mono mt-0.5 block">
                      4 Jurusan
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                    <span className="text-xs text-slate-400 block">Metode Seleksi</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      Nilai Rapor & Prestasi
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                    <span className="text-xs text-slate-400 block">Biaya Pendaftaran</span>
                    <span className="text-xs font-bold text-emerald-400 mt-1 block">
                      100% Bebas Biaya
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Lulusan dibekali Sertifikasi Kompetensi Resmi BNSP dan Vendor Global.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Praktek Kerja Lapangan (PKL) terfasilitasi di 30+ mitra industri digital.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. JADWAL RESMI SPMB (#alur) */}
      <section id="alur" className="py-14 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Agenda dan Timeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Jadwal Resmi Penerimaan Siswa Baru
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Waktu: Waktu Indonesia Barat (WIB)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCHEDULE_ITEMS.map((item, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-xl border transition-all ${
                  item.active 
                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-400/40 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.phase}
                  </span>
                  <span className={`text-[11px] font-semibold ${
                    item.active ? 'text-teal-800' : 'text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs font-semibold text-teal-800 mb-2 font-mono flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-600" />
                  <span>{item.date}</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROGRAM KEAHLIAN BENTO (#jurusan) */}
      <section id="jurusan" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              4 Program Keahlian Unggulan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Setiap calon siswa dapat memilih maksimal 2 program keahlian: Pilihan 1 sebagai prioritas utama dan Pilihan 2 sebagai alternatif cadangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {majors.map((major) => {
              const info = MAJOR_INFO[major.code] || MAJOR_INFO.RPL;
              const IconComp = info.icon;
              return (
                <div 
                  key={major.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl ${info.accentBg} text-white flex items-center justify-center font-bold text-base shadow-xs`}>
                          <IconComp className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {major.code}
                            </span>
                            <span className="text-xs text-teal-700 font-semibold font-mono">
                              Kuota: {major.quota} Kursi
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-0.5">
                            {major.name}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                        Aktif
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {info.shortDesc}
                    </p>

                    {/* Materi Utama */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Fokus Kompetensi:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                        {info.focusStudy.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prospek Karir */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">
                        Peluang Karir Lulusan:
                      </span>
                      <p className="text-xs text-slate-600">
                        {info.careerProspects.join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedMajorModal(major)}
                      className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 font-semibold p-0 h-auto"
                    >
                      <span>Lihat Fasilitas & Mitra</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Link to="/daftar">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 h-9">
                        Pilih {major.code}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SISTEM PENILAIAN SELEKSI & INTERACTIVE CALCULATOR */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
              Standar Seleksi Terbuka
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Formula Perhitungan Nilai Akhir Seleksi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Seleksi berlangsung otomatis dan transparan berdasarkan formula pembobotan resmi: 70% rata-rata rapor semester 1-5 dan 30% piagam prestasi kejuaraan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 3 summary cards (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Box 1: Rapor 70% */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs font-mono">
                  70%
                </div>
                <h3 className="text-xs font-bold text-slate-900">Rata-rata Rapor (Sem. 1-5)</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  5 mata pelajaran utama: Matematika, B. Indonesia, B. Inggris, IPA, dan IPS.
                </p>
              </div>

              {/* Box 2: Prestasi 30% */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-mono">
                  30%
                </div>
                <h3 className="text-xs font-bold text-slate-900">Piagam Kejuaraan</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Internasional: 100 pt<br />
                  Nasional: 80 pt<br />
                  Provinsi: 60 pt<br />
                  Kab/Kota: 40 pt
                </p>
              </div>

              {/* Box 3: Total Skor */}
              <div className="p-5 rounded-2xl bg-teal-900 text-white space-y-2">
                <div className="h-9 w-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs font-mono">
                  100%
                </div>
                <h3 className="text-xs font-bold text-white">Total Skor Akhir</h3>
                <p className="text-[11px] text-teal-200 leading-relaxed">
                  (Rapor × 0.7) + (Prestasi × 0.3). Perankingan otomatis per kuota.
                </p>
              </div>
            </div>

            {/* Right: Interactive Simulator Widget (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                    Simulasi Mandiri
                  </span>
                  <h3 className="text-sm font-bold text-white">Kalkulator Prediksi Skor</h3>
                </div>
                <Sparkles className="h-4 w-4 text-teal-400" />
              </div>

              {/* Slider / Input Rapor */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Rata-rata Nilai Rapor:</span>
                  <span className="font-mono font-bold text-teal-400">{calcRapor.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="100" 
                  step="0.5"
                  value={calcRapor}
                  onChange={(e) => setCalcRapor(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>60.0</span>
                  <span>80.0</span>
                  <span>100.0</span>
                </div>
              </div>

              {/* Select Prestasi */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">Tingkat Prestasi Tertinggi:</label>
                <select 
                  value={calcPrestasi}
                  onChange={(e) => setCalcPrestasi(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value={0}>Tidak Ada Piagam (0 Poin)</option>
                  <option value={20}>Tingkat Sekolah (20 Poin)</option>
                  <option value={40}>Tingkat Kabupaten/Kota (40 Poin)</option>
                  <option value={60}>Tingkat Provinsi (60 Poin)</option>
                  <option value={80}>Tingkat Nasional (80 Poin)</option>
                  <option value={100}>Tingkat Internasional (100 Poin)</option>
                </select>
              </div>

              {/* Calculation Result */}
              <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Estimasi Skor Seleksi:</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">
                    {calculatedTotal.toFixed(2)}
                  </span>
                </div>
                <Link to="/daftar">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold h-9">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. DOKUMEN PERSYARATAN & CARA MENDAFTAR (#syarat) */}
      <section id="syarat" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Persiapan Berkas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dokumen Wajib Persyaratan Pendaftaran
              </h2>
            </div>
            <Link to="/daftar">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold h-10 px-5 gap-1.5">
                <span>Buka Formulir Pendaftaran</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Pasfoto Berwarna 3x4',
                format: 'Format JPG / PNG (Maks. 2MB)',
                note: 'Foto terbaru berseragam sekolah atau pakaian rapi latar belakang merah/biru.',
              },
              {
                title: 'Scan Ijazah / SKL Asli',
                format: 'Format PDF / JPG (Maks. 5MB)',
                note: 'Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL) resmi dari kepala sekolah.',
              },
              {
                title: 'Scan Kartu Keluarga (KK)',
                format: 'Format PDF / JPG (Maks. 5MB)',
                note: 'Kartu Keluarga asli terbitan Dukcapil dengan NIK calon siswa yang tertera jelas.',
              },
              {
                title: 'Nilai Rapor & Piagam',
                format: 'Format PDF / JPG (Maks. 5MB)',
                note: 'Rapor semester 1 s/d 5 serta sertifikat prestasi juara (jika ada).',
              },
            ].map((doc, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>{doc.title}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-800 block">
                  {doc.format}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {doc.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BERITA & PENGUMUMAN TERKINI */}
      {announcements.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Pengumuman & Berita Terbaru
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Informasi resmi seputar teknis pendaftaran dan jadwal kegiatan sekolah.
                </p>
              </div>
              <Link to="/pengumuman">
                <Button variant="outline" size="sm" className="text-xs border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold h-9">
                  <span>Semua Berita</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <Link
                  key={item.id}
                  to={`/pengumuman/${item.slug}`}
                  className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-400 hover:bg-white transition-all flex flex-col justify-between group space-y-4 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <Badge variant="outline" className="bg-white border-slate-300 text-teal-800 text-[11px] font-semibold">
                        {item.category}
                      </Badge>
                      <span className="font-mono">{formatDate(item.published_at || item.created_at)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                  <span className="text-xs text-teal-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Baca Pengumuman</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ COMPONENT INTEGRATION */}
      <FAQSection />

      {/* 9. FINAL CALLOUT CTA BANNER */}
      <section className="py-14 bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>Pendaftaran Daring T.A. 2026/2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Siapkan Diri Anda Menjadi Tenaga Ahli Vokasi Masa Depan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Daftarkan diri Anda sekarang secara gratis dan dapatkan pendidikan kejuruan berstandar industri dengan fasilitas laboratorium mutakhir.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/daftar">
              <Button className="h-11 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm gap-2">
                <span>Daftar Sekarang (Gratis)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cek-status">
              <Button variant="outline" className="h-11 px-6 border-slate-700 hover:bg-slate-900 text-slate-300 font-semibold text-xs">
                Cek Status Nomor Pendaftaran
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL RINCIAN JURUSAN & FASILITAS LAB */}
      {selectedMajorModal && (
        <Dialog open={Boolean(selectedMajorModal)} onOpenChange={(open) => !open && setSelectedMajorModal(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative z-50 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
                    {selectedMajorModal.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedMajorModal.name}</h3>
                    <span className="text-xs text-teal-700 font-semibold font-mono">Daya Tampung: {selectedMajorModal.quota} Siswa</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedMajorModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 text-base font-bold"
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

                {MAJOR_INFO[selectedMajorModal.code] && (
                  <>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider">Fasilitas Laboratorium Praktek</h4>
                      <p className="text-slate-600 leading-relaxed">
                        {MAJOR_INFO[selectedMajorModal.code].facilities}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                      <h4 className="font-bold text-teal-900 uppercase tracking-wider">Perusahaan Mitra & Tempat PKL</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {MAJOR_INFO[selectedMajorModal.code].partnerIndustries.map((partner, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-white text-teal-900 font-semibold border border-teal-200 text-xs shadow-2xs">
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMajorModal(null)} className="text-xs border-slate-300 text-slate-700 h-9">
                  Tutup
                </Button>
                <Link to="/daftar">
                  <Button className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold h-9">
                    Daftar di Jurusan Ini
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}

    </div>
  );
};
