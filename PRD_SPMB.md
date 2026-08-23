# Product Requirements Document (PRD)
# Sistem Penerimaan Murid Baru (SPMB)

**Versi:** 1.0  
**Tanggal:** 21 Agustus 2026  
**Status:** Draft  
**Bahasa:** Bilingual (Bahasa Indonesia / English)

---

## 1. Ringkasan Eksekutif / Executive Summary

Aplikasi SPMB adalah platform web untuk mengelola proses penerimaan murid baru di sekolah menengah kejuruan (SMK). Sistem ini menyederhanakan alur pendaftaran dari sisi calon siswa (front-end publik) dan mempermudah pengelolaan data oleh admin/panitia (back-end). Dibangun dengan tech stack modern: **React**, **Supabase**, **Tailwind CSS**, dan **shadcn/ui**.

---

## 2. Latar Belakang / Background

Proses PPDB (Penerimaan Peserta Didik Baru) di banyak sekolah masih dilakukan secara manual — formulir kertas, antrian fisik, dan rekap data yang memakan waktu. Aplikasi ini hadir untuk mendigitalisasi seluruh alur tersebut, mulai dari pendaftaran online, pengelolaan berkas, hingga pengumuman hasil seleksi secara otomatis.

---

## 3. Tujuan Produk / Product Goals

| # | Tujuan |
|---|--------|
| 1 | Mempermudah calon siswa mendaftar secara online tanpa perlu datang ke sekolah |
| 2 | Menyediakan sistem seleksi otomatis berbasis nilai rapor & prestasi |
| 3 | Memberikan admin kontrol penuh atas data pendaftar, jurusan, dan pengumuman |
| 4 | Menghasilkan kartu pendaftaran PDF secara otomatis |
| 5 | Mendukung antarmuka bilingual (Bahasa Indonesia & English) |

---

## 4. Pengguna / Users

### 4.1 Calon Siswa (Public User)
- Mengakses landing page tanpa login
- Mengisi form pendaftaran online
- Mengecek status pendaftaran via nomor pendaftaran
- Mencetak kartu pendaftaran (PDF)
- Melihat hasil seleksi (Diterima / Tidak Diterima)

### 4.2 Admin / Operator Sekolah
- Login via Supabase Authentication
- Mengelola seluruh data calon siswa (CRUD)
- Mengelola jurusan, asal sekolah, pengumuman
- Melihat dashboard statistik pendaftar
- Mengekspor data ke Excel/CSV
- Mencetak laporan rekap per jurusan
- Mengatur informasi dan konfigurasi sekolah

---

## 5. Fitur & Requirement / Features & Requirements

### 5.1 Landing Page (Front Office)

#### 5.1.1 Konten Wajib
| Komponen | Deskripsi |
|----------|-----------|
| Hero Section | Nama sekolah, tagline, tombol CTA pendaftaran |
| Informasi Sekolah | Nama, alamat, no. telp, NPSN, tahun pelajaran, logo |
| Jurusan | Daftar jurusan yang tersedia beserta deskripsi singkat |
| Keunggulan Sekolah | Poin-poin unggulan (card/icon based) |
| Proses Pendaftaran | Langkah-langkah cara daftar (step by step) |
| Syarat Pendaftaran | Dokumen dan persyaratan yang dibutuhkan |
| Berita & Pengumuman | Artikel/pengumuman terbaru dari admin |
| Cek Status Pendaftaran | Input nomor pendaftaran → tampil status |
| Footer | Kontak, sosial media, copyright |

#### 5.1.2 CTA Utama
- Tombol **"Daftar Sekarang / Register Now"** → ke form pendaftaran
- Tombol **"Cek Status Pendaftaran / Check Registration Status"**

---

### 5.2 Form Pendaftaran

#### 5.2.1 Data yang Dikumpulkan

**A. Data Pribadi Calon Siswa**
- Nama lengkap
- Tempat & tanggal lahir
- Jenis kelamin
- Agama
- Alamat lengkap
- No. HP / WhatsApp
- Email

