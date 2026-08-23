import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight, 
  GraduationCap, 
  User, 
  FileText, 
  QrCode,
  Calendar,
  School as SchoolIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RegistrationFormData, Major, School } from '@/types/spmb';
import { formatDate, formatScore } from '@/lib/utils';

interface Props {
  registrationNumber: string;
  formData: RegistrationFormData;
  school: School | null;
  majors: Major[];
}

export const RegistrationSuccessCard: React.FC<Props> = ({
  registrationNumber,
  formData,
  school,
  majors,
}) => {
  const [copied, setCopied] = useState(false);

  const major1 = majors.find((m) => m.id === formData.choice_1_major_id);
  const major2 = majors.find((m) => m.id === formData.choice_2_major_id);

  const totalScores = formData.report_scores.reduce((acc, curr) => acc + Number(curr.score), 0);
  const avgReport = formData.report_scores.length ? totalScores / formData.report_scores.length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner Alert */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-emerald-600/20 text-center space-y-3 print:hidden">
        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Data pendaftaran dan berkas Anda telah berhasil tersimpan di sistem SPMB daring. Simpan nomor pendaftaran Anda untuk pengecekan status dan pencetakan kartu bukti.
        </p>

        {/* Copy Registration Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl text-yellow-400 font-mono font-bold text-lg tracking-wider border border-yellow-400/30">
            {registrationNumber}
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            variant="secondary"
            className="text-xs h-10 gap-1.5 font-semibold bg-white text-emerald-800 hover:bg-emerald-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Salin Nomor</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="text-xs text-slate-500">
          <strong className="text-slate-900 block">Cetak Kartu Peserta</strong>
          Gunakan tombol cetak di samping untuk menyimpan salinan PDF bukti pendaftaran.
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Cetak Kartu (PDF)
          </Button>
          <Link to={`/cek-status?reg=${registrationNumber}`}>
            <Button variant="outline" className="text-xs font-semibold gap-1.5 border-slate-300">
              <span>Cek Status</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REGISTRATION CARD */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-10 shadow-md space-y-6 print:border-slate-800 print:shadow-none print:p-6 print:m-0">
        {/* Header Sekolah */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                {school?.name || 'SMK Negeri 1 Digital Teknologi'}
              </h3>
              <p className="text-xs text-slate-600">
                {school?.address || 'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                <span>NPSN: {school?.npsn || '20109988'}</span>
                <span>•</span>
                <span>Tahun Pelajaran: {school?.academic_year || '2026/2027'}</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <Badge className="bg-slate-900 text-white text-xs uppercase tracking-wider px-3 py-1 font-bold">
              KARTU BUKTI PENDAFTARAN
            </Badge>
            <div className="text-[10px] text-slate-400 mt-1">SPMB Online Resmi</div>
          </div>
        </div>

        {/* Card Body: Photo & Registration Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Photo & QR / Barcode Column */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            {formData.photo_url ? (
              <img
                src={formData.photo_url}
                alt="Foto Peserta"
                className="h-40 w-32 object-cover rounded-lg border-2 border-slate-300 shadow-sm"
              />
            ) : (
              <div className="h-40 w-32 rounded-lg bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400">
                <User className="h-12 w-12 mb-1" />
                <span className="text-[10px] font-semibold uppercase">Pasfoto 3x4</span>
              </div>
            )}

            <div className="pt-2 text-center w-full">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                No. Registrasi
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5 bg-white py-1 px-2 rounded border border-slate-200">
                {registrationNumber}
              </span>
            </div>
          </div>

          {/* Student Biodata Summary */}
          <div className="md:col-span-3 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <span className="text-slate-500 font-medium">Nama Lengkap:</span>
              <span className="col-span-2 font-bold text-slate-900 uppercase text-sm">
                {formData.full_name}
              </span>

              <span className="text-slate-500 font-medium">NISN / NIK:</span>
              <span className="col-span-2 font-semibold text-slate-800">
                {formData.nisn || '-'} / {formData.nik || '-'}
              </span>

              <span className="text-slate-500 font-medium">Tempat, Tgl Lahir:</span>
              <span className="col-span-2 text-slate-800">
                {formData.birth_place}, {formatDate(formData.birth_date)}
              </span>

              <span className="text-slate-500 font-medium">Jenis Kelamin / Agama:</span>
              <span className="col-span-2 text-slate-800">
                {formData.gender} / {formData.religion}
              </span>

              <span className="text-slate-500 font-medium">Asal Sekolah:</span>
              <span className="col-span-2 font-semibold text-slate-800">
                {formData.source_school_name} (Lulus {formData.graduation_year})
              </span>

              <span className="text-slate-500 font-medium">No. Telepon / WA:</span>
              <span className="col-span-2 text-slate-800">{formData.phone}</span>

              <span className="text-slate-500 font-medium">Email:</span>
              <span className="col-span-2 text-slate-800">{formData.email}</span>

              <span className="text-slate-500 font-medium">Nama Orang Tua:</span>
              <span className="col-span-2 text-slate-800">
                Ayah: {formData.father_name} | Ibu: {formData.mother_name}
              </span>
            </div>

            {/* Pilihan Jurusan Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Pilihan Program Keahlian:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-blue-600 font-bold block uppercase">Pilihan 1 (Utama)</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {major1 ? `${major1.name} (${major1.code})` : 'Pilihan 1 Terdaftar'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Pilihan 2 (Alternatif)</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {major2 ? `${major2.name} (${major2.code})` : 'Tidak Memilih Pilihan 2'}
                  </span>
                </div>
              </div>
            </div>

            {/* Nilai Rata-rata Rapor */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs">
              <span className="text-blue-900 font-semibold">Rata-rata Nilai Rapor Semester 1 - 5:</span>
              <span className="text-base font-bold font-mono text-blue-900">
                {formatScore(avgReport)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Tanda Tangan */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <div className="sm:col-span-2 space-y-1">
            <strong className="text-slate-900 block">Petunjuk untuk Calon Siswa:</strong>
            <ol className="list-decimal pl-4 space-y-0.5 text-[10px] text-slate-500 leading-tight">
              <li>Simpan atau cetak kartu bukti pendaftaran ini sebagai tanda bukti resmi.</li>
              <li>Pantau proses verifikasi berkas dan pengumuman hasil seleksi di menu "Cek Status".</li>
              <li>Bawa kartu pendaftaran ini saat verifikasi fisik/daftar ulang apabila dinyatakan diterima.</li>
            </ol>
          </div>

          <div className="text-center text-xs space-y-8">
            <div>
              <span>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <div className="text-[10px] text-slate-400">Tanda Tangan Pendaftar,</div>
            </div>
            <div className="border-b border-slate-800 w-36 mx-auto pt-4 font-semibold text-slate-900 uppercase text-[11px]">
              ( {formData.full_name} )
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
