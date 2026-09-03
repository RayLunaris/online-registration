# Product Requirements Document (PRD)
# Sistem Penerimaan Murid Baru (SPMB)

**Versi:** 1.1  
**Tanggal:** 02 September 2026  
**Status:** Draft  
**Bahasa:** Bilingual (Bahasa Indonesia / English)

**Changelog v1.1:**
- Revisi 5.4: Sistem seleksi kini memproses **dua pilihan jurusan** (2-tahap), bukan satu
- Tambahan 5.6: Fitur Peringkat Publik (Leaderboard) dengan nama tersamar
- Revisi 6: Skema `selection_results` menyimpan status kedua pilihan
- Revisi 8: MVP scope diperbarui

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

#### 5.2.3 Transparansi Hasil di Halaman Cek Status

Karena proses seleksi mengevaluasi 2 pilihan jurusan (lihat 5.4.2), halaman Cek Status Pendaftaran harus menjelaskan **dari pilihan mana** siswa diterima, bukan hanya status akhir:

| Kondisi | Pesan yang Ditampilkan |
|---------|------------------------|
| Diterima di Pilihan 1 | "Selamat! Anda diterima di [Jurusan] (Pilihan 1)" |
| Diterima di Pilihan 2 | "Selamat! Anda diterima di [Jurusan] (Pilihan 2). Kuota Pilihan 1 Anda ([Jurusan 1]) sudah terpenuhi oleh pendaftar dengan nilai lebih tinggi." |
| Tidak diterima di keduanya | "Mohon maaf, Anda belum diterima di Pilihan 1 maupun Pilihan 2 pada periode ini." |

Skor dan ranking di kedua pilihan ditampilkan dalam card kecil (collapsible) agar siswa dapat melihat posisinya secara transparan.

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

#### 5.4.2 Proses Seleksi Dua Tahap (2 Pilihan Jurusan)

> **Catatan penting:** Karena siswa mengisi 2 pilihan jurusan (5.2.1.D), sistem **wajib** mengevaluasi kedua pilihan tersebut — bukan hanya pilihan pertama. Siswa yang tergeser dari pilihan 1 (skor tidak masuk kuota) harus otomatis dievaluasi ulang untuk pilihan 2.

**Tahap 1 — Evaluasi Pilihan 1:**
1. Admin men-trigger proses seleksi dari dashboard
2. Sistem menghitung `total_score` semua siswa berstatus pending
3. Per jurusan: ranking siswa yang menjadikan jurusan tsb sebagai **Pilihan 1**, urutkan skor tertinggi ke terendah
4. Siswa dengan rank ≤ kuota jurusan → `choice1_status = accepted`
5. Siswa dengan rank > kuota → `choice1_status = rejected` (lanjut ke Tahap 2)

**Tahap 2 — Evaluasi Pilihan 2 (untuk siswa yang tergeser):**
1. Untuk siswa `choice1_status = rejected`, ambil jurusan **Pilihan 2** mereka
2. Hitung sisa kuota jurusan tersebut (kuota dikurangi jumlah yang sudah diterima dari Pilihan 1 jurusan yang sama)
3. Ranking siswa berdasarkan skor, isi sisa kuota → `choice2_status = accepted` / `rejected`
4. Siswa tanpa pilihan 2 → `choice2_status = not_applicable`

**Penentuan Hasil Akhir:**
- Jika `choice1_status = accepted` → diterima di Pilihan 1
- Jika tidak, dan `choice2_status = accepted` → diterima di Pilihan 2
- Jika keduanya `rejected`/`not_applicable` → **Tidak Diterima**

**Contoh kasus:**
```
Siswa: Ahmad
Pilihan 1: RPL → Rank #85 dari kuota 72 → TIDAK MASUK
Pilihan 2: DKV → Rank #12 dari kuota 36 → MASUK
─────────────────────────────────────────────────
Hasil Akhir: DITERIMA di DKV (dari Pilihan 2)
```

**Lain-lain:**
- Admin dapat mengubah status secara manual (override) jika diperlukan — perubahan manual ditandai `is_manual_override = true` agar tidak tertimpa jika seleksi dijalankan ulang
- Panel admin (5.5.3) menampilkan status **kedua pilihan** secara eksplisit, bukan hanya hasil akhir, agar admin bisa mengaudit proses
- Admin mempublikasikan hasil → calon siswa dapat mengecek via halaman cek status, dengan penjelasan jika diterima dari Pilihan 2 (lihat 5.2.3)

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
- **Toggle "Tampilkan Peringkat Publik"** (aktif/nonaktif, default: nonaktif — lihat 5.6)

---

### 5.6 Peringkat Publik (Leaderboard) — Opsional

> **Pertimbangan privasi:** Mayoritas calon siswa SPMB adalah anak di bawah umur (14–15 tahun). Fitur ini dirancang agar transparan tanpa membocorkan identitas penuh siswa ke publik.

