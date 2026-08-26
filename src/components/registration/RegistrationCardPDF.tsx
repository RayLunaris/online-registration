import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { GraduationCap, User, QrCode as QrIcon } from 'lucide-react';
import { StudentCompleteDetail, RegistrationFormData, School, Major } from '@/types/spmb';
import { formatDate, formatScore } from '@/lib/utils';

interface Props {
  data: StudentCompleteDetail | RegistrationFormData;
  registrationNumber: string;
  school: School | null;
  majors: Major[];
  elementId?: string;
}

export const RegistrationCardPDF: React.FC<Props> = ({
  data,
  registrationNumber,
  school,
  majors,
  elementId = 'official-registration-card',
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  // Helper to extract fields whether data is StudentCompleteDetail or RegistrationFormData
  const isDetail = 'id' in data && 'created_at' in data;
  const fullName = data.full_name;
  const nisn = data.nisn || '-';
  const nik = data.nik || '-';
  const birthPlace = data.birth_place;
  const birthDate = data.birth_date;
  const gender = data.gender;
  const religion = data.religion;
  const address = data.address;
  const phone = data.phone;
  const email = data.email;
  const sourceSchoolName = data.source_school_name;
  const graduationYear = data.graduation_year;

  // Parent Data
  let fatherName = '-';
  let motherName = '-';
  let parentPhone = '-';
  if (isDetail) {
    const detail = data as StudentCompleteDetail;
    fatherName = detail.parent_data?.father_name || '-';
    motherName = detail.parent_data?.mother_name || '-';
    parentPhone = detail.parent_data?.parent_phone || '-';
  } else {
    const form = data as RegistrationFormData;
    fatherName = form.father_name;
    motherName = form.mother_name;
    parentPhone = form.parent_phone;
  }

  // Majors
  let choice1Name = '-';
  let choice1Code = '';
  let choice2Name = 'Tidak Memilih';
  let choice2Code = '';

  if (isDetail) {
    const detail = data as StudentCompleteDetail;
    const choices = detail.major_choices || [];
    const ch1 = choices.find((c) => c.choice_order === 1);
    const ch2 = choices.find((c) => c.choice_order === 2);
    if (ch1?.major) {
      choice1Name = ch1.major.name;
      choice1Code = ch1.major.code;
    }
    if (ch2?.major) {
      choice2Name = ch2.major.name;
      choice2Code = ch2.major.code;
    }
  } else {
    const form = data as RegistrationFormData;
    const m1 = majors.find((m) => m.id === form.choice_1_major_id);
    const m2 = majors.find((m) => m.id === form.choice_2_major_id);
    if (m1) {
      choice1Name = m1.name;
      choice1Code = m1.code;
    }
    if (m2) {
      choice2Name = m2.name;
      choice2Code = m2.code;
    }
  }

  // Scores
  let avgScore = 0;
  let achPoints = 0;
  let totalScore = 0;

  if (isDetail) {
    const detail = data as StudentCompleteDetail;
    avgScore = Number(detail.average_report_score || 0);
    achPoints = Number(detail.achievement_score || 0);
    totalScore = Number(detail.total_score || 0);
  } else {
    const form = data as RegistrationFormData;
    const total = (form.report_scores || []).reduce((acc, curr) => acc + Number(curr.score || 0), 0);
    avgScore = form.report_scores.length ? total / form.report_scores.length : 0;
    achPoints = (form.achievements || []).reduce((max, ach) => {
      const pts = ach.level === 'Internasional' ? 100 : ach.level === 'Nasional' ? 80 : ach.level === 'Provinsi' ? 60 : ach.level === 'Kabupaten/Kota' ? 40 : 20;
      return pts > max ? pts : max;
    }, 0);
    totalScore = (avgScore * 0.7) + (achPoints * 0.3);
  }

  // Photo
  const photoUrl = !isDetail ? (data as RegistrationFormData).photo_url : undefined;

  // Generate QR Code & Barcode
  useEffect(() => {
    if (!registrationNumber) return;

    // 1. Generate QR Code (Links to online verification status)
    const verificationUrl = `${window.location.origin}/cek-status?reg=${encodeURIComponent(registrationNumber)}`;
    QRCode.toDataURL(verificationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error creating QR Code:', err));

    // 2. Generate Barcode Code128
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, registrationNumber, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 1.6,
          height: 38,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error('Error creating Barcode:', err);
      }
    }
  }, [registrationNumber]);

  return (
    <div
      id={elementId}
      className="bg-white text-slate-900 border-2 border-slate-900 rounded-xl p-8 max-w-3xl mx-auto shadow-sm print:p-6 print:border-slate-800 print:shadow-none print:m-0"
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}
    >
      {/* 1. KOP RESMI SEKOLAH */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-5 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-800 block">
              PANITIA PENERIMAAN MURID BARU (SPMB)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              {school?.name || 'SMK NEGERI 1 DIGITAL TEKNOLOGI'}
            </h2>
            <p className="text-xs text-slate-600 leading-tight mt-0.5">
              {school?.address || 'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan'}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-medium">
              <span>NPSN: {school?.npsn || '20109988'}</span>
              <span>•</span>
              <span>Terakreditasi: A (Unggul)</span>
              <span>•</span>
              <span>Tahun Ajaran: {school?.academic_year || '2026/2027'}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="border border-slate-900 px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded">
            KARTU BUKTI PESERTA
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">SPMB Online Resmi</span>
        </div>
      </div>

      {/* 2. NOMOR REGISTRASI & BARCODE HEADER */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
            Nomor Registrasi Calon Siswa
          </span>
          <span className="text-xl font-black font-mono tracking-wider text-teal-800 block">
            {registrationNumber}
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-end">
          <svg ref={barcodeRef} className="h-10" />
          <span className="text-[9px] font-mono text-slate-500">{registrationNumber}</span>
        </div>
      </div>

      {/* 3. BODY DATA: FOTO, QR CODE, DAN BIODATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Kolom Kiri: Pasfoto & QR Code */}
        <div className="md:col-span-1 flex flex-col items-center space-y-4">
          {/* Pasfoto 3x4 */}
          <div className="w-32 h-44 rounded-lg bg-slate-100 border-2 border-slate-400 overflow-hidden flex flex-col items-center justify-center text-center shadow-inner relative">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto Siswa" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                <User className="h-12 w-12 mb-1 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-wider">PASFOTO 3x4</span>
                <span className="text-[8px] text-slate-400">Tempel / Digital</span>
              </div>
            )}
          </div>

          {/* QR Code Verifikasi Online */}
          <div className="w-32 p-2 bg-white border border-slate-300 rounded-lg text-center shadow-sm">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code Verifikasi" className="w-full h-auto mx-auto" />
            ) : (
              <div className="h-24 flex items-center justify-center text-slate-400">
                <QrIcon className="h-8 w-8" />
              </div>
            )}
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block mt-1">
              Scan untuk Verifikasi
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Lengkap */}
        <div className="md:col-span-3 space-y-4">
          {/* Data Diri */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              A. Biodata Calon Siswa
            </h4>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium w-36">Nama Lengkap</td>
                  <td className="py-1 text-slate-900 font-black uppercase text-[13px]">{fullName}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">NISN / NIK</td>
                  <td className="py-1 text-slate-800 font-semibold">{nisn} / {nik}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">Tempat, Tanggal Lahir</td>
                  <td className="py-1 text-slate-800">{birthPlace}, {formatDate(birthDate)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">Jenis Kelamin / Agama</td>
                  <td className="py-1 text-slate-800">{gender} / {religion}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">Asal Sekolah</td>
                  <td className="py-1 text-slate-800 font-semibold">{sourceSchoolName} (Lulus {graduationYear})</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">No. WhatsApp / Email</td>
                  <td className="py-1 text-slate-800">{phone} | {email}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500 font-medium">Nama Orang Tua</td>
                  <td className="py-1 text-slate-800">Ayah: {fatherName} | Ibu: {motherName} {parentPhone !== '-' ? `(${parentPhone})` : ''}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Alamat Domisili</td>
                  <td className="py-1 text-slate-800 text-[11px] leading-tight">{address}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pilihan Jurusan & Nilai */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              B. Pilihan Jurusan & Ringkasan Nilai
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
                <span className="text-[10px] text-teal-700 font-bold block uppercase">Pilihan 1 (Utama)</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {choice1Name} {choice1Code ? `(${choice1Code})` : ''}
                </span>
              </div>
              <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
                <span className="text-[10px] text-slate-600 font-bold block uppercase">Pilihan 2 (Alternatif)</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {choice2Name} {choice2Code ? `(${choice2Code})` : ''}
                </span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Rata-rata Rapor (70%)</span>
                <span className="font-bold font-mono text-slate-900">{formatScore(avgScore)}</span>
              </div>
              <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Poin Prestasi (30%)</span>
                <span className="font-bold font-mono text-slate-900">{formatScore(achPoints)}</span>
              </div>
              <div className="p-1.5 bg-teal-50 rounded border border-teal-200">
                <span className="text-[9px] text-teal-700 font-bold block">Total Skor Seleksi</span>
                <span className="font-black font-mono text-teal-900">{formatScore(totalScore)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PETUNJUK & LEMBAR TANDA TANGAN */}
      <div className="mt-6 pt-4 border-t-2 border-slate-900 space-y-4 text-xs">
        <div className="space-y-1">
          <strong className="text-slate-900 block text-[11px] uppercase tracking-wider">
            Ketentuan & Petunjuk Verifikasi Berkas:
          </strong>
          <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-600 leading-tight">
            <li>Kartu tanda bukti pendaftaran ini sah dan diterbitkan secara elektronik melalui sistem resmi SPMB online.</li>
            <li>Simpan nomor pendaftaran dan pantau status kelulusan secara berkala di portal web resmi.</li>
            <li>Bawa kartu ini beserta dokumen asli (Ijazah/SKL, KK, Akta Lahir, dan Rapor) saat verifikasi berkas / daftar ulang di sekolah.</li>
          </ul>
        </div>

        {/* Two Signature Boxes: Panitia PPDB & Siswa */}
        <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200 text-center">
          {/* Panitia PPDB */}
          <div className="space-y-12">
            <div>
              <span className="text-[11px] text-slate-500 block">Mengetahui,</span>
              <span className="text-xs font-bold text-slate-900 block">Panitia Penerimaan Murid Baru</span>
            </div>
            <div>
              <div className="border-b border-slate-900 w-44 mx-auto font-bold text-slate-900 uppercase text-[11px]">
                ( Panitia SPMB SMK Digital )
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">NIP. ........................................</span>
            </div>
          </div>

          {/* Calon Siswa */}
          <div className="space-y-12">
            <div>
              <span className="text-[11px] text-slate-500 block">
                Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-xs font-bold text-slate-900 block">Calon Peserta Didik Baru,</span>
            </div>
            <div>
              <div className="border-b border-slate-900 w-44 mx-auto font-bold text-slate-900 uppercase text-[11px]">
                ( {fullName} )
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Tanda Tangan Pendaftar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
