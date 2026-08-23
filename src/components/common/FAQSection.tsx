import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Pendaftaran',
    question: 'Kapan pendaftaran SPMB dibuka dan bagaimana cara mendaftarnya?',
    answer: 'Pendaftaran dibuka secara daring (online) mulai tanggal 1 Mei hingga 30 Juni 2026. Calon siswa cukup mengakses menu "Daftar Sekarang" di website ini, mengisi biodata, memasukkan nilai rapor semester 1-5, dan mengunggah dokumen persyaratan.',
  },
  {
    category: 'Jurusan',
    question: 'Berapa banyak pilihan jurusan yang dapat saya pilih?',
    answer: 'Setiap calon siswa dapat memilih maksimal 2 jurusan. Pilihan 1 adalah prioritas utama keahlian yang Anda minati, dan Pilihan 2 adalah opsi cadangan apabila kuota pilihan 1 telah terpenuhi.',
  },
  {
    category: 'Seleksi & Nilai',
    question: 'Bagaimana sistem seleksi dan perhitungan nilai kelulusan?',
    answer: 'Seleksi menggunakan sistem penilaian otomatis (Scoring Engine) dengan bobot 70% dari rata-rata nilai rapor semester 1-5 (Mapel: Matematika, B. Indonesia, B. Inggris, IPA, IPS) dan 30% dari bobot sertifikat prestasi kejuaraan (Kabupaten, Provinsi, Nasional, Internasional).',
  },
  {
    category: 'Biaya',
    question: 'Apakah pendaftaran peserta didik baru dikenakan biaya?',
    answer: 'Pendaftaran SPMB daring di SMK Negeri 1 Digital Teknologi sepenuhnya GRATIS (tidak dipungut biaya pendaftaran apapun).',
  },
  {
    category: 'Dokumen',
    question: 'Dokumen apa saja yang wajib disiapkan sebelum mendaftar?',
    answer: 'Dokumen yang perlu disiapkan: (1) Pasfoto berwarna 3x4 formal terbaru, (2) Scan Ijazah atau Surat Keterangan Lulus (SKL), (3) Scan Kartu Keluarga (KK), (4) Nilai Rapor Semester 1 s.d 5, dan (5) Sertifikat piagam kejuaraan jika memiliki prestasi.',
  },
  {
    category: 'Hasil & Bukti',
    question: 'Bagaimana cara mengecek status dan mencetak kartu pendaftaran?',
    answer: 'Setelah selesai mengisi formulir pendaftaran, Anda akan mendapatkan Nomor Pendaftaran unik (misal: REG-2026-00001) dan langsung dapat mengunduh Kartu Bukti Pendaftaran. Anda juga dapat mengecek status verifikasi berkas dan hasil seleksi kapan saja melalui menu "Cek Status".',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-slate-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-2 text-blue-700 bg-blue-100 gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            Tanya Jawab
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Temukan jawaban cepat seputar syarat, alur, dan teknis pelaksanaan SPMB daring.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1 rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
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
