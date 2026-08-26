import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileEdit, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    step: '01',
    title: 'Isi Formulir Online',
    icon: FileEdit,
    desc: 'Lengkapi biodata calon siswa, data orang tua/wali, dan pilih 2 jurusan peminatan.',
  },
  {
    step: '02',
    title: 'Unggah Berkas & Rapor',
    icon: UploadCloud,
    desc: 'Input nilai rapor semester 1-5 dan unggah dokumen KK, pasfoto 3x4, serta ijazah/SKL.',
  },
  {
    step: '03',
    title: 'Cetak Kartu Peserta',
    icon: FileText,
    desc: 'Sistem langsung menerbitkan Kartu Registrasi PDF resmi dilengkapi kode barcode unik.',
  },
  {
    step: '04',
    title: 'Verifikasi & Seleksi',
    icon: ShieldCheck,
    desc: 'Scoring engine otomatis menghitung total nilai akhir (70% Rapor + 30% Prestasi).',
  },
  {
    step: '05',
    title: 'Pengumuman & Daftar Ulang',
    icon: CheckCircle2,
    desc: 'Cek status kelulusan secara transparan di portal dan lanjutkan proses daftar ulang.',
  },
];

export const RegistrationStepsSection: React.FC = () => {
  return (
    <section id="alur" className="py-16 sm:py-20 bg-[#FAFAF9] border-b border-slate-200/70 scroll-mt-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Alur Pendaftaran</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              5 Langkah Mudah Mendaftar di SPMB Online
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Proses pendaftaran dirancang 100% daring, praktis, cepat, dan dapat diakses melalui smartphone maupun laptop.
            </p>
          </div>

          <Link to="/daftar">
            <Button className="h-11 px-6 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-xs gap-2">
              <span>Mulai Pendaftaran Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* 5 Step Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {STEPS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Step Number Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#0D9488] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                    Langkah {item.step}
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center group-hover:bg-[#0D9488] group-hover:text-white transition-colors duration-300">
                    <IconComp className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.desc}
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
