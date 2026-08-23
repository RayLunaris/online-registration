import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight, 
  Download,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegistrationCardPDF } from '@/components/registration/RegistrationCardPDF';
import { exportElementToPdf } from '@/lib/pdfGenerator';
import { RegistrationFormData, Major, School } from '@/types/spmb';

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
  const [downloading, setDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const fileName = `Kartu_Pendaftaran_${registrationNumber}.pdf`;
    await exportElementToPdf('success-registration-card', { fileName });
    setDownloading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Congratulatory Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-emerald-600/20 text-center space-y-3 print:hidden">
        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm shadow-inner">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Data pendaftaran dan berkas Anda telah berhasil tersimpan di sistem SPMB. Simpan atau unduh Kartu Bukti Pendaftaran di bawah ini.
        </p>

        {/* Copy Registration Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="bg-slate-950/85 px-4 py-2.5 rounded-xl text-yellow-400 font-mono font-bold text-lg tracking-wider border border-yellow-400/30">
            {registrationNumber}
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            variant="secondary"
            className="text-xs h-10 gap-1.5 font-semibold bg-white text-emerald-900 hover:bg-emerald-50"
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

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="text-xs text-slate-500">
          <strong className="text-slate-900 block font-semibold">Simpan & Cetak Bukti</strong>
          Unduh dokumen PDF kartu peserta Anda yang dilengkapi QR code & barcode verifikasi.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={downloading}
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5 font-semibold shadow-sm"
          >
            {downloading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Unduh Kartu PDF</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-9 gap-1.5 border-slate-300 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak</span>
          </Button>

          <Link to={`/cek-status?reg=${registrationNumber}`}>
            <Button variant="secondary" size="sm" className="text-xs h-9 gap-1.5 font-semibold">
              <Search className="h-3.5 w-3.5 text-blue-600" />
              <span>Cek Status</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* THE OFFICIAL CARD */}
      <RegistrationCardPDF
        data={formData}
        registrationNumber={registrationNumber}
        school={school}
        majors={majors}
        elementId="success-registration-card"
      />
    </div>
  );
};
