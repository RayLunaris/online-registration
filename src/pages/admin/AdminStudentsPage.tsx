import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Printer, 
  Award, 
  RefreshCw, 
  X,
  FileSpreadsheet, 
  Download 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { schoolService } from '@/services/schoolService';
import { StudentCompleteDetail, Major, StudentStatus } from '@/types/spmb';
import { formatDate, formatScore } from '@/lib/utils';
import { exportStudentsToExcel, exportStudentsToCSV } from '@/lib/exportUtils';
import { StudentTable } from '@/components/admin/StudentTable';
import { MajorChoicesTab } from '@/components/admin/StudentDetail/MajorChoicesTab';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentCompleteDetail[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedMajorId, setSelectedMajorId] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student for Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentCompleteDetail | null>(null);
  const [editingStatus, setEditingStatus] = useState<StudentStatus>('Menunggu Verifikasi');
  const [editingNotes, setEditingNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Delete State
  const [studentToDelete, setStudentToDelete] = useState<StudentCompleteDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, majorsData] = await Promise.all([
        adminService.getAllStudents({
          status: selectedStatus,
          majorId: selectedMajorId,
          search: searchQuery,
        }),
        schoolService.getMajors(),
      ]);
      setStudents(studentsData);
      setMajors(majorsData);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedMajorId, searchQuery]);

  const handleOpenDetail = (student: StudentCompleteDetail) => {
    setSelectedStudent(student);
    setEditingStatus(student.status);
    setEditingNotes(student.notes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedStudent) return;
    setSavingStatus(true);
    try {
      const res = await adminService.updateStudentStatus(
        selectedStudent.id,
        editingStatus,
        editingNotes
      );
      if (res.success) {
        setSelectedStudent({
          ...selectedStudent,
          status: editingStatus,
          notes: editingNotes,
        });
        loadData();
      } else {
        alert(res.error || 'Gagal memperbarui status siswa.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteStudent(studentToDelete.id);
      if (res.success) {
        setStudentToDelete(null);
        if (selectedStudent?.id === studentToDelete.id) {
          setSelectedStudent(null);
        }
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus data siswa.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus data.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Data Calon Siswa & Pendaftar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola verifikasi berkas nilai rapor, prestasi, dan status kelulusan seleksi siswa (Pilihan 1 & Pilihan 2).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportStudentsToExcel(students)}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 gap-1.5 font-semibold shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportStudentsToCSV(students)}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 gap-1.5 font-semibold shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </Button>
          <Link to="/admin/seleksi">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 font-semibold shadow-xs">
              <Award className="h-3.5 w-3.5" />
              <span>Scoring Seleksi</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <label htmlFor="student-search-input" className="sr-only">Cari Nama, No. Reg, atau SMP</label>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="student-search-input"
              name="studentSearch"
              placeholder="Cari Nama / No. Reg / SMP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari Nama, Nomor Registrasi, atau SMP"
              className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-teal-500"
            />
          </div>

          {/* Status & Major Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Status */}
            <label htmlFor="filter-status-select" className="sr-only">Filter Status Pendaftaran</label>
            <select
              id="filter-status-select"
              name="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter Status Pendaftaran"
              className="h-9 px-3 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Diterima">Diterima</option>
              <option value="Tidak Diterima">Tidak Diterima</option>
            </select>

            {/* Filter Jurusan */}
            <label htmlFor="filter-major-select" className="sr-only">Filter Pilihan Jurusan</label>
            <select
              id="filter-major-select"
              name="majorFilter"
              value={selectedMajorId}
              onChange={(e) => setSelectedMajorId(e.target.value)}
              aria-label="Filter Pilihan Jurusan"
              className="h-9 px-3 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500"
            >
              <option value="Semua">Semua Jurusan Pilihan 1</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* STUDENTS TABLE */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Daftar Calon Siswa Terdaftar ({students.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-500">Memuat data pendaftar...</p>
            </div>
          ) : students.length > 0 ? (
            <StudentTable
              students={students}
              majors={majors}
              onOpenDetail={handleOpenDetail}
              onDeleteStudent={setStudentToDelete}
            />
          ) : (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              Belum ada data pendaftar yang cocok dengan filter pencarian.
            </div>
          )}
        </CardContent>
      </Card>

      {/* DETAIL / VERIFICATION MODAL DIALOG */}
      {selectedStudent && (
        <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative z-50 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 block mb-1">
                    {selectedStudent.registration_number}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.full_name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Asal: {selectedStudent.source_school_name} (Lulus {selectedStudent.graduation_year})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/siswa/${selectedStudent.id}`}
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-teal-600 flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800"
                  >
                    <span>Halaman Penuh</span>
                  </Link>
                  <Link
                    to={`/kartu-peserta/${selectedStudent.registration_number}`}
                    target="_blank"
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Buka Kartu PDF</span>
                  </Link>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Status Update Form Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Ubah Status & Catatan Verifikasi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="student-status-select" className="text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer">Status Seleksi</label>
                    <select
                      id="student-status-select"
                      name="editingStatus"
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as StudentStatus)}
                      className="w-full h-9 px-2.5 text-xs rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Terverifikasi">Terverifikasi</option>
                      <option value="Diterima">Diterima (Lulus)</option>
                      <option value="Tidak Diterima">Tidak Diterima</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="student-notes-input" className="text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer">Catatan Panitia (Opsional)</label>
                    <Input
                      id="student-notes-input"
                      name="editingNotes"
                      placeholder="Catatan verifikasi berkas atau instruksi daftar ulang"
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    disabled={savingStatus}
                    onClick={handleSaveStatus}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-4 gap-1.5 font-semibold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{savingStatus ? 'Menyimpan...' : 'Simpan Status'}</span>
                  </Button>
                </div>
              </div>

              {/* 2 CARDS BERDAMPINGAN: EVALUASI PILIHAN 1 & PILIHAN 2 */}
              <div>
                <MajorChoicesTab student={selectedStudent} majors={majors} />
              </div>

              {/* Details Biodata & Berkas */}
              <div className="space-y-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Biodata Grid */}
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                    Biodata & Kontak
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">NISN / NIK:</span>
                      <span className="font-mono">{selectedStudent.nisn || '-'} / {selectedStudent.nik || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">TTL:</span>
                      <span>{selectedStudent.birth_place}, {formatDate(selectedStudent.birth_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Gender / Agama:</span>
                      <span>{selectedStudent.gender} / {selectedStudent.religion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">WhatsApp:</span>
                      <span>{selectedStudent.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Email:</span>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Alamat Lengkap:</span>
                      <span className="text-slate-600 dark:text-slate-400">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>

                {/* Orang Tua & Skor Rapor Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Orang Tua */}
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                      Data Orang Tua / Wali
                    </h4>
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Nama Ayah / Ibu:</span>
                        <span>{selectedStudent.parent_data?.father_name || '-'} / {selectedStudent.parent_data?.mother_name || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">No. HP Orang Tua:</span>
                        <span>{selectedStudent.parent_data?.parent_phone || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Pekerjaan:</span>
                        <span>{selectedStudent.parent_data?.parent_job || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skor Rapor & Prestasi */}
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                      Rincian Nilai & Poin
                    </h4>
                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-500 dark:text-slate-400">Rata Rapor (70%):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatScore(selectedStudent.average_report_score)}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-500 dark:text-slate-400">Poin Prestasi (30%):</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{formatScore(selectedStudent.achievement_score)}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Total Skor Terhitung:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatScore(selectedStudent.total_score)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dokumen Terunggah */}
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                    Berkas & Dokumen Terunggah
                  </h4>
                  {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic text-[11px]">Tidak ada berkas fisik terlampir.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {studentToDelete && (
        <Dialog open={Boolean(studentToDelete)} onOpenChange={(open) => !open && setStudentToDelete(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Hapus Data Pendaftar?</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tindakan ini tidak dapat dibatalkan.</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Anda yakin ingin menghapus data calon siswa <strong>{studentToDelete.full_name}</strong> (No. Reg: {studentToDelete.registration_number})? Seluruh nilai rapor, prestasi, dan berkas terkait akan terhapus dari sistem.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStudentToDelete(null)}
                  className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  disabled={deleting}
                  onClick={handleDeleteStudent}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus Data'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

