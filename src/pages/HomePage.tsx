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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { schoolService } from '@/services/schoolService';
import { announcementService } from '@/services/announcementService';
import { School, Major, Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

export const HomePage: React.FC = () => {
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quickRegNumber, setQuickRegNumber] = useState('');

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
              <span>SPMB Tahun Pelajaran {school?.academic_year || '2026/2027'} Telah Dibuka</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {school?.name || 'SMK Negeri 1 Digital Teknologi'}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              {school?.hero_tagline || 'Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/daftar" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 h-12 shadow-md shadow-blue-600/25 gap-2">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/cek-status" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium text-base px-6 h-12 gap-2 border-slate-300 hover:bg-slate-100">
                  <Search className="h-4 w-4 text-slate-500" />
                  Cek Status Pendaftaran
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-3 bg-white rounded-xl border shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{school?.target_students || '400'}</div>
                <div className="text-xs text-slate-500 font-medium">Total Kuota Siswa</div>
              </div>
              <div className="p-3 bg-white rounded-xl border shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{majors.length || 4}</div>
                <div className="text-xs text-slate-500 font-medium">Jurusan Unggulan</div>
              </div>
              <div className="p-3 bg-white rounded-xl border shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">100%</div>
                <div className="text-xs text-slate-500 font-medium">Pendaftaran Online</div>
              </div>
              <div className="p-3 bg-white rounded-xl border shadow-sm">
                <div className="text-2xl font-bold text-purple-600">30+</div>
                <div className="text-xs text-slate-500 font-medium">Mitra Industri</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JURUSAN SECTION */}
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
              Kurikulum berbasis industri dengan fasilitas laboratorium standar internasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majors.map((major) => (
              <Card key={major.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-slate-100">
                      {getMajorIcon(major.icon)}
                    </div>
                    <Badge variant="outline" className="font-bold text-xs bg-slate-50">
                      {major.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {major.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed line-clamp-3 mt-1">
                    {major.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between pt-4 border-t text-xs text-slate-500 font-medium">
                    <span>Kuota Penerimaan:</span>
                    <span className="font-bold text-blue-600 text-sm">{major.quota} Kursi</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ALUR PENDAFTARAN */}
      <section id="alur" className="py-16 bg-slate-50 border-b">
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
              <div key={idx} className="relative bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
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

      {/* 4. CEK STATUS QUICK BANNER */}
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

      {/* 5. PENGUMUMAN TERBARU */}
      {announcements.length > 0 && (
        <section id="pengumuman" className="py-16 bg-white">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <Card key={item.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                  {item.thumbnail_url && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 line-clamp-3 mt-2">
                      {item.content}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
