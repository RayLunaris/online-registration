import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Pendaftaran',
    question: 'Kapan pendaftaran SPMB dibuka dan bagaimana cara mendaftarnya?',
    answer: 'Pendaftaran dibuka secara daring mulai tanggal 1 Mei hingga 20 Juni 2026. Calon siswa cukup membuka menu "Daftar Sekarang", mengisi biodata diri, memasukkan nilai rapor semester 1-5, dan mengunggah berkas persyaratan.',
  },
  {
    category: 'Jurusan',
    question: 'Berapa banyak jurusan yang bisa saya pilih saat mendaftar?',
    answer: 'Setiap calon siswa dapat memilih maksimal 2 program keahlian. Pilihan 1 adalah prioritas utama keahlian yang diminati, dan Pilihan 2 adalah pilihan alternatif kedua.',
  },
  {
    category: 'Seleksi & Nilai',
    question: 'Bagaimana sistem seleksi dan perhitungan nilai kelulusan?',
    answer: 'Seleksi dihitung otomatis oleh scoring engine dengan formula: (Rata-rata Rapor Semester 1-5 × 70%) + (Poin Sertifikat Prestasi × 30%). Perankingan dilakukan secara transparan per kuota jurusan.',
  },
  {
    category: 'Biaya',
    question: 'Apakah pendaftaran peserta didik baru dikenakan biaya?',
    answer: 'Pendaftaran SPMB daring di SMK Negeri 1 Digital Teknologi sepenuhnya GRATIS. Tidak ada pungutan biaya pendaftaran dalam bentuk apapun.',
  },
  {
    category: 'Dokumen',
    question: 'Dokumen apa saja yang wajib disiapkan sebelum mendaftar?',
    answer: 'Dokumen wajib: (1) Pasfoto berwarna 3x4 formal terbaru, (2) Scan Ijazah asli atau Surat Keterangan Lulus (SKL), (3) Scan Kartu Keluarga (KK), (4) Nilai Rapor Semester 1 s.d 5, dan (5) Sertifikat piagam kejuaraan jika memiliki prestasi.',
  },
  {
    category: 'Hasil & Bukti',
    question: 'Bagaimana cara mengecek status dan mencetak kartu bukti pendaftaran?',
    answer: 'Setelah submit formulir, sistem akan menerbitkan nomor registrasi resmi (contoh: REG-2026-00001). Kartu pendaftaran dapat langsung diunduh dalam format PDF atau dicek berkala di menu "Cek Status".',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
            <span>Pusat Bantuan & Tanya Jawab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Jawaban lengkap seputar alur pendaftaran, formula seleksi rapor, dan teknis pelaksanaan SPMB daring.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1 rounded-full bg-white text-slate-500 border border-slate-200 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-teal-50 text-teal-700 border-teal-200' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
