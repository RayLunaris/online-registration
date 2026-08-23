import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Share2, 
  Check, 
  Search, 
  AlertCircle, 
  GraduationCap, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RegistrationCardPDF } from '@/components/registration/RegistrationCardPDF';
import { exportElementToPdf } from '@/lib/pdfGenerator';
import { studentService } from '@/services/studentService';
import { schoolService } from '@/services/schoolService';
import { StudentCompleteDetail, School, Major } from '@/types/spmb';

export const RegistrationCardPage: React.FC = () => {
  const { regNumber } = useParams<{ regNumber: string }>();
  const [student, setStudent] = useState<StudentCompleteDetail | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadCardData = async () => {
      if (!regNumber) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const [studentData, schoolData, majorsData] = await Promise.all([
          studentService.getStudentByRegistrationNumber(regNumber),
          schoolService.getSchoolProfile(),
          schoolService.getMajors(),
        ]);

        if (!studentData) {
          setErrorMsg(`Data pendaftaran dengan nomor "${regNumber}" tidak ditemukan.`);
        } else {
          setStudent(studentData);
        }
        setSchool(schoolData);
        setMajors(majorsData);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memuat kartu pendaftaran.');
      } finally {
        setLoading(false);
      }
    };

    loadCardData();
  }, [regNumber]);

  const handleDownloadPDF = async () => {
    if (!student) return;
    setExporting(true);
    const fileName = `Kartu_Pendaftaran_${student.registration_number}.pdf`;
    await exportElementToPdf('official-registration-card', { fileName });
    setExporting(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Memuat kartu pendaftaran...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !student) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="container mx-auto px-4 max-w-md text-center space-y-4">
          <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Kartu Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600">{errorMsg}</p>
          <div className="pt-2 flex justify-center gap-2">
            <Link to="/cek-status">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Cek Status Lain
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6">
        {/* Top Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to={`/cek-status?reg=${student.registration_number}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Status Pendaftaran
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* Share / Copy Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs h-9 gap-1.5 bg-white border-slate-200 hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </Button>

            {/* Print Directly */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs h-9 gap-1.5 bg-white border-slate-200 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak</span>
            </Button>

            {/* Download PDF Button */}
            <Button
              size="sm"
              disabled={exporting}
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5 font-semibold shadow-sm"
            >
              {exporting ? (
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
          </div>
        </div>

        {/* The Card Component */}
        <RegistrationCardPDF
          data={student}
          registrationNumber={student.registration_number}
          school={school}
          majors={majors}
          elementId="official-registration-card"
        />
      </div>
    </div>
  );
};
