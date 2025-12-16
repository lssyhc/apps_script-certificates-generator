# 📚 PANDUAN LENGKAP PENGGUNAAN GDOCS AUTOMATOR

---

**Dibuat oleh:** GitHub Copilot

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Persiapan & Instalasi](#2-persiapan--instalasi)
3. [Struktur Menu & Navigasi](#3-struktur-menu--navigasi)
4. [Modul 1: PDF Generator](#4-modul-1-pdf-generator)
5. [Modul 2: Drive Tools](#5-modul-2-drive-tools)
6. [Modul 3: Email Tools](#6-modul-3-email-tools)
7. [Modul 4: Admin Tools](#7-modul-4-admin-tools)
8. [Integrasi Antar Modul (Workflow)](#8-integrasi-antar-modul-workflow)
9. [Parameter & Konfigurasi Detail](#9-parameter--konfigurasi-detail)
10. [Batasan Teknis & Limitasi](#10-batasan-teknis--limitasi)
11. [Keyboard Shortcuts & Tips Produktivitas](#11-keyboard-shortcuts--tips-produktivitas)
12. [Template Siap Pakai](#12-template-siap-pakai)
13. [Troubleshooting & FAQ](#13-troubleshooting--faq)
14. [Debugging & Error Codes](#14-debugging--error-codes)
15. [Best Practices](#15-best-practices)
16. [Glosarium Istilah](#16-glosarium-istilah)
17. [Checklist Penggunaan](#17-checklist-penggunaan)

---

# 1. PENDAHULUAN

## 1.1 Apa itu GDocs Automator? 

**GDocs Automator** adalah aplikasi Google Apps Script yang mengotomatisasi tugas-tugas berulang terkait Google Docs, Slides, Drive, dan Email. Aplikasi ini berjalan langsung di Google Spreadsheet dan tidak memerlukan instalasi software tambahan.

## 1.2 Fitur Utama

| Modul | Fitur | Deskripsi |
|-------|-------|-----------|
| **PDF Generator** | Generate PDF dari Slides/Docs | Buat PDF massal dengan mail merge |
| | Backup & Restore | Simpan dan pulihkan konfigurasi |
| **Drive Tools** | Ekstrak Metadata | Ambil nama dan deskripsi file |
| | Update Metadata | Ubah nama dan deskripsi file massal |
| | Ekstrak Gambar | Tampilkan thumbnail di spreadsheet |
| | List File | Daftar semua file dalam folder |
| **Email Tools** | Share File | Bagikan akses file via email |
| | Send Email Bulk | Kirim email massal |
| **Admin** | View Logs | Monitor aktivitas aplikasi |
| | Reset State | Bersihkan state aplikasi |

## 1.3 Keuntungan Menggunakan GDocs Automator

1. **Hemat Waktu** - Otomatisasi tugas berulang
2. **Minim Error** - Proses konsisten dan terstandar
3. **Gratis** - Menggunakan infrastruktur Google
4. **Aman** - Data tidak keluar dari akun Google Anda
5. **Fleksibel** - Dapat dikustomisasi sesuai kebutuhan

---

# 2. PERSIAPAN & INSTALASI

## 2.1 Persyaratan Sistem

| Komponen | Requirement | Keterangan |
|----------|-------------|------------|
| **Google Account** | Aktif dengan Google Workspace/Gmail | Untuk akses Drive, Docs, Slides, Gmail |
| **Google Sheets** | Spreadsheet baru atau existing | Sebagai "control center" aplikasi |
| **Browser** | Chrome/Firefox/Edge terbaru | Untuk menjalankan Apps Script |
| **Kuota Email** | 100-1500 email/hari | Tergantung jenis akun |
| **Storage Drive** | Cukup untuk PDF yang dihasilkan | ~100KB-2MB per PDF |

## 2.2 Langkah Instalasi

### STEP 1: Buat Google Spreadsheet Baru

1. Buka https://sheets.google.com
2. Klik **"+ Blank"** untuk membuat spreadsheet baru
3. Beri nama:  **"GDocs Automator Control Center"**
4. Simpan (otomatis tersimpan)

### STEP 2: Buka Apps Script Editor

1. Di spreadsheet, klik menu:  **Extensions → Apps Script**
2. Akan terbuka tab baru dengan editor Apps Script
3. Hapus semua kode default di file "Code.gs"

### STEP 3: Salin Kode

1. Salin **SELURUH** isi file `code.gs` yang sudah diperbaiki
2. Paste ke editor Apps Script (ganti semua isi Code.gs)
3. Klik **File → Save** (atau Ctrl+S)
4. Beri nama project: **"GDocs Automator"**

### STEP 4: Buat File dialog. html

1. Di Apps Script editor, klik tanda **"+"** di sebelah "Files"
2. Pilih **"HTML"**
3. Beri nama: **"dialog"** (tanpa . html)
4. Salin **SELURUH** isi file `dialog.html` yang sudah diperbaiki
5. Paste ke file dialog. html
6. Save (Ctrl+S)

### STEP 5: Otorisasi Pertama Kali

1. Di editor, pilih fungsi **"onOpen"** dari dropdown
2. Klik tombol **"Run"** (▶️)
3. Akan muncul dialog "Authorization required"
4. Klik **"Review permissions"**
5. Pilih akun Google Anda
6. Klik **"Advanced"** → **"Go to GDocs Automator (unsafe)"**
7. Klik **"Allow"**

> ⚠️ **CATATAN:** Pesan "unsafe" muncul karena ini script buatan sendiri, bukan dari Google.  Ini normal untuk custom scripts.

### STEP 6: Verifikasi Instalasi

1. Kembali ke Google Spreadsheet
2. Refresh halaman (F5 atau Ctrl+R)
3. Tunggu 3-5 detik
4. Menu **"GDocs Automator"** akan muncul di menu bar

---

# 3. STRUKTUR MENU & NAVIGASI

## 3.1 Hierarki Menu

```
GDocs Automator
├── PDF Generator
│   ├── Generate PDF
│   │   ├── Dari Google Slides
│   │   └── Dari Google Docs
│   ├── ─────────────────────
│   ├── Buat Template
│   ├── Pengaturan Lanjutan
│   ├── ─────────────────────
│   └── Backup & Restore
│       ├── Backup Konfigurasi
│       └── Restore Konfigurasi
│
├── Drive Tools
│   ├── Metadata File
│   │   ├── Ekstrak Nama dan Deskripsi
│   │   └── Update Nama dan Deskripsi
│   ├── ─────────────────────
│   ├── Ekstrak Gambar ke Cell
│   └── Ekstrak List Link File
│
├── Email Tools
│   ├── Share File to Email
│   ├── Send Email Bulk
│   ├── ─────────────────────
│   └── Template Email
│
└── Admin
    ├── View Logs
    ├── Hapus Semua Trigger
    ├── Reset State
    └── Tentang Aplikasi
```

## 3.2 Deskripsi Setiap Menu

| Menu | Sub-Menu | Fungsi |
|------|----------|--------|
| **PDF Generator** | Generate PDF → Dari Google Slides | Buat PDF dari template Slides |
| | Generate PDF → Dari Google Docs | Buat PDF dari template Docs |
| | Buat Template | Buat baris konfigurasi otomatis |
| | Pengaturan Lanjutan | Buka dialog dengan progress bar |
| | Backup & Restore → Backup | Simpan konfigurasi saat ini |
| | Backup & Restore → Restore | Pulihkan konfigurasi tersimpan |
| **Drive Tools** | Metadata File → Ekstrak | Ambil nama & deskripsi file |
| | Metadata File → Update | Ubah nama & deskripsi file |
| | Ekstrak Gambar ke Cell | Tampilkan thumbnail di spreadsheet |
| | Ekstrak List Link File | List semua file dalam folder |
| **Email Tools** | Share File to Email | Bagikan akses file via email |
| | Send Email Bulk | Kirim email massal |
| | Template Email | Buat template untuk bulk email |
| **Admin** | View Logs | Lihat log aktivitas |
| | Hapus Semua Trigger | Hapus scheduled tasks |
| | Reset State | Reset semua state aplikasi |
| | Tentang Aplikasi | Info versi aplikasi |

---

# 4. MODUL 1: PDF GENERATOR

## 4.1 Konsep Dasar

### Apa yang dilakukan modul ini?

1.  Mengambil template Google Slides/Docs
2. Mengganti placeholder (`<<1>>`, `<<2>>`, dst.) dengan data dari spreadsheet
3. Menghasilkan file PDF untuk setiap baris data
4. Menyimpan PDF ke folder Google Drive yang ditentukan
5. Mencatat URL PDF di spreadsheet

### Ilustrasi Alur Kerja

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TEMPLATE      │     │   SPREADSHEET   │     │   OUTPUT        │
│   (Slides/Docs) │     │   (Data)        │     │   (PDF)         │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│                 │     │ Nama  | Kelas   │     │                 │
│  Sertifikat     │     ├───────┼─────────┤     │  Sertifikat     │
│  untuk:          │ ──► │ Andi  | XII-A   │ ──► │  untuk:         │
│  <<1>>          │     │ Budi  | XII-B   │     │  Andi           │
│  Kelas:  <<2>>   │     │ Citra | XII-A   │     │  Kelas: XII-A   │
│                 │     │ ...    | ...      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 4.2 Menyiapkan Template

### 4.2.1 Template Google Slides

**STEP 1: Buat Presentasi Baru**

1. Buka https://slides.google.com
2. Klik **"+ Blank"** atau pilih template yang ada
3. Beri nama: **"Template Sertifikat"** (contoh)

**STEP 2: Desain Slide**

1. Desain slide sesuai kebutuhan (sertifikat, undangan, dll.)
2. Gunakan text box untuk menempatkan konten

**STEP 3: Tambahkan Placeholder**

Placeholder adalah teks yang akan diganti dengan data dari spreadsheet. 

**Format Placeholder:**
```
<<nomor_kolom>>
```

**Contoh:**
- `<<1>>` = akan diganti dengan data kolom A (kolom ke-1)
- `<<2>>` = akan diganti dengan data kolom B (kolom ke-2)
- `<<3>>` = akan diganti dengan data kolom C (kolom ke-3)
- dan seterusnya

**Contoh Desain Template Sertifikat:**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    🏆 SERTIFIKAT 🏆                        │
│                                                            │
│              Diberikan kepada:                              │
│                                                            │
│                     <<1>>                                  │
│              ─────────────────                             │
│                                                            │
│         Sebagai <<2>> dalam kegiatan                       │
│                                                            │
│              "<<3>>"                                       │
│                                                            │
│         yang diselenggarakan pada tanggal                  │
│                     <<4>>                                  │
│                                                            │
│                                                            │
│  Jakarta, <<5>>                                            │
│                                                            │
│  Ketua Panitia            Kepala Sekolah                   │
│                                                            │
│  _______________          _______________                  │
│      <<6>>                    <<7>>                        │
└────────────────────────────────────────────────────────────┘
```

**STEP 4: Catat ID/URL Template**

URL template ada di address bar browser: 
```
https://docs.google.com/presentation/d/[ID_TEMPLATE]/edit
```

Contoh: 
```
https://docs.google.com/presentation/d/1ABC123xyz789/edit
ID Template: 1ABC123xyz789
```

> **TIP:** Anda bisa menggunakan URL lengkap ATAU hanya ID saja. 

### 4.2.2 Template Google Docs

Proses sama dengan Slides, tetapi menggunakan Google Docs: 

1. Buka https://docs.google.com
2. Buat dokumen baru
3. Desain dokumen dengan placeholder `<<1>>`, `<<2>>`, dst.
4. Catat ID/URL template

**Contoh Template Surat:**

```
                                        Jakarta, <<4>>

Nomor    :  <<1>>
Lampiran :  -
Perihal  : <<2>>

Kepada Yth. 
<<3>>
di Tempat

Dengan hormat,

<<5>>

Demikian surat ini kami sampaikan.  Atas perhatian dan 
kerjasamanya, kami ucapkan terima kasih.

                                        Hormat kami,
                                        
                                        
                                        
                                        <<6>>
                                        <<7>>
```

## 4.3 Menyiapkan Folder Hasil

**STEP 1: Buat Folder di Google Drive**

1. Buka https://drive.google.com
2. Klik **"+ New"** → **"New folder"**
3. Beri nama:  **"Hasil PDF Sertifikat"** (contoh)
4. Klik **"Create"**

**STEP 2: Catat ID/URL Folder**

1. Buka folder yang baru dibuat
2. Lihat URL di address bar: 
   ```
   https://drive.google.com/drive/folders/[ID_FOLDER]
   ```

Contoh:
```
https://drive.google.com/drive/folders/1XYZ789abc123
ID Folder:  1XYZ789abc123
```

## 4.4 Menyiapkan Data di Spreadsheet

### 4.4.1 Struktur Spreadsheet

**Baris 1: Konfigurasi (Header)**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Template | [ID/URL Template] | Folder Hasil | [ID/URL Folder] | Jumlah Kolom Data | 7 | Posisi Hasil | 8 | Keterangan Judul | Sertifikat2024 |

**Penjelasan Konfigurasi:**

| Kolom | Cell | Isi | Keterangan |
|-------|------|-----|------------|
| A | A1 | `Template` | Label (jangan diubah) |
| B | B1 | ID/URL Template | Template Slides/Docs |
| C | C1 | `Folder Hasil` | Label (jangan diubah) |
| D | D1 | ID/URL Folder | Folder untuk menyimpan PDF |
| E | E1 | `Jumlah Kolom Data` | Label (jangan diubah) |
| F | F1 | Angka (misal: 7) | Jumlah kolom data yang digunakan |
| G | G1 | `Posisi Hasil` | Label (jangan diubah) |
| H | H1 | Angka (misal:  8) | Kolom untuk menyimpan URL PDF |
| I | I1 | `Keterangan Judul` | Label (jangan diubah) |
| J | J1 | Teks (opsional) | Suffix untuk nama file PDF |

**Baris 2: Header Data (Opsional)**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Nama | Prestasi | Nama Kegiatan | Tgl Event | Tgl Cetak | Ketua Panitia | Kepsek | URL PDF |

**Baris 3 dan seterusnya: Data Aktual**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Andi Wijaya | Juara 1 | Lomba Coding 2024 | 15 Jan 2024 | 20 Jan 2024 | Budi Santoso | Dr. Ahmad | (akan terisi) |
| Budi Pratama | Juara 2 | Lomba Coding 2024 | 15 Jan 2024 | 20 Jan 2024 | Budi Santoso | Dr. Ahmad | (akan terisi) |
| Citra Dewi | Juara 3 | Lomba Coding 2024 | 15 Jan 2024 | 20 Jan 2024 | Budi Santoso | Dr. Ahmad | (akan terisi) |

**Mapping Placeholder ke Kolom:**

```
<<1>> → Kolom A (Nama)           → "Andi Wijaya"
<<2>> → Kolom B (Prestasi)       → "Juara 1"
<<3>> → Kolom C (Nama Kegiatan)  → "Lomba Coding 2024"
<<4>> → Kolom D (Tgl Event)      → "15 Jan 2024"
<<5>> → Kolom E (Tgl Cetak)      → "20 Jan 2024"
<<6>> → Kolom F (Ketua Panitia)  → "Budi Santoso"
<<7>> → Kolom G (Kepsek)         → "Dr. Ahmad"
```

### 4.4.2 Membuat Template Otomatis

Jika Anda tidak ingin mengisi baris 1 secara manual: 

1. Klik menu:  **GDocs Automator → PDF Generator → Buat Template**
2. Baris konfigurasi akan otomatis dibuat di baris 1
3. Ganti placeholder dengan ID/URL yang sebenarnya

## 4.5 Menjalankan PDF Generator

### 4.5.1 Metode 1: Menu Langsung (Tanpa Dialog)

**STEP 1: Pastikan Konfigurasi Benar**

- Baris 1 sudah terisi dengan benar
- Data dimulai dari baris 3
- Template dan folder sudah disiapkan

**STEP 2: Jalankan Generator**

Untuk template Slides:
```
Menu → GDocs Automator → PDF Generator → Generate PDF → Dari Google Slides
```

Untuk template Docs:
```
Menu → GDocs Automator → PDF Generator → Generate PDF → Dari Google Docs
```

**STEP 3: Konfirmasi**

Dialog konfirmasi akan muncul dengan informasi:
- Jumlah file yang akan digenerate
- Nama folder hasil
- Nama template
- Estimasi waktu

Klik **"Yes"** untuk melanjutkan. 

**STEP 4: Proses Berjalan**

1. Script akan memproses setiap baris data
2. Jika waktu hampir habis (>5. 5 menit), akan dijadwalkan lanjutan otomatis
3. Setelah selesai, URL PDF akan muncul di kolom yang ditentukan

### 4.5.2 Metode 2: Dialog dengan Progress Bar (Recommended)

**STEP 1: Buka Dialog**
```
Menu → GDocs Automator → PDF Generator → Pengaturan Lanjutan
```

**STEP 2: Isi Form**

| Field | Contoh Isi |
|-------|------------|
| Jenis Template | Google Slides |
| ID atau URL Template | https://docs.google.com/presentation/d/1ABC. ../edit |
| ID atau URL Folder Hasil | https://drive.google.com/drive/folders/1XYZ...  |
| Jumlah Kolom Data | 7 |
| Posisi Hasil (Kolom) | 8 |
| Keterangan Judul | Sertifikat_2024 |

**STEP 3: Klik "Generate PDF"**

**STEP 4: Monitor Progress**

Progress bar akan menunjukkan: 
- Persentase selesai
- File yang sedang diproses
- Jumlah file (current/total)
- Waktu elapsed

**STEP 5: Selesai**

1. Progress bar akan menjadi hijau
2. Pesan "Selesai!" akan muncul
3. Dialog akan tertutup otomatis setelah 5 detik
4. URL PDF sudah terisi di kolom yang ditentukan

## 4.6 Backup & Restore Konfigurasi

### 4.6.1 Backup Konfigurasi

**Kapan menggunakan:**
- Sebelum mengubah konfigurasi
- Untuk menyimpan konfigurasi yang sudah berfungsi baik
- Sebelum berbagi spreadsheet dengan orang lain

**Cara:**
1. Menu → **GDocs Automator → PDF Generator → Backup & Restore → Backup Konfigurasi**
2. Konfirmasi akan muncul bahwa backup berhasil
3. Maksimal 5 backup tersimpan (yang paling lama akan dihapus otomatis)

### 4.6.2 Restore Konfigurasi

**Cara:**
1. Menu → **GDocs Automator → PDF Generator → Backup & Restore → Restore Konfigurasi**
2. Pilih backup yang ingin di-restore dengan mengetik nomornya
3. Konfirmasi restore
4. Konfigurasi akan dipulihkan ke baris 1-2

---

# 5. MODUL 2: DRIVE TOOLS

## 5.1 Ekstrak Nama dan Deskripsi File

**Fungsi:** Mengambil nama dan deskripsi file dari Google Drive berdasarkan link/ID.

**Use Case:**
- Membuat katalog file
- Audit file-file di Drive
- Dokumentasi asset digital

### Langkah Penggunaan

**STEP 1: Siapkan Data**

Kolom A berisi link file Google Drive: 

| A |
|---|
| Link File |
| https://drive.google.com/file/d/1ABC123/view |
| https://drive.google.com/file/d/2DEF456/view |
| https://drive.google.com/file/d/3GHI789/view |

**STEP 2: Jalankan Fungsi**
```
Menu → GDocs Automator → Drive Tools → Metadata File → Ekstrak Nama dan Deskripsi
```

**STEP 3: Input Kolom**
```
Dialog:  "Masukkan nomor kolom untuk file link (misal: 1 untuk kolom A):"
Ketik: 1
Klik: OK
```

**STEP 4: Konfirmasi**
```
Dialog: "Apakah Anda ingin mengambil nama dan deskripsi sebanyak 3 file?"
Klik: Yes
```

**STEP 5: Hasil**

| A | B | C |
|---|---|---|
| Link File | Nama File | Deskripsi |
| https://drive.google.com/file/d/1ABC123/...  | Dokumen Rapat. pdf | Notulensi rapat 2024 |
| https://drive.google.com/file/d/2DEF456/... | Foto Event.jpg | Dokumentasi acara |
| https://drive.google.com/file/d/3GHI789/... | Laporan Q1.xlsx | Laporan kuartal 1 |

## 5.2 Update Nama dan Deskripsi File

**Fungsi:** Mengubah nama dan/atau deskripsi file di Google Drive berdasarkan data di spreadsheet.

**Use Case:**
- Rename file secara massal
- Menambahkan deskripsi ke banyak file sekaligus
- Standarisasi penamaan file

### Langkah Penggunaan

**STEP 1: Siapkan Data**

| A | B | C |
|---|---|---|
| Link File | Nama Baru | Deskripsi Baru |
| https://drive.google.com/file/d/1ABC123/...  | [2024] Dokumen. pdf | Hasil rapat Januari |
| https://drive.google.com/file/d/2DEF456/...  | [2024] Foto.jpg | Event tahunan |
| https://drive.google.com/file/d/3GHI789/... | [2024] Laporan.xlsx | Q1 Financial Report |

**STEP 2: Jalankan Fungsi**
```
Menu → GDocs Automator → Drive Tools → Metadata File → Update Nama dan Deskripsi
```

**STEP 3: Input Kolom**
```
Dialog: "Masukkan nomor kolom untuk file link (misal: 1 untuk kolom A):"
Ketik: 1
Klik: OK
```

**STEP 4: Konfirmasi dan Proses**

1. Konfirmasi jumlah file yang akan diupdate
2. Klik Yes
3. Tunggu proses selesai
4. Kolom D akan terisi status "OK" atau "Error:  [pesan]"

## 5.3 Ekstrak Gambar ke Cell

**Fungsi:** Menampilkan thumbnail gambar dari file Google Drive langsung di cell spreadsheet.

**Persyaratan:**
- File harus di-share dengan "Anyone with the link" agar thumbnail dapat ditampilkan

### Langkah Penggunaan

**STEP 1: Siapkan Data**

Kolom A berisi link file gambar/PDF di Google Drive. 

**STEP 2: Jalankan Fungsi**
```
Menu → GDocs Automator → Drive Tools → Ekstrak Gambar ke Cell
```

**STEP 3: Input Kolom Link**
```
Dialog: "Masukkan nomor kolom untuk file link (misal: 1 untuk kolom A):"
Ketik: 1
```

**STEP 4: Input Kolom Gambar**
```
Dialog: "Masukkan nomor kolom untuk gambar (misal: 2 untuk kolom B):"
Ketik: 2
```

**STEP 5: Hasil**

Kolom B akan menampilkan thumbnail gambar dari file di kolom A.

**Jika File Tidak Di-Share:**
```
Cell akan berisi:  "Atur akses file menjadi 'Anyone with the link' 
agar bisa menampilkan gambar"
```

## 5.4 Ekstrak List Link File

**Fungsi:** Membuat daftar semua file dalam folder Google Drive (termasuk subfolder).

**Use Case:**
- Inventarisasi file
- Dokumentasi struktur folder
- Audit storage

### Langkah Penggunaan

**STEP 1: Jalankan Fungsi**
```
Menu → GDocs Automator → Drive Tools → Ekstrak List Link File
```

**STEP 2: Input Link Folder**
```
Dialog: "Masukkan link folder Google Drive:"
Ketik:  https://drive.google.com/drive/folders/1XYZ789abc123
Klik: OK
```

**STEP 3: Input Kolom Hasil**
```
Dialog: "Masukkan nomor kolom untuk menyimpan hasil (misal: 1 untuk kolom A):"
Ketik: 1
Klik: OK
```

**STEP 4: Konfirmasi**
```
Dialog: "Akan mengekstrak daftar file dari folder "Nama Folder" 
dan semua subfoldernya.  Lanjutkan?"
Klik: Yes
```

**STEP 5: Hasil**

| A | B | C |
|---|---|---|
| Link | Judul File | Nama Folder Parent |
| https://drive.google.com/file/d/1.../view | Dokumen1.pdf | Folder Utama |
| https://drive.google.com/file/d/2.../view | Gambar1.jpg | Subfolder A |
| https://drive.google.com/file/d/3.../view | Video1.mp4 | Subfolder A |
| https://drive.google.com/file/d/4.../view | Spreadsheet1.xlsx | Subfolder B |

**Batasan:**
- Maksimal kedalaman folder:  10 level
- Maksimal file:  5000 file
- Jika timeout, proses akan berhenti dan Anda bisa menjalankan lagi untuk melanjutkan

---

# 6. MODUL 3: EMAIL TOOLS

## 6.1 Share File to Email

**Fungsi:** Membagikan akses file Google Drive ke email tertentu secara massal.

**Use Case:**
- Mendistribusikan sertifikat yang sudah di-generate
- Berbagi dokumen ke banyak orang sekaligus
- Memberikan akses file hasil kerja

### Langkah Penggunaan

**STEP 1: Siapkan Data**

**Opsi A - Dengan Header Standard:**

| A | B | C |
|---|---|---|
| Email | Link | Status |
| andi@gmail.com | https://drive.google.com/file/d/1ABC. ../...  | |
| budi@gmail.com | https://drive.google.com/file/d/2DEF. ../... | |
| citra@gmail.com | https://drive.google.com/file/d/3GHI. ../... | |

**Opsi B - Custom Layout:**

Jika tidak menggunakan header standard, akan diminta input kolom. 

**STEP 2: Jalankan Fungsi**
```
Menu → GDocs Automator → Email Tools → Share File to Email
```

**STEP 3:  Jika Header Tidak Ditemukan**

Dialog akan meminta input kolom email dan kolom link secara terpisah.

**STEP 4: Konfirmasi**
```
Dialog: "Akan membagikan akses ke 3 file.  Lanjutkan?"
Klik: Yes
```

**STEP 5: Hasil**

| A | B | C |
|---|---|---|
| Email | Link | Status |
| andi@gmail. com | https://drive.google.com/file/d/1ABC.../... | TRUE |
| budi@gmail.com | https://drive.google.com/file/d/2DEF.../... | TRUE |
| citra@gmail.com | https://drive.google.com/file/d/3GHI.../... | Error: ...  |

**Status yang Mungkin:**
- `TRUE` = Berhasil di-share
- `Error: File not found` = File tidak ditemukan
- `Error: Invalid email` = Format email tidak valid
- `Error: Access denied` = Tidak punya izin untuk share file tersebut

## 6.2 Template Email

**Fungsi:** Membuat sheet template untuk pengiriman email massal.

**Cara Menggunakan:**
```
Menu → GDocs Automator → Email Tools → Template Email
```

**Hasil:**

Sheet baru bernama "Email Template" akan dibuat dengan struktur: 

| A | B | C | D |
|---|---|---|---|
| Email | Subject | Body | Status |
| contoh@email.com | Subjek email | Halo, Ini adalah contoh isi email.  Salam, Tim GDocs Automator | |

## 6.3 Send Email Bulk

**Fungsi:** Mengirim email massal berdasarkan data di sheet "Email Template".

### PERHATIAN - Batasan Kuota Email

| Jenis Akun | Kuota Harian | Catatan |
|------------|--------------|---------|
| Gmail Gratis | 100 email/hari | Untuk penggunaan pribadi |
| Google Workspace | 1500 email/hari | Untuk akun berbayar |

### Langkah Penggunaan

**STEP 1: Siapkan Data di Sheet "Email Template"**

| A | B | C | D |
|---|---|---|---|
| Email | Subject | Body | Status |
| andi@gmail.com | Pengumuman Hasil Lomba | Halo Andi, Selamat!  Anda telah memenangkan...  | |
| budi@gmail.com | Pengumuman Hasil Lomba | Halo Budi, Selamat! Anda telah memenangkan... | |

**STEP 2: Jalankan Fungsi**
```
Menu → GDocs Automator → Email Tools → Send Email Bulk
```

**STEP 3: Informasi Kuota**

Dialog akan menampilkan: 
- Sisa kuota email hari ini
- Jumlah email yang akan dikirim
- Konfirmasi untuk melanjutkan

**STEP 4: Proses Pengiriman**

1. Email akan dikirim satu per satu
2. Delay 500ms antar email untuk menghindari rate limit
3. Status akan diupdate di kolom D

**STEP 5: Hasil**

| A | B | C | D |
|---|---|---|---|
| Email | Subject | Body | Status |
| andi@gmail.com | Pengumuman Hasil Lomba | Halo Andi, ...  | Terkirim |
| budi@gmail.com | Pengumuman Hasil Lomba | Halo Budi, ... | Terkirim |
| invalid-email | Test | Test | Error: Email tidak valid |

Ringkasan akan ditambahkan di bawah data: 
```
=== Ringkasan ===
Email terkirim:  2
Email gagal: 1
Waktu proses: 5. 23 detik
Diproses pada: 2024-01-15 14:30:00
```

**Tips untuk Email Bulk:**
1. **Test dulu** dengan 1-2 email ke diri sendiri
2. **Personalisasi** body email untuk setiap penerima
3. **Jangan spam** - gunakan untuk keperluan legitimate
4. **Cek kuota** sebelum mengirim banyak email

---

# 7. MODUL 4: ADMIN TOOLS

## 7.1 View Logs

**Fungsi:** Melihat log aktivitas aplikasi untuk debugging dan monitoring.

**Cara Menggunakan:**
```
Menu → GDocs Automator → Admin → View Logs
```

**Hasil:**

Sheet "Logs" akan diaktifkan dan menampilkan: 

| Timestamp | Module | Level | Message | Data |
|-----------|--------|-------|---------|------|
| 2024-01-15 14:30:00 | generatePDFs | INFO | Memulai proses pembuatan PDF... | |
| 2024-01-15 14:30:01 | generatePDFs | INFO | Template berhasil dimuat:  Sert...  | |
| 2024-01-15 14:30:05 | generatePDFs | INFO | Berhasil memproses baris 3:  And... | |
| 2024-01-15 14:30:10 | generatePDFs | WARNING | File sudah ada, melewati...  | |
| 2024-01-15 14:30:15 | generatePDFs | ERROR | Gagal memproses baris 5: Templa... | {"stack": ...  |

**Warna Indikator:**
- 🟢 **INFO** (Hijau muda) = Informasi normal
- 🟡 **WARNING** (Kuning muda) = Peringatan, perlu perhatian
- 🔴 **ERROR** (Merah muda) = Kesalahan yang perlu ditangani

**Opsi Hapus Log:**

Setelah melihat log, akan muncul pertanyaan:
```
"Apakah Anda ingin menghapus log?"
- Yes = Hapus semua log
- No = Biarkan log tetap ada
```

## 7.2 Hapus Semua Trigger

**Fungsi:** Menghapus semua scheduled tasks yang mungkin tertinggal.

**Kapan Menggunakan:**
- Jika proses terhenti secara tidak normal
- Jika ada trigger yang berjalan berulang kali
- Untuk membersihkan state sebelum menjalankan proses baru

**Cara Menggunakan:**
```
Menu → GDocs Automator → Admin → Hapus Semua Trigger
```

**Hasil:**

Semua trigger yang terdaftar akan dihapus.  Tidak ada konfirmasi - langsung dihapus. 

## 7.3 Reset State

**Fungsi:** Menghapus SEMUA state dan cache aplikasi untuk fresh start.

**Kapan Menggunakan:**
- Jika aplikasi berperilaku aneh
- Setelah error yang tidak bisa diperbaiki
- Saat ingin memulai dari awal

**Cara Menggunakan:**

1. Menu → **GDocs Automator → Admin → Reset State**
2. Konfirmasi:  "Ini akan menghapus semua state dan cache aplikasi.  Lanjutkan?"
3. Klik: **Yes**

**Yang Akan Dihapus:**
- Semua trigger
- Semua cache (progress, index, dll.)
- Semua state tersimpan (current index, processed count, dll.)

**Yang TIDAK Dihapus:**
- Data di spreadsheet
- Backup konfigurasi

## 7.4 Tentang Aplikasi

**Fungsi:** Menampilkan informasi versi aplikasi. 

**Cara Menggunakan:**
```
Menu → GDocs Automator → Admin → Tentang Aplikasi
```

**Hasil:**
```
GDocs Automator

Aplikasi untuk mengotomatisasi tugas-tugas 
Google Docs, Slides, Drive dan Email.

Dibuat oleh: GitHub Copilot
```

---

# 8. INTEGRASI ANTAR MODUL (WORKFLOW)

## 8.1 Case Study: Distribusi Sertifikat Lomba

**Skenario:** Anda adalah panitia lomba dengan 500 peserta. Anda perlu: 
1. Generate 500 sertifikat PDF
2. Upload ke Drive
3. Share ke masing-masing email peserta
4. Kirim notifikasi email

### FASE 1: PERSIAPAN DATA

1. Import data peserta dari Google Forms ke Spreadsheet
2. Validasi dan bersihkan data (hapus duplikat, perbaiki format)
3. Buat template sertifikat di Google Slides
4. Buat folder output di Google Drive

### FASE 2: GENERATE PDF (Modul PDF Generator)

1. Setup konfigurasi di baris 1
2. Jalankan:  **PDF Generator → Generate PDF → Dari Google Slides**
3. Tunggu proses selesai (auto-continue jika timeout)
4. Verifikasi:  Semua URL PDF sudah terisi di kolom hasil

### FASE 3: SHARE FILE (Modul Email Tools)

1. Pastikan kolom Email dan Link (URL PDF) sudah ada
2. Jalankan: **Email Tools → Share File to Email**
3. Tunggu proses selesai
4. Verifikasi:  Semua status "TRUE"

### FASE 4: KIRIM NOTIFIKASI (Modul Email Tools)

1. Buat sheet "Email Template" dengan template notifikasi
2. Copy data Email + URL PDF ke sheet Email Template
3. Personalisasi body email jika perlu
4. Jalankan: **Email Tools → Send Email Bulk**
5. Verifikasi: Semua status "Terkirim"

### FASE 5: DOKUMENTASI & ARSIP

1. Backup konfigurasi:  **PDF Generator → Backup & Restore → Backup**
2. Arsip log: **Admin → View Logs** → Export ke sheet terpisah
3. Pindahkan folder output ke folder arsip

## 8.2 Contoh Struktur Spreadsheet untuk Workflow

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Template | 1ABCxyz123...  | Folder Hasil | 2XYZabc456... | Jumlah Kolom | 5 | Posisi Hasil | 6 |
| Nama | Email | Prestasi | Kategori | Tanggal | URL PDF | Share Status | Email Status |
| Andi | andi@gmail.com | Juara 1 | Web Dev | 15 Jan 2024 | https://... | TRUE | Terkirim |
| Budi | budi@gmail. com | Juara 2 | Web Dev | 15 Jan 2024 | https://... | TRUE | Terkirim |
| Citra | citra@gmail.com | Juara 3 | Mobile | 15 Jan 2024 | https://... | TRUE | Terkirim |

---

# 9. PARAMETER & KONFIGURASI DETAIL

## 9.1 Parameter PDF Generator (Baris 1)

| Cell | Parameter | Tipe Data | Nilai Valid | Default | Deskripsi |
|------|-----------|-----------|-------------|---------|-----------|
| **B1** | Template ID/URL | String | ID 25+ karakter atau URL lengkap | - | **Wajib**.  ID atau URL template Google Slides/Docs |
| **D1** | Folder ID/URL | String | ID 25+ karakter atau URL lengkap | - | **Wajib**. ID atau URL folder Google Drive |
| **F1** | Jumlah Kolom Data | Integer | 1-50 | 3 | Jumlah kolom data untuk placeholder |
| **H1** | Posisi Hasil | Integer | 1-100 | 4 | Kolom untuk menyimpan URL PDF |
| **J1** | Keterangan Judul | String | Teks bebas | (kosong) | Suffix untuk nama file PDF |

## 9.2 Placeholder Format

| Format | Contoh | Mapping | Catatan |
|--------|--------|---------|---------|
| `<<n>>` | `<<1>>` | Kolom A (kolom ke-1) | n dimulai dari 1 |
| `<<n>>` | `<<2>>` | Kolom B (kolom ke-2) | Bukan 0-indexed |
| `<<n>>` | `<<10>>` | Kolom J (kolom ke-10) | Bisa 2 digit |

**Contoh Mapping:**

```
Template:                     Data di Spreadsheet: 
┌────────────────────┐      ┌───────┬────────┬─────────┐
│ Nama:  <<1>>        │      │   A   │   B    │    C    │
│ Kelas: <<2>>       │  ←→  ├───────┼────────┼─────────┤
│ Nilai: <<3>>       │      │ Andi  │ XII-A  │ 95      │
└────────────────────┘      └───────┴────────┴─────────┘

Hasil:
┌────────────────────┐
│ Nama:  Andi         │
│ Kelas: XII-A       │
│ Nilai: 95          │
└────────────────────┘
```

---

# 10. BATASAN TEKNIS & LIMITASI

## 10.1 Batasan Google Apps Script

| Limitasi | Nilai | Implikasi | Workaround |
|----------|-------|-----------|------------|
| Execution time | 6 menit/eksekusi | Proses panjang akan di-interrupt | Auto-continuation dengan trigger |
| Trigger per user | 20 trigger | Tidak bisa schedule terlalu banyak | Gunakan trigger hemat |
| Script properties | 500KB total | Limit untuk state storage | Bersihkan state berkala |
| Email quota (free) | 100/hari | Limit pengiriman email | Gunakan Workspace untuk lebih |
| Email quota (Workspace) | 1500/hari | Untuk akun berbayar | Cukup untuk kebanyakan use case |

## 10.2 Batasan Google Drive API

| Limitasi | Nilai | Implikasi |
|----------|-------|-----------|
| File operations | ~1000/100 detik | Untuk operasi massal, perlu delay |
| File size | 5TB max | Tidak relevan untuk PDF |
| Sharing operations | ~500/hari | Limit untuk share file massal |

## 10.3 Batasan Aplikasi Ini

| Limitasi | Nilai | Catatan |
|----------|-------|---------|
| Kedalaman folder | 10 level | Untuk ekstrak list file |
| Max file per ekstrak | 5000 file | Untuk ekstrak list file |
| Max backup | 5 backup | Yang lama dihapus otomatis |
| Placeholder format | `<<n>>` only | Tidak support format lain |
| Template type | Slides & Docs only | Tidak support Sheets sebagai template |

---

# 11. KEYBOARD SHORTCUTS & TIPS PRODUKTIVITAS

## 11.1 Google Sheets Shortcuts yang Berguna

| Shortcut | Fungsi | Kapan Digunakan |
|----------|--------|-----------------|
| `Ctrl + Shift + V` | Paste values only | Paste data tanpa formatting |
| `Ctrl + D` | Fill down | Duplikasi data ke bawah |
| `Ctrl + R` | Fill right | Duplikasi data ke kanan |
| `Ctrl + Space` | Select column | Pilih seluruh kolom |
| `Shift + Space` | Select row | Pilih seluruh baris |
| `Ctrl + Home` | Go to A1 | Kembali ke awal |
| `Ctrl + End` | Go to last cell | Pergi ke cell terakhir |
| `Alt + Enter` | New line in cell | Untuk body email multi-line |
| `Ctrl + ;` | Insert date | Masukkan tanggal hari ini |
| `Ctrl + Shift + ;` | Insert time | Masukkan waktu sekarang |

## 11.2 Tips Produktivitas

### 1. Gunakan Named Ranges untuk Konfigurasi

1. Select cell B1
2. Data → Named ranges
3. Beri nama "TemplateID"
4. Sekarang bisa referensi dengan =TemplateID

### 2. Validasi Data Otomatis

Untuk kolom Email: 
1. Select kolom Email
2. Data → Data validation
3. Criteria: Text → Is valid email
4. On invalid data:  Show warning

### 3. Conditional Formatting untuk Status

1. Select kolom Status
2. Format → Conditional formatting
3. Rule 1: Text is "TRUE" → Green background
4. Rule 2: Text contains "Error" → Red background
5. Rule 3: Text is "Terkirim" → Blue background

### 4. Filter View untuk Data Besar

1. Data → Create a filter
2. Klik filter icon di header kolom
3. Filter by condition: Is not empty
4. Hanya data yang ada yang ditampilkan

---

# 12. TEMPLATE SIAP PAKAI

## 12.1 Template Sertifikat (Google Slides)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                ╔═══════════════════════════╗               │
│                ║     🏆 SERTIFIKAT 🏆      ║               │
│                ╚═══════════════════════════╝               │
│                                                            │
│                Nomor:  CERT/<<6>>/<<7>>/2024                │
│                                                            │
│                    Diberikan kepada:                       │
│                                                            │
│              ════════════════════════════════              │
│                         <<1>>                              │
│              ════════════════════════════════              │
│                                                            │
│              Atas partisipasinya sebagai <<2>>             │
│                        dalam kegiatan:                      │
│                                                            │
│                         "<<3>>"                            │
│                                                            │
│              yang diselenggarakan pada tanggal             │
│                          <<4>>                             │
│                                                            │
│                                                            │
│  Jakarta, <<5>>                                            │
│                                                            │
│  Ketua Panitia                     Kepala Sekolah          │
│                                                            │
│  ─────────────────                ─────────────────        │
│      <<8>>                            <<9>>                │
│  NIP.  <<10>>                      NIP. <<11>>              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Data Spreadsheet yang Dibutuhkan:**

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Nama | Prestasi | Nama Event | Tgl Event | Tgl Cetak | No | Bln | Ketua | Kepsek | NIP Ketua | NIP Kepsek |
| <<1>> | <<2>> | <<3>> | <<4>> | <<5>> | <<6>> | <<7>> | <<8>> | <<9>> | <<10>> | <<11>> |

## 12.2 Template Surat Resmi (Google Docs)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   [LOGO INSTANSI]                   │   │
│  │                                                     │   │
│  │               NAMA INSTANSI/PERUSAHAAN              │   │
│  │                    Alamat Lengkap                   │   │
│  │              Telp:  xxx | Email: xxx@xxx.com         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│                                          <<5>>, <<6>>       │
│                                                             │
│  Nomor    :  <<1>>                                           │
│  Lampiran :  <<2>>                                           │
│  Perihal  : <<3>>                                           │
│                                                             │
│  Kepada Yth.                                                 │
│  <<4>>                                                      │
│  di Tempat                                                  │
│                                                             │
│  Dengan hormat,                                             │
│                                                             │
│  <<7>>                                                      │
│                                                             │
│  Demikian surat ini kami sampaikan.  Atas perhatian dan     │
│  kerjasamanya, kami ucapkan terima kasih.                  │
│                                                             │
│                                          Hormat kami,       │
│                                          <<8>>              │
│                                                             │
│                                          ─────────────────  │
│                                          <<9>>              │
│                                          <<10>>             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 12.3 Template Email Notifikasi

**Subject:**
```
[PENTING] Sertifikat Anda Sudah Tersedia - <<EVENT_NAME>>
```

**Body:**
```
Yth.  Bapak/Ibu <<NAMA>>,

Dengan hormat,

Terima kasih atas partisipasi Anda dalam kegiatan "<<EVENT_NAME>>" 
yang diselenggarakan pada tanggal <<TGL_EVENT>>.

Bersama email ini, kami informasikan bahwa sertifikat Anda sebagai
<<PRESTASI>> telah tersedia dan dapat diakses melalui link berikut: 

📄 Link Sertifikat: <<URL_PDF>>

Mohon simpan link tersebut sebagai arsip Anda. 

Jika ada pertanyaan, silakan hubungi kami di: 
📧 Email: panitia@contoh.com
📱 WhatsApp: 08xx-xxxx-xxxx

Sekali lagi, selamat dan terima kasih! 

Salam hangat,

Tim Panitia <<EVENT_NAME>>
<<NAMA_INSTANSI>>

─────────────────────────────────────────────────────────────
Email ini dikirim secara otomatis.  Mohon tidak membalas email ini.
```

---

# 13. TROUBLESHOOTING & FAQ

## 13.1 Masalah Umum dan Solusi

### 1. Menu "GDocs Automator" Tidak Muncul

**Penyebab:**
- Script belum di-authorize
- Browser perlu di-refresh
- Script ada error

**Solusi:**
1. Buka Apps Script Editor (Extensions → Apps Script)
2. Pilih fungsi "onOpen" dari dropdown
3. Klik Run (▶️)
4. Jika diminta otorisasi, ikuti prosesnya
5. Kembali ke spreadsheet dan refresh (F5)

### 2. Error "Template tidak ditemukan"

**Penyebab:**
- ID/URL template salah
- Template sudah dihapus
- Tidak punya akses ke template

**Solusi:**
1. Pastikan ID/URL template benar
2. Buka template secara manual untuk memastikan bisa diakses
3. Jika template milik orang lain, minta akses "Viewer" minimal
4. Pastikan tidak ada spasi di awal/akhir ID

### 3. Error "Folder tidak ditemukan"

**Penyebab:**
- ID/URL folder salah
- Folder sudah dihapus
- Tidak punya akses ke folder

**Solusi:**
1. Pastikan ID/URL folder benar
2. Buka folder secara manual untuk memastikan bisa diakses
3. Pastikan punya akses "Editor" ke folder (untuk menyimpan file)

### 4. PDF Dihasilkan Tapi Placeholder Tidak Diganti

**Penyebab:**
- Format placeholder salah
- Jumlah kolom data tidak sesuai
- Placeholder ada di gambar (tidak bisa diganti)

**Solusi:**
1. Pastikan placeholder menggunakan format `<<1>>`, `<<2>>`, dst. 
2. Pastikan placeholder ada di TEXT BOX, bukan di gambar
3. Cek "Jumlah Kolom Data" sudah sesuai dengan jumlah placeholder
4. Pastikan tidak ada spasi di dalam placeholder:  `<<1>>` ✓, `<< 1 >>` ✗

### 5. Proses Berhenti di Tengah Jalan

**Penyebab:**
- Timeout (lebih dari 6 menit)
- Error pada salah satu file
- Koneksi internet terputus

**Solusi:**
1. Cek kolom hasil - mungkin sebagian sudah selesai
2. Jalankan lagi - proses akan melanjutkan dari yang belum diproses
3. Cek sheet "Logs" untuk melihat error
4. Jika terus bermasalah, coba "Reset State" lalu jalankan lagi

### 6. Email Tidak Terkirim

**Penyebab:**
- Kuota email habis
- Format email tidak valid
- Email di-block oleh Google

**Solusi:**
1. Cek kuota email harian (akan ditampilkan sebelum kirim)
2. Pastikan format email valid (xxx@domain.com)
3. Jika kuota habis, tunggu 24 jam atau gunakan akun Workspace
4. Cek apakah email tidak mengandung konten yang dianggap spam

### 7. Gambar Thumbnail Tidak Muncul

**Penyebab:**
- File tidak di-share dengan "Anyone with the link"
- File bukan gambar/PDF
- File terlalu besar

**Solusi:**
1. Share file dengan "Anyone with the link can view"
2. Pastikan file adalah gambar (JPG, PNG, GIF) atau PDF
3. Untuk file besar, thumbnail mungkin memerlukan waktu

## 13.2 FAQ (Frequently Asked Questions)

### Q1: Berapa banyak PDF yang bisa di-generate dalam satu kali jalan?

**A:** Tidak ada batasan jumlah, tetapi ada batasan waktu (6 menit per eksekusi). Jika waktu habis, proses akan dilanjutkan otomatis.  Dalam praktik: 
- ~50 PDF sederhana dalam 6 menit
- ~20-30 PDF kompleks dalam 6 menit
- Unlimited jika menggunakan auto-continuation

### Q2: Apakah bisa menggunakan gambar di template?

**A:** Ya, gambar statis di template akan tetap ada di PDF. Namun, placeholder hanya bisa mengganti TEKS, bukan gambar. 

### Q3: Apakah data di spreadsheet aman? 

**A:** Script ini berjalan di akun Google Anda sendiri dan tidak mengirim data ke mana pun.  Semua proses terjadi di infrastruktur Google. 

### Q4: Bisakah saya menggunakan ini untuk Google Forms responses?

**A:** Ya!  Caranya: 
1. Link Google Form response ke spreadsheet
2. Pastikan data mulai dari baris 3
3. Buat template dengan placeholder sesuai kolom response

### Q5: Bagaimana jika saya punya banyak template berbeda?

**A:** Opsi yang tersedia:
1.  Ganti konfigurasi di baris 1 setiap kali ganti template
2. Gunakan sheet berbeda untuk setiap template
3. Gunakan Backup & Restore untuk menyimpan konfigurasi berbeda

### Q6: Apakah bisa schedule untuk jalan otomatis?

**A:** Tidak built-in, tapi bisa ditambahkan dengan: 
1. Buka Apps Script Editor
2. Klik menu:  Triggers (ikon jam)
3. Tambahkan trigger untuk fungsi yang diinginkan
4. Set jadwal (harian, mingguan, dll.)

### Q7: Apakah bisa digunakan di HP/Mobile?

**A:** Menu custom tidak muncul di aplikasi mobile Google Sheets. Untuk penggunaan manual, gunakan desktop/laptop.

---

# 14. DEBUGGING & ERROR CODES

## 14.1 Daftar Error Codes dan Solusi

| Error Message | Penyebab | Solusi |
|---------------|----------|--------|
| `Template tidak ditemukan atau tidak dapat diakses` | ID template salah atau tidak punya akses | Verifikasi ID, pastikan punya akses minimal "Viewer" |
| `Folder hasil tidak ditemukan atau tidak dapat diakses` | ID folder salah atau tidak punya akses | Verifikasi ID, pastikan punya akses "Editor" |
| `Tidak dapat mengekstrak ID dari Template atau Folder` | Format URL tidak dikenali | Gunakan ID saja, bukan URL |
| `Error saat memproses template` | Template rusak atau format tidak didukung | Buat ulang template |
| `Email tidak valid` | Format email salah | Perbaiki format email |
| `File not found` | File sudah dihapus | Hapus baris tersebut atau update link |
| `Access denied` | Tidak punya izin | Minta akses atau gunakan file milik sendiri |
| `Quota exceeded` | Kuota habis | Tunggu 24 jam atau upgrade akun |
| `Timeout` | Proses terlalu lama | Akan auto-continue, tunggu saja |
| `Index mapping tidak valid` | State corrupt | Reset State, jalankan ulang |

## 14.2 Cara Menggunakan Console Log untuk Debugging

**Step 1: Buka Apps Script Editor**
```
Extensions → Apps Script
```

**Step 2: Buka Execution Log**
```
View → Execution log
ATAU
Klik icon "Executions" di sidebar kiri
```

**Step 3: Jalankan Fungsi**
```
Pilih fungsi dari dropdown, klik Run
Log akan muncul di panel bawah
```

**Step 4: Baca Log**

Format log: 
```
[timestamp] [module] [level] message
```

Contoh:
```
2024-01-15 14:30:00 [generatePDFs] [INFO] Memulai proses pembuatan PDF... 
2024-01-15 14:30:05 [generatePDFs] [ERROR] Template tidak ditemukan:  1ABC123
```

## 14.3 Cara Membaca Sheet Logs

1.  Buka menu:  **Admin → View Logs**
2. Sheet "Logs" akan aktif
3. Perhatikan kolom **Level**: 
   - **INFO** = Operasi normal
   - **WARNING** = Ada yang perlu diperhatikan
   - **ERROR** = Ada masalah yang perlu diperbaiki
4. Baca kolom **Message** untuk detail
5. Kolom **Data** berisi informasi tambahan (stack trace, dll.)

---

# 15. BEST PRACTICES

## 15.1 Optimasi Performa

| Tips | Deskripsi | Dampak |
|------|-----------|--------|
| **Batasi data per batch** | Proses 100-200 baris per sesi | Menghindari timeout |
| **Gunakan ID, bukan URL** | ID lebih cepat diproses | 10-20% lebih cepat |
| **Minimize placeholder** | Gunakan placeholder seperlunya | Mengurangi waktu replace |
| **Template sederhana** | Hindari animasi, transisi, efek | PDF lebih cepat di-generate |
| **Folder terpisah** | Pisahkan output per batch | Memudahkan management |

## 15.2 Manajemen Data

**Struktur Folder yang Direkomendasikan:**

```
📁 Google Drive
├── 📁 GDocs Automator
│   ├── 📁 Templates
│   │   ├── 📄 Template Sertifikat
│   │   ├── 📄 Template Surat
│   │   └── 📄 Template Undangan
│   ├── 📁 Output
│   │   ├── 📁 Sertifikat Januari 2024
│   │   ├── 📁 Sertifikat Februari 2024
│   │   └── 📁 Surat Keluar 2024
│   └── 📁 Archive
│       └── 📁 2023
```

## 15.3 Checklist Sebelum Generate PDF

- [ ] Template sudah disiapkan dengan placeholder yang benar
- [ ] Folder output sudah dibuat dan accessible
- [ ] Baris 1 sudah berisi konfigurasi yang benar
- [ ] Data mulai dari baris 3
- [ ] Kolom hasil (URL PDF) kosong untuk yang belum diproses
- [ ] Backup konfigurasi sudah dibuat (opsional tapi recommended)
- [ ] Test dengan 1-2 baris data terlebih dahulu

## 15.4 Checklist Sebelum Kirim Email

- [ ] Template email sudah disiapkan
- [ ] Email penerima sudah divalidasi (format benar)
- [ ] Cek kuota email harian
- [ ] Test dengan email sendiri terlebih dahulu
- [ ] Subject dan body sudah sesuai
- [ ] Tidak ada konten yang bisa dianggap spam
- [ ] Pastikan tidak mengirim email duplikat

## 15.5 Recovery dari Error

**Skenario 1: Proses berhenti, sebagian sudah selesai**
1.  JANGAN panik
2. Cek kolom hasil - lihat mana yang sudah punya URL
3. Jalankan lagi - yang sudah ada URL akan di-skip otomatis

**Skenario 2: Error terus-menerus**
1. Cek Logs (Admin → View Logs)
2. Identifikasi baris yang error
3. Perbaiki data di baris tersebut
4. Reset State jika perlu
5. Jalankan lagi

**Skenario 3: Trigger berjalan berulang**
1. Admin → Hapus Semua Trigger
2. Admin → Reset State
3. Jalankan proses dari awal

## 15.6 Security Best Practices

| Praktik | Deskripsi |
|---------|-----------|
| **Jangan share script** | Script berisi akses ke Drive/Gmail Anda |
| **Review permissions** | Cek Apps Script permissions secara berkala |
| **Gunakan akun terpisah** | Untuk operasi massal, pertimbangkan akun khusus |
| **Audit log** | Cek Logs secara berkala |
| **Backup data** | Simpan copy spreadsheet secara berkala |

---

# 16. GLOSARIUM ISTILAH

| Istilah | Definisi |
|---------|----------|
| **Placeholder** | Teks khusus dalam template (<<1>>, <<2>>) yang akan diganti dengan data |
| **Template** | File Google Slides/Docs yang menjadi dasar pembuatan PDF |
| **Trigger** | Scheduled task yang menjalankan fungsi secara otomatis |
| **State** | Data status aplikasi yang tersimpan (current index, processed count, dll.) |
| **Batch** | Sekelompok operasi yang diproses bersamaan |
| **Timeout** | Batas waktu eksekusi script (6 menit) |
| **Auto-continuation** | Fitur melanjutkan proses otomatis setelah timeout |
| **Rate limiting** | Pembatasan kecepatan operasi untuk menghindari error |
| **Sanitization** | Proses membersihkan input dari karakter berbahaya |
| **Namespace** | Prefix untuk membedakan state aplikasi yang berbeda |
| **Index mapping** | Pemetaan antara index data yang difilter dengan row asli di sheet |
| **Exponential backoff** | Strategi retry dengan delay yang meningkat secara eksponensial |
| **Progress bar** | Indikator visual yang menunjukkan kemajuan proses |
| **Quota** | Batasan penggunaan resource (email/hari, API calls, dll.) |
| **Thumbnail** | Gambar preview berukuran kecil dari file |
| **Mail merge** | Proses menggabungkan template dengan data untuk menghasilkan dokumen personal |

---

# 17. CHECKLIST PENGGUNAAN

## 17.1 Checklist Instalasi

- [ ] Google Account aktif dengan akses ke Drive, Docs, Slides, Gmail
- [ ] Spreadsheet baru sudah dibuat
- [ ] Apps Script Editor sudah dibuka
- [ ] Kode `code.gs` sudah di-copy dan paste
- [ ] File `dialog.html` sudah dibuat dan diisi
- [ ] Script sudah di-save
- [ ] Otorisasi sudah dilakukan (Run fungsi `onOpen`)
- [ ] Spreadsheet sudah di-refresh
- [ ] Menu "GDocs Automator" sudah muncul

## 17.2 Checklist Sebelum Generate PDF

- [ ] Template sudah disiapkan dengan placeholder yang benar
- [ ] Placeholder menggunakan format `<<1>>`, `<<2>>`, dst.
- [ ] Placeholder ada di TEXT BOX, bukan gambar
- [ ] Folder output sudah dibuat di Google Drive
- [ ] Punya akses "Editor" ke folder output
- [ ] Baris 1 spreadsheet sudah berisi konfigurasi
- [ ] Template ID/URL sudah benar di cell B1
- [ ] Folder ID/URL sudah benar di cell D1
- [ ] Jumlah Kolom Data sudah sesuai di cell F1
- [ ] Posisi Hasil sudah sesuai di cell H1
- [ ] Data dimulai dari baris 3
- [ ] Kolom hasil kosong untuk data yang belum diproses
- [ ] Test dengan 1-2 baris data terlebih dahulu
- [ ] Backup konfigurasi sudah dibuat (opsional)

## 17.3 Checklist Setelah Generate PDF

- [ ] Semua URL PDF sudah terisi di kolom hasil
- [ ] Buka beberapa PDF secara random untuk verifikasi
- [ ] Placeholder sudah terganti dengan data yang benar
- [ ] Format/layout PDF sesuai template
- [ ] Nama file PDF sesuai ekspektasi
- [ ] File PDF sudah ada di folder output
- [ ] Cek sheet "Logs" jika ada error
- [ ] Backup data jika diperlukan

## 17.4 Checklist Sebelum Share File

- [ ] URL PDF sudah ada di spreadsheet
- [ ] Kolom Email sudah terisi dengan email valid
- [ ] Format email benar (xxx@domain.com)
- [ ] Kolom Status kosong untuk yang belum di-share
- [ ] Punya akses untuk share file tersebut
- [ ] Test dengan 1-2 file terlebih dahulu

## 17.5 Checklist Sebelum Kirim Email

- [ ] Sheet "Email Template" sudah ada
- [ ] Kolom Email, Subject, Body sudah terisi
- [ ] Email penerima sudah divalidasi
- [ ] Subject email sudah sesuai
- [ ] Body email sudah sesuai (personalisasi jika perlu)
- [ ] Cek kuota email harian
- [ ] Test dengan email sendiri terlebih dahulu
- [ ] Tidak ada konten spam
- [ ] Kolom Status kosong untuk yang belum terkirim

## 17.6 Checklist Setelah Kirim Email

- [ ] Semua status "Terkirim"
- [ ] Cek folder "Sent" di Gmail
- [ ] Cek inbox sendiri jika ada test email
- [ ] Monitor bounce/error dari Gmail
- [ ] Backup data ke sheet terpisah
- [ ] Catat ringkasan pengiriman

## 17.7 Checklist Maintenance Berkala

- [ ] Cek dan hapus logs lama (Admin → View Logs)
- [ ] Backup konfigurasi penting
- [ ] Hapus trigger yang tidak perlu (Admin → Hapus Semua Trigger)
- [ ] Review dan arsipkan output lama
- [ ] Cek kuota dan usage Google account
- [ ] Update template jika ada perubahan

---

# LAMPIRAN

## Lampiran A: Contoh Konfigurasi Lengkap

### Konfigurasi untuk Sertifikat Lomba

**Baris 1 (Konfigurasi):**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Template | 1ABCdefGHI123xyz | Folder Hasil | 2XYZabc456DEF | Jumlah Kolom Data | 7 | Posisi Hasil | 8 | Keterangan Judul | Sertifikat_Lomba_2024 |

**Baris 2 (Header):**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Nama Peserta | Prestasi | Nama Lomba | Tanggal Lomba | Tanggal Cetak | Ketua Panitia | Kepala Sekolah | URL PDF |

**Baris 3+ (Data):**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Ahmad Rizky | Juara 1 | Olimpiade Matematika 2024 | 15 Januari 2024 | 20 Januari 2024 | Dr. Budi Santoso | Prof. Ahmad Dahlan | |
| Siti Nurhaliza | Juara 2 | Olimpiade Matematika 2024 | 15 Januari 2024 | 20 Januari 2024 | Dr. Budi Santoso | Prof. Ahmad Dahlan | |
| Rudi Hermawan | Juara 3 | Olimpiade Matematika 2024 | 15 Januari 2024 | 20 Januari 2024 | Dr. Budi Santoso | Prof. Ahmad Dahlan | |

### Konfigurasi untuk Surat Undangan

**Baris 1 (Konfigurasi):**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Template | 3MNOpqrSTU789 | Folder Hasil | 4VWXyz123ABC | Jumlah Kolom Data | 5 | Posisi Hasil | 6 | Keterangan Judul | Undangan_Rapat |

**Baris 2 (Header):**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Nama Undangan | Jabatan | Tanggal Rapat | Waktu | Tempat | URL PDF |

**Baris 3+ (Data):**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Bapak Ahmad | Direktur Utama | 25 Januari 2024 | 09:00 WIB | Ruang Rapat Lt.  5 | |
| Ibu Siti | Manajer Keuangan | 25 Januari 2024 | 09:00 WIB | Ruang Rapat Lt.  5 | |
| Bapak Rudi | Kepala HRD | 25 Januari 2024 | 09:00 WIB | Ruang Rapat Lt.  5 | |

## Lampiran B:  Troubleshooting Quick Reference

| Gejala | Kemungkinan Penyebab | Solusi Cepat |
|--------|---------------------|--------------|
| Menu tidak muncul | Script belum di-authorize | Run `onOpen` di Apps Script Editor |
| Error "Template tidak ditemukan" | ID salah atau tidak punya akses | Verifikasi ID, cek akses |
| Error "Folder tidak ditemukan" | ID salah atau tidak punya akses | Verifikasi ID, cek akses Editor |
| Placeholder tidak diganti | Format placeholder salah | Gunakan `<<1>>`, `<<2>>`, dst. |
| Proses berhenti | Timeout | Tunggu auto-continue atau jalankan lagi |
| Email tidak terkirim | Kuota habis atau email invalid | Cek kuota, validasi email |
| Gambar tidak muncul | File tidak di-share | Share dengan "Anyone with the link" |
| Trigger berulang | State corrupt | Reset State, hapus trigger |
| Progress tidak update | Cache issue | Refresh dialog, coba lagi |
| Error berulang | Data bermasalah | Cek Logs, perbaiki data error |

## Lampiran C: Keyboard Shortcuts Quick Reference

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Ctrl + Shift + V` | Paste values only |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + D` | Fill down |
| `Ctrl + R` | Fill right |
| `Ctrl + Space` | Select column |
| `Shift + Space` | Select row |
| `Ctrl + A` | Select all |
| `Ctrl + Home` | Go to A1 |
| `Ctrl + End` | Go to last cell |
| `Ctrl + F` | Find |
| `Ctrl + H` | Find and replace |
| `Alt + Enter` | New line in cell |
| `Ctrl + ;` | Insert today's date |
| `Ctrl + Shift + ;` | Insert current time |
| `F2` | Edit cell |
| `Esc` | Cancel edit |

---

# PENUTUP

## Ringkasan

**GDocs Automator adalah solusi komprehensif untuk mengotomatisasi tugas-tugas berulang di ekosistem Google.  Dengan empat modul utama (PDF Generator, Drive Tools, Email Tools, dan Admin), aplikasi ini dapat menghemat waktu dan mengurangi error dalam proses: 

1. **Pembuatan PDF massal** dari template Slides/Docs
2. **Manajemen file Drive** (metadata, thumbnail, list file)
3. **Distribusi file dan email** secara massal
4. **Monitoring dan maintenance** aplikasi

## Tips Sukses

1. **Mulai dari yang sederhana** - Test dengan 1-2 data sebelum proses massal
2. **Backup selalu** - Gunakan fitur Backup & Restore
3. **Monitor Logs** - Cek logs secara berkala untuk deteksi masalah dini
4. **Ikuti checklist** - Gunakan checklist yang disediakan
5. **Jangan panik** - Jika ada error, baca pesan error dan cek troubleshooting guide

## Dukungan

Jika mengalami masalah yang tidak tercakup dalam panduan ini: 

1. Cek sheet **Logs** untuk informasi detail error
2. Gunakan **Console Log** di Apps Script Editor untuk debugging
3. **Reset State** jika aplikasi berperilaku aneh
4. Buat ulang dari awal jika diperlukan

---
