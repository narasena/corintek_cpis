   # PANDUAN PENGGUNA — CPIS (Corintek Project Information System)

   > **Versi:** 1.0  
   > **Tanggal:** Juli 2026  
   > **Untuk:** Seluruh pengguna CPIS — internal maupun klien

   ---

   ## Daftar Isi

   1. [Tentang CPIS & Peran Pengguna](#1-tentang-cpis--peran-pengguna)
   2. [Login & Akses Aplikasi](#2-login--akses-aplikasi)
   3. [Dashboard](#3-dashboard)
   4. [Proyek Saya (Client Portal)](#4-proyek-saya-client-portal)
   5. [Log Sheet (Pengisian Data Harian)](#5-log-sheet)
      - 5.1. Navigasi — Memilih Proyek
      - 5.2. Membuat Log Sheet Baru
      - 5.3. Petugas Hari Ini
      - 5.4. Memilih Mesin Aktif
      - 5.5. Mengisi Parameter
      - 5.6. Upload Foto
      - 5.7. Penggunaan Chemical
      - 5.8. Catatan / Notes
      - 5.9. Mode Input vs Preview
      - 5.10. Menyimpan Draft
   6. [Tanda Tangan (Signature)](#6-tanda-tangan-signature)
      - 6.1. Tanda Tangan Teknisi
      - 6.2. Tanda Tangan Client PIC
   7. [Submit & Approval](#7-submit--approval)
      - 7.1. Submit Log Sheet
      - 7.2. Approve / Reject
   8. [Absensi (Attendance)](#8-absensi-attendance)
      - 8.1. Absensi Teknisi (Clock In / Clock Out)
      - 8.2. Riwayat Absensi
      - 8.3. Absensi untuk Supervisor / PIC
   9. [Work Report](#9-work-report)
   10. [Logout & Keamanan](#10-logout--keamanan)

   ---

   ## 1. Tentang CPIS & Peran Pengguna

   CPIS adalah aplikasi untuk mengelola data operasional mesin HVAC/chiller. Ada **7 peran (role)** dengan akses berbeda:

   | Role | Label | Akses Utama |
   |------|-------|------------|
   | **ADMIN** | Administrator | Penuh — semua fitur |
   | **SUPERVISOR** | Supervisor | Operasional + approve log sheet |
   | **TECHNICIAN** | Teknisi | Mengisi log sheet, absensi |
   | **REPORTING** | Reporting | Laporan dan ringkasan |
   | **DIRECTOR** | Direktur | Pantauan proyek |
   | **CLIENT** | Klien | **Lihat saja (read-only)** — log sheet, work report, ringkasan |
   | **CLIENT_SUPERVISOR** | PIC Klien | Lihat + setujui log sheet, buat work report |
   | **CLIENT_TECHNICIAN** | Teknisi (Klien) | Absensi, isi log sheet, buat work report |

   > **Panduan ini mencakup semua peran.** Bagian yang hanya berlaku untuk role tertentu akan diberi label.

   ---

   ## 2. Login & Akses Aplikasi

   ### Membuka Aplikasi

   1. Buka browser (Chrome / Firefox / Edge) di HP atau laptop.
   2. Masuk ke alamat: **[URL APLIKASI]**

   *[SCREENSHOT: Halaman login — logo Corintek di atas, kartu login dengan field Email dan Password]*

   ### Login

   1. Masukkan **Email** yang sudah didaftarkan.
   2. Masukkan **Password**.
   3. Klik tombol **"Sign in"**.
   4. Tunggu beberapa detik — aplikasi akan mengarahkan ke halaman utama sesuai role:
      - **ADMIN / SUPERVISOR / TECHNICIAN** → Dashboard (halaman `/`)
      - **CLIENT / CLIENT_SUPERVISOR** → Proyek Saya (halaman `/my-projects`)
      - **CLIENT_TECHNICIAN** → Absensi (halaman `/attendance`)

   *[SCREENSHOT: Form login terisi, tombol Sign in]*

   > **Catatan:** Jika lupa password, hubungi admin untuk mereset.

   ### Navigasi Sidebar

   Setelah login, sidebar kiri menampilkan menu yang **berbeda-beda sesuai role**:

   **Internal (ADMIN / SUPERVISOR / TECHNICIAN):**
   ```
   Platform:
   • Dashboard
   Operasional:
   • Proyek
   • Absensi
   • Log Sheets
   • Work Reports
   • Summary Reports
   • Lab Analyses
   Inventori & Master:
   • Chemicals
   • Parameters
   Administrasi:
   • Clients
   • Users
   ```

   **Client (CLIENT / CLIENT_SUPERVISOR):**
   ```
   Platform:
   • Dashboard
   Operasional:
   • Log Sheets
   • Work Reports
   • Summary Reports
   ```

   **Client Technician (CLIENT_TECHNICIAN):**
   ```
   Platform:
   • Dashboard
   Operasional:
   • Absensi
   • Log Sheets
   • Work Reports
   ```

   *[SCREENSHOT: Sidebar — tampilan berbeda untuk internal vs client]*

   ### Logout

   1. Klik ikon profil / nama pengguna di pojok kiri bawah sidebar.
   2. Pilih **"Keluar"**.

   *[SCREENSHOT: Sidebar footer — avatar user, nama, email, dropdown dengan opsi Keluar]*

   ---

   ## 3. Dashboard

   Setelah login, halaman pertama tergantung role (lihat bagian 2).

   **Untuk ADMIN:** Tampilan dengan kartu statistik (total proyek, users, dll) dan grafik aktivitas.

   *[SCREENSHOT: Dashboard ADMIN — kartu statistik, grafik]*

   **Untuk Teknisi / Supervisor / Client:** Tampilan **scoped** — hanya menampilkan proyek yang ditugaskan. Ada:
   - **Ringkasan proyek** — kartu proyek yang sedang aktif (klik untuk detail)
   - **Grafik parameter** — visualisasi data
   - **Aktivitas terbaru** — log sheet yang baru diisi / disubmit

   *[SCREENSHOT: Dashboard scoped — daftar proyek, grafik, aktivitas terbaru]*

   > **Client (CLIENT):** Dari dashboard, klik kartu proyek untuk masuk ke **Proyek Saya** (lihat bagian 4).

   ---

   ## 4. Proyek Saya (Client Portal)

   **Khusus untuk role CLIENT dan CLIENT_SUPERVISOR.**

   Halaman `Proyek Saya` adalah pintu masuk utama setelah login. Di sini kamu bisa melihat daftar proyek yang kamu akses.

   *[SCREENSHOT: Halaman Proyek Saya — daftar proyek yang diakses client]*

   Setelah memilih proyek, kamu akan melihat halaman **Ringkasan Proyek** dengan tombol:

   *[SCREENSHOT: Ringkasan proyek — detail proyek, tombol Log Sheet dan Laporan Kerja]*

   - **Log Sheet** — lihat daftar log sheet proyek tersebut
   - **Laporan Kerja** — lihat daftar work report

   > **Catatan:** Role **CLIENT (biasa)** hanya bisa **melihat** — tidak bisa membuat, mengedit, atau menghapus log sheet.

   ---

   ## 5. Log Sheet

   Fitur utama CPIS. Digunakan untuk mencatat data operasional harian mesin (chiller, cooling tower).

   ### 5.1. Navigasi — Memilih Proyek

   **Internal (ADMIN / SUPERVISOR / TECHNICIAN):**

   1. Dari sidebar kiri, klik **"Log Sheets"** di bagian Operasional.
   2. Halaman **pemilihan proyek** akan muncul — pilih proyek yang ingin diisi.

   *[SCREENSHOT: Halaman Log Sheet — tabel daftar proyek]*

   **Client (CLIENT / CLIENT_SUPERVISOR / CLIENT_TECHNICIAN):**

   1. Dari sidebar, klik **"Log Sheets"**.
   2. Atau dari Dashboard, klik proyek → halaman Proyek Saya → tombol **"Log Sheet"**.

   ### 5.2. Membuat Log Sheet Baru

   > **Hanya untuk:** ADMIN, SUPERVISOR, TECHNICIAN, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN  
   > **CLIENT (biasa):** Tidak bisa membuat — hanya melihat.

   1. Pada halaman daftar log sheet, klik tombol **"Tambah Log Sheet"** (ikon +) di pojok kanan atas.
   2. Dialog akan muncul. Isi:
      - **Tanggal** — pilih tanggal hari ini (default).
      - **Catatan** *(opsional)* — judul atau keterangan singkat.
      - **Teknisi Pengganti** *(opsional)* — jika ada teknisi lain yang menggantikan shift hari ini.
   3. Klik **"Simpan"**.

   *[SCREENSHOT: Dialog "Tambah Log Sheet" — form tanggal, catatan, dropdown teknisi pengganti]*

   4. Log sheet baru akan terbuka.

   ### 5.3. Petugas Hari Ini

   Di bagian paling atas halaman input, ada dropdown **"Petugas Hari Ini"**.

   *[SCREENSHOT: Bagian status — menampilkan status DRAFT dan dropdown Petugas Hari Ini]*

   - Pilih **"- Saya Sendiri -"** jika kamu yang bertugas.
   - Pilih nama teknisi lain jika ada **pengganti**.

   > **Client:** Role CLIENT tidak melihat bagian ini (forced ke mode Preview).

   ### 5.4. Memilih Mesin Aktif

   Panel **"Mesin Aktif"** menampilkan daftar chiller dan cooling tower.

   *[SCREENSHOT: Panel Mesin Aktif — daftar chiller dan cooling tower dengan checkbox]*

   1. Centang mesin yang sedang beroperasi hari ini.
   2. Tombol: **"Pilih Semua"** / **"Hapus Semua"**.
   3. Hanya mesin yang dicentang yang muncul di pengisian parameter.

   > **Tips:** Jika tidak memilih mesin, semua mesin akan ditampilkan secara default.

   ### 5.5. Mengisi Parameter

   > **Hanya bisa di mode Input** — CLIENT tidak bisa mengisi, hanya melihat di Preview.

   Setelah mesin aktif dipilih, gulir ke bawah untuk melihat kategori parameter.

   *[SCREENSHOT: Halaman detail log sheet mode input — kategori parameter (Unit Condensor, Unit Evaporator, Cooling Water Quality, General Condition, Job Description, Consumption)]*

   Setiap kategori berisi parameter yang perlu diisi per mesin:

   *[SCREENSHOT: Satu kategori dengan baris parameter — input number, checkbox, text]*

   **Tipe Input:**

   | Tipe | Cara Mengisi |
   |------|-------------|
   | **Angka (NUMBER)** | Ketik nilai numerik (contoh: 7.2, 85, 0.5) |
   | **Boolean / Checklist** | Centang checklist — centang = Ya, kosong = Tidak |
   | **Teks (TEXT)** | Ketik keterangan singkat |
   | **File / Foto** | Klik ikon upload — lihat bagian 5.6 |

   ### 5.6. Upload Foto

   Pada parameter tertentu (misal: kondisi umum mesin), kamu bisa upload foto.

   *[SCREENSHOT: Baris parameter dengan tombol upload foto — thumbnail setelah upload]*

   1. Klik ikon **kamera / upload** pada baris parameter.
   2. Pilih foto dari galeri HP atau ambil foto baru.
   3. Tunggu hingga muncul thumbnail.

   > **Catatan:** Pastikan koneksi internet stabil saat upload foto.

   ### 5.7. Penggunaan Chemical

   Di bagian bawah, ada seksi **"Consumption & Chemicals"** (menggabungkan parameter konsumsi meteran air + chemical).

   *[SCREENSHOT: Seksi Consumption & Chemicals — parameter konsumsi di atas, tabel chemical di bawah]*

   **Cara menambahkan chemical:**

   1. Pilih **nama chemical** dari dropdown.
   2. Masukkan **jumlah pemakaian**.
   3. Klik tombol **"+" (Tambah)** .
   4. Chemical muncul di tabel. Klik ikon **sampah** untuk menghapus.
   5. Jika salah input, tambahkan lagi — jumlah otomatis diakumulasi.

   ### 5.8. Catatan / Notes

   Di bagian bawah sebelum tanda tangan, ada kolom **"Catatan"**.

   *[SCREENSHOT: Kolom Catatan — textarea dengan placeholder]*

   Gunakan untuk:
   - Informasi tambahan tentang kondisi mesin
   - Masalah yang perlu ditindaklanjuti
   - Instruksi khusus untuk shift berikutnya

   Contoh: _"Unit chiller #1 mengalami noise tidak wajar saat startup. TDS air cooling tower meningkat, perlu dilakukan blowdown."_

   ### 5.9. Mode Input vs Preview

   Di toolbar, ada **dropdown pemilihan mode**:

   *[SCREENSHOT: Toolbar — dropdown mode "Input" di kiri, dropdown "Tindakan" di kanan]*

   - **Input** — mode pengisian data.
   - **Preview** — mode tampilan cetak.
   - **Print** — mencetak / simpan sebagai PDF (hanya dari mode Preview).

   > **Client:** Semua role CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN **hanya bisa melihat Preview** — tidak bisa mengedit. Tombol **"Cetak / Preview"** tersedia di pojok kanan atas.

   ### 5.10. Menyimpan Draft

   > **Hanya untuk yang punya akses edit.**

   Semua aksi ada di dropdown **"Tindakan"** toolbar pojok kanan atas.

   *[SCREENSHOT: Dropdown Tindakan terbuka — Simpan Draft, Kirim, Buka Kunci (Admin)]*

   1. Klik **"Tindakan"** → **"Simpan Draft"**.
   2. Data tersimpan — status tetap **DRAFT**.
   3. Halaman bisa ditutup dan dilanjutkan nanti.

   > **Tips:** Simpan secara berkala agar data tidak hilang jika koneksi bermasalah.

   **Khusus ADMIN:** Ada opsi **"Buka Kunci (Admin)"** untuk mengedit log sheet yang sudah di-submit/di-approve.

   ---

   ## 6. Tanda Tangan (Signature)

   > **Teknisi** wajib tanda tangan sebelum submit.  
   > **Client PIC** (CLIENT_SUPERVISOR / CLIENT_TECHNICIAN) juga wajib tanda tangan jika kolomnya muncul.

   Bagian **"Tanda Tangan"** ada di bagian paling bawah halaman input, dengan dua kolom:

   *[SCREENSHOT: Bagian Tanda Tangan — dua kolom: Tanda Tangan Teknisi dan Tanda Tangan PIC Klien]*

   ### 6.1. Tanda Tangan Teknisi

   1. Klik tombol **"Isi Tanda Tangan"** pada kolom Tanda Tangan Teknisi.
   2. Dialog signature pad muncul. **Tanda tangani** menggunakan jari (HP) atau mouse (laptop).

   *[SCREENSHOT: Dialog signature pad — area putih untuk tanda tangan, tombol Ulangi dan Simpan]*

   3. Klik **"Ulangi"** jika tidak puas.
   4. Klik **"Simpan"** jika sudah sesuai.

   ### 6.2. Tanda Tangan Client PIC

   > Kolom ini **hanya muncul** untuk ADMIN, CLIENT_TECHNICIAN, dan CLIENT_SUPERVISOR.

   Proses sama seperti teknisi:
   1. Klik **"Isi Tanda Tangan"** pada kolom PIC Klien.
   2. Tanda tangani → klik **"Simpan"**.

   Setelah tersimpan, tombol berubah menjadi **"Ubah Tanda Tangan"**.

   ---

   ## 7. Submit & Approval

   ### 7.1. Submit Log Sheet

   > **Hanya untuk:** ADMIN, SUPERVISOR, TECHNICIAN, CLIENT_TECHNICIAN, CLIENT_SUPERVISOR

   1. Klik **"Tindakan"** → **"Kirim"**.
   2. Sistem memvalidasi data:
      - Jika ada **11 field wajib** yang belum diisi → muncul peringatan **"Data belum lengkap"**.
      - Lengkapi lalu coba lagi.
   3. Dialog konfirmasi muncul:
      - **"Setelah dikirim, log sheet terkunci dan tidak bisa diubah."**
   4. Klik **"Kirim"**.

   *[SCREENSHOT: Dialog konfirmasi kirim — judul, pesan, tombol Batal dan Kirim]*

   5. Status berubah **DRAFT → SUBMITTED**.
   6. Log sheet terkunci — tidak bisa diedit lagi.

   > **Penting:** Pastikan tandatangan teknisi dan (jika perlu) client PIC sudah diisi sebelum submit.

   ### 7.2. Approve / Reject

   > **Hanya untuk:** SUPERVISOR dan CLIENT_SUPERVISOR  
   > **Muncul otomatis** saat log sheet berstatus SUBMITTED dan kamu membukanya.

   *[SCREENSHOT: Banner kuning "Menunggu Persetujuan" — tombol Setuju (biru) dan Tolak (merah)]*

   **Setuju (Approve):**
   1. Klik **"Setuju"**.
   2. Konfirmasi: "Log sheet akan disetujui dan dikunci."
   3. Klik **"Setuju"**.
   4. Status **APPROVED** — data terkunci permanen.

   **Tolak (Reject):**
   1. Klik **"Tolak"**.
   2. Masukkan **alasan penolakan** (textarea).

   *[SCREENSHOT: Dialog tolak — textarea alasan, tombol Batal dan Tolak]*

   3. Klik **"Tolak"**.
   4. Status kembali ke **DRAFT** — teknisi bisa perbaiki dan submit ulang.

   ---

   ## 8. Absensi (Attendance)

   Fitur absensi berbeda-beda tergantung role.

   ### 8.1. Absensi Teknisi (Clock In / Clock Out)

   > **Untuk:** TECHNICIAN, CLIENT_TECHNICIAN, SUPERVISOR

   1. Dari sidebar, klik **"Absensi"**.
   2. Halaman absensi muncul dengan status hari ini.

   *[SCREENSHOT: Halaman absensi — status "Belum Absen Masuk", tombol Clock In]*

   **Clock In (Absen Masuk):**
   1. Klik **"Clock In"**.
   2. **Ambil foto selfie** (wajib!) — gunakan kamera HP atau upload dari galeri.

   *[SCREENSHOT: Kamera selfie untuk clock in — preview foto, tombol Clock In]*

   3. Klik **"Clock In"** untuk konfirmasi.
   4. Status berubah **"Sudah Absen Masuk"**.

   **Clock Out (Absen Pulang):**
   1. Buka halaman **Absensi** lagi di akhir shift.
   2. Status menampilkan jam masuk dan tombol **"Clock Out"**.

   *[SCREENSHOT: Status "Sudah Absen Masuk" dengan jam masuk, tombol Clock Out]*

   3. **Ambil foto selfie** (wajib).
   4. Klik **"Clock Out"**.
   5. Status **"Sudah Absen Pulang"** — durasi kerja otomatis terhitung.

   ### 8.2. Riwayat Absensi

   Di bawah status hari ini, ada **riwayat absensi bulan ini**.

   *[SCREENSHOT: Tabel riwayat absensi — tanggal, jam masuk, jam pulang, total jam]*

   - Filter: rentang tanggal (dari - sampai).
   - Kolom: tanggal, jam masuk, jam pulang, total jam.

   ### 8.3. Absensi untuk Supervisor / PIC

   > **Untuk:** SUPERVISOR, CLIENT_SUPERVISOR (PIC)

   Halaman absensi menampilkan **daftar teknisi** yang bertugas hari ini.

   *[SCREENSHOT: Halaman absensi supervisor — tabel daftar teknisi dengan status]*

   | Kolom | Keterangan |
   |-------|-----------|
   | **Teknisi** | Nama + foto |
   | **Email** | Email teknisi |
   | **Status** | Belum Absen / Sudah Absen Masuk / Sudah Absen Pulang |
   | **Jam Masuk** | Waktu clock in |
   | **Jam Pulang** | Waktu clock out (atau "-") |

   > **Role CLIENT (biasa):** Tidak bisa mengakses absensi.  
   > **Role ADMIN:** Dialihkan ke halaman `/attendance/admin` untuk manajemen.

   ---

   ## 9. Work Report

   Work Report adalah laporan kerja tambahan (pekerjaan perbaikan, inspeksi khusus).

   1. Dari sidebar, klik **"Work Reports"**.
   2. Halaman **pemilihan proyek** muncul — pilih proyek.
   3. Klik **"Buat Laporan"** / tombol "+".

   *[SCREENSHOT: Halaman Work Report — daftar proyek]*

   4. Isi form:
      - **Judul Pekerjaan**
      - **Deskripsi** — detail pekerjaan
      - **Foto** *(opsional)* — dokumentasi
   5. Klik **"Simpan"**.

   *[SCREENSHOT: Form work report — judul, deskripsi, upload foto]*

   > **CLIENT (biasa):** Hanya bisa melihat — tidak bisa membuat.  
   > **CLIENT_SUPERVISOR & CLIENT_TECHNICIAN:** Bisa membuat.

   Work Report juga memiliki alur submit & approval seperti Log Sheet.

   ---

   ## 10. Logout & Keamanan

   ### Logout

   1. Klik ikon profil / nama di pojok kiri bawah sidebar.
   2. Pilih **"Keluar"**.

   *[SCREENSHOT: Sidebar footer — dropdown dengan opsi Keluar]*

   ### Tips Keamanan

   - **Jangan bagikan password** ke siapa pun.
   - **Logout** setelah selesai menggunakan aplikasi, terutama di perangkat bersama.
   - Laporkan ke admin jika melihat aktivitas mencurigakan.
   - Ganti password secara berkala.

   ---

   ## Troubleshooting / FAQ

   | Masalah | Solusi |
   |---------|--------|
   | **Lupa password** | Hubungi admin untuk reset password |
   | **Data tidak tersimpan** | Periksa koneksi internet, simpan lewat **Tindakan → Simpan Draft** |
   | **Tidak bisa upload foto** | Pastikan ukuran foto tidak terlalu besar |
   | **Tombol Kirim tidak muncul** | Status harus **DRAFT** — cek dropdown **Tindakan** |
   | **"Data belum lengkap"** | 11 field wajib belum diisi — isi semua parameter yang diperlukan |
   | **Tidak bisa membuat log sheet** | Role CLIENT read-only — hubungi admin |
   | **Tidak bisa mengedit** | Role CLIENT hanya preview, atau log sheet sudah di-submit |
   | **Halaman tidak muncul** | Refresh browser atau logout lalu login lagi |
   | **Aplikasi lambat** | Periksa koneksi internet, tutup tab yang tidak perlu |
   | **Absensi tidak bisa diakses** | Absensi hanya untuk TECHNICIAN, CLIENT_TECHNICIAN, SUPERVISOR |
   | **Tidak bisa tanda tangan** | Pastikan log sheet masih **DRAFT** |
   | **Tidak ada kolom tanda tangan PIC** | Kolom PIC hanya muncul untuk ADMIN dan role CLIENT |

   ---

   *Dokumen ini disusun untuk memudahkan seluruh pengguna CPIS.  
   Untuk pertanyaan lebih lanjut, hubungi tim support.*
