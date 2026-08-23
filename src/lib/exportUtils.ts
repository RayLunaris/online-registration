import * as XLSX from 'xlsx';
import { StudentCompleteDetail, Major } from '@/types/spmb';
import { formatDate, formatScore } from './utils';

/**
 * Format student details into a clean flat object for Excel & CSV export
 */
export const formatStudentForExport = (student: StudentCompleteDetail) => {
  const choice1 = student.major_choices?.find((c) => c.choice_order === 1)?.major;
  const choice2 = student.major_choices?.find((c) => c.choice_order === 2)?.major;

  return {
    'No. Registrasi': student.registration_number,
    'Nama Lengkap': student.full_name,
    'NISN': student.nisn || '-',
    'NIK': student.nik || '-',
    'Tempat Lahir': student.birth_place,
    'Tanggal Lahir': formatDate(student.birth_date),
    'Jenis Kelamin': student.gender,
    'Agama': student.religion,
    'Asal Sekolah SMP/MTs': student.source_school_name,
    'Tahun Lulus': student.graduation_year,
    'No. WhatsApp / HP': student.phone,
    'Alamat Email': student.email,
    'Alamat Domisili': student.address,
    'Nama Ayah': student.parent_data?.father_name || '-',
    'Nama Ibu': student.parent_data?.mother_name || '-',
    'Pekerjaan Orang Tua': student.parent_data?.parent_job || '-',
    'No. HP Orang Tua': student.parent_data?.parent_phone || '-',
    'Pilihan Jurusan 1': choice1 ? `${choice1.name} (${choice1.code})` : '-',
    'Pilihan Jurusan 2': choice2 ? `${choice2.name} (${choice2.code})` : 'Tidak Memilih',
    'Rata-rata Rapor 5 Sem (70%)': formatScore(student.average_report_score),
    'Poin Prestasi (30%)': formatScore(student.achievement_score),
    'Total Skor Seleksi': formatScore(student.total_score),
    'Status Pendaftaran': student.status,
    'Catatan Panitia': student.notes || '-',
    'Waktu Mendaftar': formatDate(student.created_at),
  };
};

/**
 * Export students list as an Excel (.xlsx) file
 */
export const exportStudentsToExcel = (
  students: StudentCompleteDetail[],
  fileName: string = 'Data_Pendaftar_SPMB_2026.xlsx'
) => {
  if (!students || students.length === 0) {
    alert('Tidak ada data pendaftar untuk diekspor.');
    return;
  }

  const exportData = students.map(formatStudentForExport);
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(key.length + 4, 16),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pendaftar SPMB');

  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
};

/**
 * Export students list as a CSV (.csv) file
 */
export const exportStudentsToCSV = (
  students: StudentCompleteDetail[],
  fileName: string = 'Data_Pendaftar_SPMB_2026.csv'
) => {
  if (!students || students.length === 0) {
    alert('Tidak ada data pendaftar untuk diekspor.');
    return;
  }

  const exportData = students.map(formatStudentForExport);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export Recap Summary Report per Major to Excel
 */
export const exportRecapReportToExcel = (
  majors: Major[],
  students: StudentCompleteDetail[],
  fileName: string = 'Laporan_Rekapitulasi_SPMB_2026.xlsx'
) => {
  const recapData = majors.map((m) => {
    const pendaftarCh1 = students.filter((s) => {
      const ch1 = s.major_choices?.find((c) => c.choice_order === 1);
      return ch1?.major_id === m.id;
    });

    const diterima = pendaftarCh1.filter((s) => s.status === 'Diterima').length;
    const terverifikasi = pendaftarCh1.filter((s) => s.status === 'Terverifikasi').length;
    const cadangan = pendaftarCh1.filter((s) => s.status === 'Cadangan').length;
    const ditolak = pendaftarCh1.filter((s) => s.status === 'Tidak Diterima').length;
    const sisaKuota = Math.max(0, m.quota - diterima);

    const totalSkor = pendaftarCh1.reduce((sum, s) => sum + Number(s.total_score || 0), 0);
    const avgSkor = pendaftarCh1.length ? totalSkor / pendaftarCh1.length : 0;

    return {
      'Kode Jurusan': m.code,
      'Nama Program Keahlian': m.name,
      'Kuota Maksimal': m.quota,
      'Total Pendaftar (Pil 1)': pendaftarCh1.length,
      'Lulus / Diterima': diterima,
      'Sisa Kuota': sisaKuota,
      'Berkas Terverifikasi': terverifikasi,
      'Cadangan': cadangan,
      'Tidak Diterima': ditolak,
      'Rata-rata Skor Pendaftar': formatScore(avgSkor),
      'Status Kuota': diterima >= m.quota ? 'TERPENUHI' : 'TERSEDIA',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(recapData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi Jurusan');

  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
};