#### 5.6.1 Ketentuan Data
- Fitur ini **opsional**, diaktifkan/nonaktifkan admin dari Pengaturan Sekolah (default: **nonaktif**)
- Dapat diakses publik tanpa login jika diaktifkan
- Data yang ditampilkan **hanya**:
  - Nomor pendaftaran (untuk fitur pencarian)
  - **Nama tersamar** — format: kata pertama nama lengkap + inisial kata kedua (contoh: "Ahmad Fauzi Rahman" → "Ahmad F.")
  - Jurusan, total skor, peringkat (rank) dalam jurusan tersebut
  - Status "Dalam kuota" / "Di luar kuota"
- Data yang **tidak pernah** ditampilkan: nama lengkap asli, alamat, nomor HP, email, nilai rapor per mapel, data orang tua, dokumen upload

#### 5.6.2 Fitur Halaman
- Leaderboard **per jurusan** (tab navigasi antar jurusan)
- Diurutkan berdasarkan total skor tertinggi
- Fitur "Cari Posisi Saya" — input nomor pendaftaran → highlight & scroll otomatis ke baris terkait
- Update otomatis setiap kali admin menjalankan ulang proses seleksi

#### 5.6.3 Implementasi Teknis
- Penyamaran nama dilakukan di level **database** (PostgreSQL VIEW + function), bukan di frontend, agar data mentah tidak pernah terkirim ke client
- Row Level Security (RLS): VIEW dapat diakses oleh role `anon` karena data sudah ter-mask sebelum query

---

## 6. Database Schema (Overview)

### Tabel Utama

```
schools              → konfigurasi sekolah (single row, termasuk show_public_leaderboard)
majors               → jurusan (id, name, description, quota, is_active)
source_schools       → asal sekolah (id, name, city, province, npsn)
students             → calon siswa (id, registration_number, personal data...)
parent_data          → data orang tua (student_id FK)
report_scores        → nilai rapor (student_id FK, semester, subject, score)
achievements         → prestasi siswa (student_id FK, level, description, file_url)
documents            → upload dokumen (student_id FK, type, file_url)
major_choices        → pilihan jurusan (student_id FK, major_id FK, priority)
selection_results    → hasil seleksi DUA PILIHAN (lihat detail di bawah)
announcements        → berita & pengumuman (id, title, content, category, status)
admin_users          → referensi ke Supabase auth.users
```

### Detail Tabel `selection_results` (Revisi v1.1)

Menyimpan status di **kedua pilihan** jurusan, bukan satu hasil akhir saja:

```
selection_results
├── id
├── student_id (FK)
├── choice1_major_id (FK)
├── choice1_rank
├── choice1_status        → accepted / rejected / not_processed
├── choice2_major_id (FK)
├── choice2_rank
├── choice2_status        → accepted / rejected / not_applicable / not_processed
├── final_accepted_major_id (FK, nullable)
├── final_accepted_from_priority → 1 / 2 / NULL
├── total_score
├── rapor_score
├── achievement_score
├── is_manual_override    → boolean, true jika status diubah manual oleh admin
└── processed_at
```

### VIEW Tambahan — `public_leaderboard`

Untuk fitur Peringkat Publik (5.6), dibuat PostgreSQL VIEW terpisah yang hanya mengekspos data ter-mask:

```
public_leaderboard (VIEW, read-only, dapat diakses role anon)
├── registration_number
├── masked_name           → hasil function mask_name(full_name)
├── major_id, major_name
├── total_score
├── rank_in_major
└── is_within_quota       → boolean (rank <= kuota jurusan)
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
| Form pendaftaran (full data, 2 pilihan jurusan) | ✅ MVP |
| Generate kartu pendaftaran PDF | ✅ MVP |
| Cek status pendaftaran (dengan transparansi pilihan 1/2) | ✅ MVP |
| Admin login | ✅ MVP |
| CRUD Calon Siswa | ✅ MVP |
| CRUD Jurusan | ✅ MVP |
| CRUD Asal Sekolah | ✅ MVP |
| CRUD Pengumuman | ✅ MVP |
| Scoring & seleksi otomatis 2-tahap (dual pilihan) | ✅ MVP |
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
| **Peringkat Publik (Leaderboard)** | Opsional, nama tersamar, per jurusan (lihat 5.6) |

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
| Privasi data anak di bawah umur pada Peringkat Publik | Nama disamarkan di level database (bukan frontend), fitur default nonaktif, tidak ada data kontak/nilai detail yang diekspos |
| Siswa salah paham status "tergeser" dari Pilihan 1 ke Pilihan 2 | Halaman Cek Status menjelaskan secara eksplisit dari pilihan mana siswa diterima |

---

*Dokumen ini akan diperbarui seiring perkembangan project. Versi 1.1 menambahkan logika seleksi dua-tahap (dual pilihan jurusan) dan fitur Peringkat Publik opsional.*