**B. Data Orang Tua / Wali**
- Nama ayah & ibu
- Pekerjaan orang tua
- No. HP orang tua

**C. Asal Sekolah**
- Nama sekolah asal (dengan autocomplete dari data master)
- Tahun lulus / kelulusan

**D. Pilihan Jurusan**
- Pilihan jurusan 1 (wajib)
- Pilihan jurusan 2 (opsional)

**E. Nilai Rapor (5 Semester)**
| Semester | Mata Pelajaran | Nilai |
|----------|---------------|-------|
| Semester 1–5 | Matematika, B. Indonesia, B. Inggris, IPA, IPS | Input angka |

**F. Prestasi / Sertifikat**
- Upload sertifikat prestasi (maks. 3 file, format PDF/JPG)
- Deskripsi prestasi

**G. Upload Dokumen**
- Foto 3x4 terbaru (JPG/PNG, maks 2MB)
- Scan ijazah / SKL (PDF/JPG, maks 5MB)
- Scan kartu keluarga (PDF/JPG, maks 5MB)

#### 5.2.2 Alur Setelah Submit
```
Isi Form → Submit → Generate Nomor Pendaftaran → 
Tampil Halaman Konfirmasi → Tombol Cetak Kartu Pendaftaran (PDF)
```

---

### 5.3 Kartu Pendaftaran (PDF Auto-Generate)

Kartu pendaftaran digenerate secara otomatis setelah form berhasil disubmit, berisi:
- Logo & nama sekolah
- Nomor pendaftaran (unik)
- Foto calon siswa
- Data ringkas (nama, TTL, asal sekolah, pilihan jurusan)
- Tanggal pendaftaran
- Catatan syarat & langkah selanjutnya
- Barcode / QR Code nomor pendaftaran

---

### 5.4 Sistem Seleksi Otomatis (Scoring Engine)

#### 5.4.1 Logika Scoring
Sistem secara otomatis menghitung skor berdasarkan:

| Komponen | Bobot |
|----------|-------|
| Rata-rata nilai rapor 5 semester | 70% |
| Prestasi / sertifikat | 30% |

**Detail Perhitungan Prestasi:**
| Tingkat Prestasi | Poin |
|-----------------|------|
| Internasional | 100 |
| Nasional | 80 |
| Provinsi | 60 |
| Kabupaten/Kota | 40 |
| Sekolah | 20 |

#### 5.4.2 Proses Seleksi
1. Admin men-trigger proses seleksi dari dashboard
2. Sistem meranking calon siswa per jurusan berdasarkan total skor
3. Siswa dengan skor tertinggi hingga batas kuota jurusan → **Diterima**
4. Siswa di luar kuota → **Tidak Diterima**
5. Admin dapat mengubah status secara manual jika diperlukan
6. Admin mempublikasikan hasil → calon siswa dapat mengecek via halaman cek status

---

### 5.5 Panel Admin

#### 5.5.1 Autentikasi
- Login dengan email & password via Supabase Auth
- Fitur lupa password (reset via email)
- Session management (auto-logout)

#### 5.5.2 Dashboard
- Total pendaftar
- Jumlah per jurusan
- Status pendaftar (Belum diproses / Diterima / Tidak Diterima)
- Grafik tren pendaftaran per hari/minggu
- Progress kuota per jurusan (terisi / total)

#### 5.5.3 CRUD Modul

**Calon Siswa**
- Tabel list dengan filter & search
- Detail profil lengkap
- Edit status (Manual override)
- Hapus data
- Export ke Excel/CSV

**Jurusan**
- Nama jurusan
- Deskripsi
- Kuota penerimaan
- Status aktif/nonaktif

**Asal Sekolah**
- Nama sekolah
- Kota/Kabupaten
- Provinsi
- NPSN sekolah asal

**Pengumuman / Berita**
- Judul
- Konten (rich text)
- Kategori (Pengumuman / Berita)
- Tanggal publish
- Status (Draft / Published)
- Thumbnail / gambar

