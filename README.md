# 🎓 SPMB Online — Sistem Penerimaan Murid Baru Terpadu
### SMK Negeri 1 Digital Teknologi (T.A. 2026/2027)

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?style=flat&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📌 Tentang Aplikasi

**SPMB Online** adalah platform web terpadu untuk Penerimaan Peserta Didik Baru (PPDB/SPMB) pada sekolah kejuruan (**SMK Negeri 1 Digital Teknologi**). Aplikasi ini dirancang untuk mempermudah calon siswa dalam melakukan pendaftaran secara mandiri serta membantu panitia PPDB dalam memverifikasi berkas, melakukan perangkingan nilai akhir secara otomatis, dan mengumumkan hasil seleksi secara transparan.

Web ini menerapkan prinsip **UI Minimalism** bertema *EducateX* dengan palet warna Teal & Emerald yang modern, ramah pengguna di semua perangkat (*mobile & desktop*), dan memenuhi standar aksesibilitas web.

---

## 🚀 Fitur Utama

### 👨‍🎓 Portal Calon Siswa (Publik)
1. **Landing Page Interaktif**:
   - Informasi lengkap profil sekolah, akreditasi A, keunggulan *Teaching Factory*, dan 30+ mitra industri.
   - Pilihan 4 program keahlian unggulan (**RPL, TKJ, DKV, AKL**) lengkap dengan rincian fasilitas laboratorium dan prospek karier.
   - Timeline jadwal resmi PPDB dan dokumen persyaratan.
   - Ticker berita dan pengumuman resmi sekolah.
2. **Formulir Pendaftaran Online Multi-Step**:
   - Pengisian biodata diri (NIK, NISN, nama lengkap, tempat/tanggal lahir, alamat).
   - Pengisian data orang tua/wali dan kontak darurat.
   - Pemilihan maksimal 2 jurusan (Pilihan 1 Prioritas & Pilihan 2 Alternatif).
   - Input nilai rapor 5 semester (Matematika, B. Indonesia, B. Inggris, IPA, IPS).
   - Input sertifikat prestasi kejuaraan (Tingkat Sekolah hingga Internasional).
   - Unggah dokumen persyaratan (Pasfoto 3x4, Scan Ijazah/SKL, Scan Kartu Keluarga).
3. **Penerbitan Kartu Peserta Instan (PDF & QR)**:
   - Pembuatan Nomor Registrasi unik otomatis (`REG-2026-XXXXX`).
   - Unduh Kartu Tanda Peserta resmi berformat PDF yang dilengkapi barcode unik (*JsBarcode*) dan QR Code verifikasi.
4. **Portal Cek Status Pendaftaran**:
   - Pencarian cepat menggunakan Nomor Registrasi atau NIK.
   - Informasi status seleksi (*Menunggu Verifikasi, Berkas Terverifikasi, Diterima / Lulus, Cadangan, Ditolak*).
5. **Kalkulator Simulasi Skor**:
   - Simulasi mandiri perhitungan nilai akhir seleksi dengan formula:
     $$\text{Skor Akhir} = (\text{Rata-rata Rapor 5 Semester} \times 70\%) + (\text{Poin Piagam Prestasi} \times 30\%)$$

---

### 🛡️ Portal Administrator & Panitia PPDB
1. **Dashboard Statistik Real-time**:
   - Ringkasan total pendaftar, kuota jurusan terisi, status verifikasi berkas, dan grafik sebaran asal sekolah.
2. **Manajemen Pendaftar**:
   - Pencarian, penyaringan berdasarkan status & jurusan, serta validasi data calon siswa.
   - Verifikasi keabsahan nilai rapor dan dokumen yang diunggah.
   - Fitur ekspor seluruh data pendaftar ke format Excel (`.xlsx`).
3. **Mesin Seleksi & Perangkingan Otomatis**:
   - Perhitungan skor otomatis berdasarkan formula 70% rapor + 30% prestasi.
   - Penetapan kelulusan berdasarkan kapasitas kuota daya tampung masing-masing jurusan.
4. **Manajemen Program Keahlian**:
   - Pengaturan daya tampung kuota jurusan, deskripsi kompetensi, fasilitas lab, dan mitra DUDI.
5. **Pusat Pengumuman & Berita**:
   - Publikasi berita dan surat edaran resmi panitia SPMB.
6. **Pengaturan Sekolah & Kontak**:
   - Konfigurasi profil sekolah, alamat sekretariat, kontak WhatsApp panitia, dan zona waktu.

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Framework Frontend** | React 18 (TypeScript) |
| **Build Tool & Bundler** | Vite 6 |
| **Styling & Design** | Tailwind CSS v4, Tailwind Animate, Lucide Icons |
| **Routing** | React Router DOM v6 (v7 Future Flags enabled) |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Storage) |
| **Generator Dokumen PDF**| jsPDF & html2canvas |
| **Barcode & QR Code** | JsBarcode & QRCode |
| **Export Data** | XLSX (SheetJS) |
| **Form Validation** | Zod |

---

## 📂 Struktur Direktori Proyek

```text
├── public/                     # Asset publik (gambar, favicon, _redirects)
│   └── images/                 # Foto siswa & fasilitas sekolah
├── src/
│   ├── components/             # Komponen UI modular
│   │   ├── admin/              # Komponen khusus panel admin (Sidebar, ProtectedRoute)
│   │   ├── common/             # Navbar, Footer, FAQSection
│   │   ├── home/               # Modul landing page (Hero, Majors, Steps, Schedule, etc.)
│   │   ├── registration/       # Komponen wizard formulir pendaftaran
│   │   └── ui/                 # Komponen UI dasar (Button, Dialog, Badge, Input, Toast)
│   ├── context/                # AuthContext untuk otentikasi admin
│   ├── lib/                    # Supabase client, utilitas scoring, format tanggal
│   ├── pages/                  # Halaman aplikasi
│   │   ├── admin/              # Dashboard, Data Siswa, Seleksi, Jurusan, Pengumuman
│   │   ├── HomePage.tsx        # Halaman utama landing page
│   │   ├── RegistrationPage.tsx# Halaman pendaftaran calon siswa
│   │   ├── StatusCheckPage.tsx # Halaman cek status pendaftaran
│   │   └── LoginPage.tsx       # Halaman login administrator
│   ├── services/               # Layanan API (studentService, adminService, etc.)
│   ├── types/                  # Definisi tipe data TypeScript (spmb.ts)
│   ├── App.tsx                 # Routing utama aplikasi
│   └── main.tsx                # Entry point aplikasi
├── PRD_SPMB.md                 # Product Requirement Document (PRD) resmi
├── package.json                # Konfigurasi dependensi & npm scripts
└── README.md                   # Dokumentasi proyek ini
```

---

## ⚡ Cara Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- **Node.js**: Versi 18.x atau lebih baru
- **npm** / **yarn** / **pnpm**

### 2. Clone / Buka Repository
```bash
git clone https://github.com/RayLunaris/online-registration.git
cd online-registration
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` di direktori *root* proyek:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di `http://localhost:5173`.

### 6. Build untuk Produksi
```bash
npm run build
```
Hasil build siap *deploy* akan tersedia di dalam folder `dist/`.

---

## 🔒 Hak Akses & Kredensial Panitia

- **Portal Pendaftaran & Cek Status**: Dapat diakses langsung oleh publik.
- **Portal Admin**: Memerlukan akun panitia resmi melalui rute `/admin/login`.

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan untuk kebutuhan sistem penerimaan siswa baru SMK Negeri 1 Digital Teknologi. Dikelola di bawah lisensi MIT.
