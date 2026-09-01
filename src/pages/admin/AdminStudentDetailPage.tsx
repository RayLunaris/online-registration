import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  User, 
  FileText, 
  Award, 
  Compass,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/adminService';
import { schoolService } from '@/services/schoolService';
import { StudentCompleteDetail, Major, StudentStatus } from '@/types/spmb';
import { formatDate, formatScore } from '@/lib/utils';
import { MajorChoicesTab } from '@/components/admin/StudentDetail/MajorChoicesTab';

export const AdminStudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentCompleteDetail | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingStatus, setEditingStatus] = useState<StudentStatus>('Menunggu Verifikasi');
  const [editingNotes, setEditingNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [studentData, majorsData] = await Promise.all([
          adminService.getStudentById(id),
          schoolService.getMajors(),
        ]);
        if (studentData) {
          setStudent(studentData);
          setEditingStatus(studentData.status);
          setEditingNotes(studentData.notes || '');
        }
        setMajors(majorsData);
      } catch (err) {
        console.error('Error fetching student detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSaveStatus = async () => {
    if (!student) return;
    setSavingStatus(true);
    try {
      const res = await adminService.updateStudentStatus(student.id, editingStatus, editingNotes);
      if (res.success) {
        setStudent({
          ...student,
          status: editingStatus,
          notes: editingNotes,
        });
        alert('Status siswa berhasil diperbarui!');
      } else {
        alert(res.error || 'Gagal menyimpan status.');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-500">Memuat detail data calon siswa...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Data Siswa Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Siswa dengan ID/Nomor registrasi tersebut tidak terdaftar di sistem.</p>
        <Button onClick={() => navigate('/admin/siswa')} variant="outline" size="sm" className="gap-2 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Siswa</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/siswa')}
            className="h-8 w-8 p-0 rounded-full border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                {student.registration_number}
              </span>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 text-[10px]">
                {student.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {student.full_name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Asal Sekolah: <strong>{student.source_school_name}</strong> (Lulusan {student.graduation_year})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/kartu-peserta/${student.registration_number}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak Kartu PDF</span>
          </Link>
        </div>
      </div>

      {/* Quick Action: Status & Catatan Verifikasi */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kelola Status & Catatan Panitia
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="student-detail-status-select" className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Status Verifikasi / Seleksi
              </label>
              <select
                id="student-detail-status-select"
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value as StudentStatus)}
                className="w-full h-9 px-2.5 text-xs rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Diterima">Diterima (Lulus)</option>
                <option value="Tidak Diterima">Tidak Diterima</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="student-detail-notes-input" className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Catatan Verifikasi (Tampil di portal siswa)
              </label>
              <div className="flex gap-2">
                <Input
                  id="student-detail-notes-input"
                  placeholder="Catatan verifikasi berkas atau instruksi khusus..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
                <Button
                  size="sm"
                  disabled={savingStatus}
                  onClick={handleSaveStatus}
                  className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shrink-0"
                >
                  {savingStatus ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL TABS */}
      <Tabs defaultValue="major-choices" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="major-choices" className="text-xs gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            <span>Pilihan Jurusan & Seleksi</span>
          </TabsTrigger>
          <TabsTrigger value="biodata" className="text-xs gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>Biodata & Orang Tua</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="text-xs gap-1.5">
            <Award className="h-3.5 w-3.5" />
            <span>Nilai Rapor & Prestasi</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Berkas Dokumen ({student.documents?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PILIHAN JURUSAN (2 CARDS BERDAMPINGAN) */}
        <TabsContent value="major-choices" className="space-y-4">
          <MajorChoicesTab student={student} majors={majors} />
        </TabsContent>

        {/* TAB 2: BIODATA & ORANG TUA */}
        <TabsContent value="biodata" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Pribadi Siswa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">NISN / NIK</span>
                    <span className="font-mono font-medium">{student.nisn || '-'} / {student.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tempat, Tanggal Lahir</span>
                    <span>{student.birth_place}, {formatDate(student.birth_date)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jenis Kelamin / Agama</span>
                    <span>{student.gender} / {student.religion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">No. WhatsApp</span>
                    <span>{student.phone}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span>{student.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Alamat Lengkap</span>
                  <span className="text-slate-600 dark:text-slate-400">{student.address}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Orang Tua / Wali
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Ayah / Ibu</span>
                  <span className="font-medium">{student.parent_data?.father_name || '-'} / {student.parent_data?.mother_name || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">No. WhatsApp Orang Tua</span>
                  <span>{student.parent_data?.parent_phone || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Pekerjaan Orang Tua</span>
                  <span>{student.parent_data?.parent_job || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Alamat Orang Tua</span>
                  <span className="text-slate-600 dark:text-slate-400">{student.parent_data?.parent_address || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: NILAI RAPOR & PRESTASI */}
        <TabsContent value="academic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nilai Rapor Semester 1 - 5
                </CardTitle>
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs">
                  Rata-rata: {formatScore(student.average_report_score)}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {student.report_scores && student.report_scores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Semester</th>
                          <th className="py-2.5 px-3">Mata Pelajaran</th>
                          <th className="py-2.5 px-3 text-right">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {student.report_scores.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-mono">Sem {r.semester}</td>
                            <td className="py-2 px-3">{r.subject}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">{r.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nilai rapor belum diinputkan.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Piagam / Sertifikat Prestasi
                </CardTitle>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 font-mono text-xs">
                  Poin: {formatScore(student.achievement_score)}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {student.achievements && student.achievements.length > 0 ? (
                  student.achievements.map((ach) => (
                    <div key={ach.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{ach.title}</span>
                        <Badge className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          +{ach.points} Poin
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Tingkat {ach.level} {ach.description ? `• ${ach.description}` : ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada piagam prestasi yang dilampirkan.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: BERKAS DOKUMEN */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Lampiran Berkas Persyaratan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {student.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">{doc.file_name}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Tidak ada dokumen terlampir.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