#### 5.5.4 Laporan & Ekspor
- Export data calon siswa ke `.xlsx` / `.csv`
- Laporan rekap per jurusan (jumlah pendaftar, diterima, tidak diterima)
- Notifikasi email ke calon siswa saat status diperbarui (via Supabase Edge Functions + SMTP)

#### 5.5.5 Pengaturan Sekolah
- Nama sekolah
- Alamat lengkap
- Nomor telepon
- NPSN
- Tahun pelajaran aktif
- Upload logo sekolah
- Target jumlah siswa baru

---

## 6. Database Schema (Overview)

### Tabel Utama

```
schools              → konfigurasi sekolah (single row)
majors               → jurusan (id, name, description, quota, is_active)
source_schools       → asal sekolah (id, name, city, province, npsn)
students             → calon siswa (id, registration_number, personal data...)
parent_data          → data orang tua (student_id FK)
report_scores        → nilai rapor (student_id FK, semester, subject, score)
achievements         → prestasi siswa (student_id FK, level, description, file_url)
documents            → upload dokumen (student_id FK, type, file_url)
major_choices        → pilihan jurusan (student_id FK, major_id FK, priority)
selection_results    → hasil seleksi (student_id FK, major_id FK, score, status)
announcements        → berita & pengumuman (id, title, content, category, status)
admin_users          → referensi ke Supabase auth.users
```

---

## 7. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| PDF Generation | react-pdf / jsPDF |
| Email Notification | Supabase Edge Functions + Resend / SMTP |
| Excel Export | SheetJS (xlsx) |
| Deployment | Vercel / Netlify |

---

## 8. Scope MVP (Fase 1)

Fitur yang masuk scope MVP pertama:

| Fitur | Status |
|-------|--------|
| Landing page lengkap | ✅ MVP |
| Form pendaftaran (full data) | ✅ MVP |
| Generate kartu pendaftaran PDF | ✅ MVP |
| Cek status pendaftaran | ✅ MVP |
| Admin login | ✅ MVP |
| CRUD Calon Siswa | ✅ MVP |
| CRUD Jurusan | ✅ MVP |
| CRUD Asal Sekolah | ✅ MVP |
| CRUD Pengumuman | ✅ MVP |
| Scoring & seleksi otomatis | ✅ MVP |
| Pengaturan sekolah | ✅ MVP |
| Dashboard statistik | ✅ MVP |

---

## 9. Fitur Post-MVP (Fase 2)

| Fitur | Keterangan |
|-------|-----------|
| Notifikasi email otomatis | Trigger saat status berubah |
| Export Excel/CSV | Data calon siswa |
| Laporan rekap per jurusan | PDF/Excel |
| Antarmuka bilingual (ID/EN) | Toggle bahasa di frontend |
| QR Code verification | Validasi kartu pendaftaran |

---

## 10. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| Performa | Halaman landing load < 3 detik |
| Keamanan | RLS (Row Level Security) Supabase aktif, upload file divalidasi tipe & ukuran |
| Responsif | Mobile-first, support semua ukuran layar |
| Browser | Chrome, Firefox, Edge (versi 2 tahun terakhir) |
| Ketersediaan | 99% uptime (Supabase managed) |

---

## 11. Asumsi & Keterbatasan

- Aplikasi bersifat **single-tenant** (satu instansi untuk satu sekolah)
- Tidak ada integrasi dengan sistem dinas pendidikan / Data Pokok Pendidikan (Dapodik)
- Pembayaran pendaftaran **tidak** termasuk dalam scope
- File upload disimpan di Supabase Storage

---

## 12. Risiko

| Risiko | Mitigasi |
|--------|----------|
| Duplikasi pendaftaran | Validasi unik berdasarkan NIK / nama + TTL |
| File upload besar | Batasi ukuran file, kompres di client side |
| Data bocor | Aktifkan RLS Supabase, hanya admin yang bisa akses data lengkap |

---

*Dokumen ini akan diperbarui seiring perkembangan project. Versi berikutnya akan menyertakan wireframe dan diagram database lengkap.*
