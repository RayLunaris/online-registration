import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Code, 
  Network, 
  Palette, 
  Calculator, 
  FileText, 
  Calendar, 
  Search,
  Sparkles,
  Award,
  Briefcase,
  Layers,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle,
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FAQSection } from '@/components/common/FAQSection';
import { useLanguage } from '@/context/LanguageContext';
import { schoolService } from '@/services/schoolService';
import { announcementService } from '@/services/announcementService';
import { School, Major, Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

// Detailed info for major popup modal
const MAJOR_DETAILS: Record<string, { competencies: string[]; careers: string[]; facilities: string }> = {
  RPL: {
    competencies: [
      'Pemrograman Web Frontend & Backend (React, Node.js, PHP/Laravel)',
      'Pengembangan Aplikasi Mobile (Flutter & Android)',
      'Basis Data Relasional & Cloud (PostgreSQL, Supabase, Firebase)',
      'Dasar AI & Machine Learning'
    ],
    careers: ['Junior Web Developer', 'Mobile App Developer', 'Frontend Engineer', 'Database Administrator'],
    facilities: 'Lab Software Engineering dengan iMac & PC Spesifikasi Tinggi, Koneksi Fiber Optik Dedicated.'
  },
  TKJ: {
    competencies: [
      'Administrasi Server Linux & Windows Server',
      'Manajemen Jaringan MikroTik & Cisco (Routing, Switching, Firewall)',
      'Keamanan Siber (Cybersecurity Essentials)',
      'Cloud Architecture & Virtualization'
    ],
    careers: ['Network Engineer', 'System Administrator', 'Cloud Technician', 'Cybersecurity Analyst Junior'],
    facilities: 'Lab Jaringan Komputer dengan Cisco Rack Server, Router MikroTik CCR, Fiber Optic Splicer.'
  },
  DKV: {
    competencies: [
      'Desain Grafis, Branding & Identitas Visual (Adobe Photoshop, Illustrator)',
      'Desain UI/UX & Digital Prototyping (Figma)',
      'Motion Graphics, 2D Animation & Video Editing (After Effects, Premiere Pro)',
      'Fotografi Studio & Sinematografi'
    ],
    careers: ['UI/UX Designer', 'Graphic Designer', 'Motion Graphic Artist', 'Creative Content Producer'],
    facilities: 'Studio Fotografi & Videografi dengan Green Screen, Lighting Pro, Pen Display Tablet & Render Farm.'
  },
  AKL: {
    competencies: [
      'Sistem Akuntansi Komputer (MYOB, Accurate, Excel Advanced)',
      'Pengelolaan Kas, Perpajakan & E-Faktur',
      'Administrasi Keuangan & Perbankan Syariah',
      'Auditing & Analisis Laporan Keuangan Digital'
    ],
    careers: ['Accounting Staff', 'Tax Administration Officer', 'Bank Teller / CS Officer', 'Junior Auditor'],
    facilities: 'Lab Mini Bank Digital, Software Akuntansi Berlisensi Resmi, Mesin Hitung & Terminal Kasir Kas.'
  }
};

export const HomePage: React.FC = () => {
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quickRegNumber, setQuickRegNumber] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const { t } = useLanguage();

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

  const getMajorIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Code': return <Code className="h-6 w-6 text-blue-600" />;
      case 'Network': return <Network className="h-6 w-6 text-indigo-600" />;
      case 'Palette': return <Palette className="h-6 w-6 text-purple-600" />;
      case 'Calculator': return <Calculator className="h-6 w-6 text-emerald-600" />;
      default: return <Code className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 py-16 sm:py-24 border-b">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>{t('hero.badge')} ({school?.academic_year || '2026/2027'})</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {school?.name || 'SMK Negeri 1 Digital Teknologi'}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              {school?.hero_tagline || t('hero.desc')}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/daftar" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 h-12 shadow-md shadow-blue-600/25 gap-2">
                  {t('hero.btnRegister')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/cek-status" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium text-base px-6 h-12 gap-2 border-slate-300 hover:bg-slate-100">
                  <Search className="h-4 w-4 text-slate-500" />
                  {t('hero.btnCheck')}
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{school?.target_students || '400'}</div>
                <div className="text-xs text-slate-500 font-medium">{t('hero.statQuota')}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{majors.length || 4}</div>
                <div className="text-xs text-slate-500 font-medium">{t('hero.statMajors')}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">100%</div>
                <div className="text-xs text-slate-500 font-medium">Online</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">30+</div>
                <div className="text-xs text-slate-500 font-medium">{t('hero.statPartners')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEUNGGULAN SEKOLAH (WHY CHOOSE US) */}
      <section className="py-16 bg-slate-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-2 text-blue-700 bg-blue-100">
              Keunggulan Kami
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Mengapa Memilih {school?.name || 'SMK Digital'}?
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Pendidikan kejuruan modern yang mengintegrasikan kurikulum industri, teknologi terdepan, dan sertifikasi profesi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Kurikulum Industri',
                desc: 'Materi pembelajaran diselaraskan langsung dengan kebutuhan industri teknologi masa kini.',
                icon: Layers,
                color: 'text-blue-600 bg-blue-50',
              },
              {
                title: 'Sertifikasi Profesi',
                desc: 'Lulusan dibekali sertifikasi kompetensi BNSP dan sertifikasi vendor internasional.',
                icon: ShieldCheck,
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                title: 'Laboratorium Standar Global',
                desc: 'Fasilitas praktikum lengkap dengan perangkat keras dan software lisensi industri.',
                icon: Building2,
                color: 'text-purple-600 bg-purple-50',
              },
              {
                title: 'Penyaluran Kerja 90%+',
                desc: 'Bursa Kerja Khusus (BKK) aktif bermitra dengan lebih dari 30 perusahaan terkemuka.',
                icon: Briefcase,
                color: 'text-amber-600 bg-amber-50',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className={`p-3 rounded-xl w-fit ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. JURUSAN SECTION */}
      <section id="jurusan" className="py-16 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-2 text-blue-700 bg-blue-100">
              Kompetensi Keahlian
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Pilihan Jurusan Masa Depan
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Pilih program keahlian yang sesuai dengan minat dan potensi karir impian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majors.map((major) => (
              <Card key={major.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 flex flex-col justify-between group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                      {getMajorIcon(major.icon)}
                    </div>
                    <Badge variant="outline" className="font-bold text-xs bg-slate-50">
                      {major.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {major.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed line-clamp-3 mt-1">
                    {major.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    <span>Kuota Tersedia:</span>
                    <span className="font-bold text-blue-600 text-sm">{major.quota} Kursi</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMajor(major)}
                    className="w-full text-xs font-semibold text-slate-700 hover:text-blue-600 border-slate-200 hover:bg-slate-50"
                  >
                    Lihat Rincian & Karir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL DETAIL JURUSAN */}
      {selectedMajor && (
        <Dialog open={Boolean(selectedMajor)} onOpenChange={(open) => !open && setSelectedMajor(null)}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-blue-600 text-white text-xs">{selectedMajor.code}</Badge>
              <span className="text-xs text-slate-500">Kuota: {selectedMajor.quota} Siswa</span>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {selectedMajor.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-1">
              {selectedMajor.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-left">
            {/* Kompetensi yang Dipelajari */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Kompetensi Utama:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {(MAJOR_DETAILS[selectedMajor.code]?.competencies || [
                  'Teori kejuruan mendalam & praktikum lab',
                  'Penyelesaian proyek nyata (Project-Based Learning)',
                  'Etika profesional & budaya kerja industri'
                ]).map((comp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prospek Karir */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Peluang Profesi & Karir:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(MAJOR_DETAILS[selectedMajor.code]?.careers || ['Tenaga Ahli Kejuruan', 'Wirausaha Mandiri']).map((career, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px] bg-slate-100 text-slate-700">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Fasilitas */}
            <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-900">
              <span className="font-semibold block mb-0.5">Fasilitas Lab Khusus:</span>
              {MAJOR_DETAILS[selectedMajor.code]?.facilities || 'Laboratorium komputer dan bengkel praktek standar industri.'}
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-row justify-between items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMajor(null)}
              className="text-xs"
            >
              Tutup
            </Button>
            <Link to="/daftar">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                Daftar Jurusan Ini
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </DialogFooter>
        </Dialog>
      )}

      {/* 4. SYARAT & KETENTUAN PENDAFTARAN */}
      <section id="syarat" className="py-16 bg-slate-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-2 text-purple-700 bg-purple-100">
              Persiapan Berkas
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Syarat & Dokumen Pendaftaran
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Pastikan Anda telah menyiapkan berkas-berkas berikut sebelum mengisi formulir online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Berkas Wajib */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Dokumen Wajib Diunggah</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Pasfoto 3x4 Berwarna</strong>
                    Format JPG/PNG, ukuran maksimal 2MB, latar belakang merah atau biru.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Scan Ijazah / Surat Keterangan Lulus (SKL)</strong>
                    Format PDF atau JPG/PNG, ukuran maksimal 5MB.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Scan Kartu Keluarga (KK)</strong>
                    Format PDF atau JPG/PNG, memastikan NIK calon siswa dan orang tua terbaca jelas.
                  </div>
                </li>
              </ul>
            </div>

            {/* Syarat Nilai & Prestasi */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-purple-600">
                <Award className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Nilai Rapor & Prestasi</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Nilai Rapor Semester 1 s.d 5 (Bobot 70%)</strong>
                    Mata pelajaran: Matematika, Bahasa Indonesia, Bahasa Inggris, IPA, dan IPS.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Sertifikat Kejuaraan / Prestasi (Bobot 30%)</strong>
                    Piagam lomba akademik / non-akademik tingkat Kabupaten/Kota, Provinsi, Nasional, atau Internasional (opsional).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Batas Usia Calon Siswa</strong>
                    Maksimal berusia 21 tahun pada tanggal 1 Juli tahun pelajaran berjalan.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALUR PENDAFTARAN */}
      <section id="alur" className="py-16 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-2 text-emerald-700 bg-emerald-100">
              Langkah Mudah
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Alur Proses Pendaftaran
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              4 langkah praktis menyelesaikan pendaftaran dari rumah tanpa antrean.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Isi Data Pribadi',
                desc: 'Lengkapi biodata calon siswa, data orang tua/wali, serta asal sekolah SMP/MTs.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Input Nilai & Berkas',
                desc: 'Masukkan nilai rapor semester 1-5 dan unggah foto 3x4 serta sertifikat prestasi.',
                icon: Award,
              },
              {
                step: '03',
                title: 'Cetak Kartu Peserta',
                desc: 'Dapatkan nomor pendaftaran unik dan cetak kartu bukti pendaftaran format PDF.',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Pengumuman Seleksi',
                desc: 'Pantau status hasil seleksi otomatis berbasis ranking rapor & prestasi di website.',
                icon: Calendar,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black text-blue-600/30">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CEK STATUS QUICK BANNER */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Sudah Mendaftar? Cek Status Anda</h2>
            <p className="text-blue-100 text-sm">
              Ketikkan nomor pendaftaran yang tertera pada kartu bukti pendaftaran Anda.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickRegNumber.trim()) {
                  window.location.href = `/cek-status?reg=${encodeURIComponent(quickRegNumber.trim())}`;
                }
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <Input
                placeholder="Contoh: REG-2026-00001"
                value={quickRegNumber}
                onChange={(e) => setQuickRegNumber(e.target.value)}
                className="bg-white text-slate-900 placeholder:text-slate-400 h-11"
              />
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-6 shrink-0">
                Periksa Status
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 7. PENGUMUMAN TERBARU & BERITA */}
      {announcements.length > 0 && (
        <section id="pengumuman" className="py-16 bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <Badge variant="secondary" className="mb-2 text-purple-700 bg-purple-100">
                  Informasi Resmi
                </Badge>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Berita & Pengumuman Terbaru
                </h2>
              </div>
              <Link to="/pengumuman">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border-blue-200">
                  Lihat Semua Pengumuman
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <Card key={item.id} className="overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between">
                  <div>
                    {item.thumbnail_url && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px]">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="p-5 pb-2">
                      <div className="flex items-center text-xs text-slate-500 mb-1.5">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        <Link to={`/pengumuman/${item.slug}`}>
                          {item.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-600 line-clamp-3 mt-2">
                        {item.content}
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="p-5 pt-0">
                    <Link
                      to={`/pengumuman/${item.slug}`}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1 pt-3 border-t border-slate-100 w-full"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ SECTION */}
      <FAQSection />
    </div>
  );
};
