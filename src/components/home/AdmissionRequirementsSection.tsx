import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REQUIRED_DOCS = [
  {
    title: 'Pasfoto Berwarna 3x4',
    format: 'Format JPG / PNG (Maks. 2MB)',
    note: 'Pasfoto terbaru berseragam SMP/MTs atau kemeja rapi dengan latar belakang merah atau biru.',
  },
  {
    title: 'Scan Ijazah / SKL Asli',
    format: 'Format PDF / JPG (Maks. 5MB)',
    note: 'Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL) resmi yang telah ditandatangani kepala sekolah.',
  },
  {
    title: 'Scan Kartu Keluarga (KK)',
    format: 'Format PDF / JPG (Maks. 5MB)',
    note: 'Kartu Keluarga asli terbitan Dukcapil dengan NIK calon siswa yang tertera jelas dan valid.',
  },
  {
    title: 'Nilai Rapor & Piagam',
    format: 'Format PDF / JPG (Maks. 5MB)',
    note: 'Rapor semester 1 s/d 5 serta sertifikat prestasi kejuaraan juara 1-3 (jika ada).',
  },
];

export const AdmissionRequirementsSection: React.FC = () => {
  return (
    <section id="syarat" className="py-16 sm:py-20 bg-[#FAFAF9] border-b border-slate-200/80 scroll-mt-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Persiapan Berkas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dokumen Persyaratan Pendaftaran
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Siapkan file pindaian (scan) berkas asli dalam format digital sebelum mengisi formulir pendaftaran daring.
            </p>
          </div>

          <Link to="/daftar">
            <Button className="h-11 px-6 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-xs gap-2">
              <span>Buka Formulir Pendaftaran</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REQUIRED_DOCS.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#0D9488] text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>{doc.title}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md block w-fit">
                {doc.format}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {doc.note}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
