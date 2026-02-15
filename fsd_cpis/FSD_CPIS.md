# Corintek Project Information System (CPIS) Web Application

---

## 1. Deskripsi Proyek

Pengembangan Corintek Project Information System (CPIS) bertujuan untuk membangun sebuah sistem informasi yang dapat memfasilitasi informasi, laporan dan manajemen proyek secara efektif dan efisien. Sistem ini akan menyediakan platform terintegrasi untuk pengumpulan data, analisis, pemantauan, dan pelaporan proyek yang sedang berjalan maupun yang telah selesai. Dengan adanya sistem ini, diharapkan proyek yang ditangani PT. Corintek Inti Sejahtera (CORINTEK) dapat dikelola dengan lebih baik, mengoptimalkan penggunaan sumber daya, meningkatkan koordinasi tim, dan memastikan kelancaran dalam pencapaian tujuan proyek.

## 2. Gambaran Umum Sistem

CPIS akan menjadi pusat kontrol utama untuk manajemen proyek yang dikerjakan CORINTEK. Aplikasi Web ini akan memiliki fitur-fitur seperti manajemen tugas, pemantauan jadwal, kolaborasi tim, pelaporan proyek, dan manajemen risiko. Aplikasi ini akan bersifat web-based sehingga dapat diakses oleh pengguna dari berbagai lokasi dengan menggunakan perangkat yang terhubung ke internet.

Melalui Sistem Informasi Proyek, pengguna akan dapat mengakses informasi proyek secara real-time, mengelola tugas-tugas yang terkait dengan proyek, memantau kemajuan proyek, berkolaborasi dengan tim, serta mengidentifikasi dan mengelola risiko yang mungkin muncul selama proyek berlangsung. Aplikasi ini juga akan menyediakan laporan yang informatif dan visualisasi data yang membantu pengambilan keputusan yang lebih baik oleh manajemen proyek.

Dengan adanya Sistem Informasi Proyek, diharapkan tercapainya efisiensi dan efektivitas dalam manajemen proyek, peningkatan transparansi informasi, pengurangan kesalahan manusia, dan peningkatan kualitas dalam pengambilan keputusan proyek.

## 3. Kebutuhan Bisnis

CPIS akan melibatkan pemangku kepentingan berikut:

- Admin master: Membutuhkan akses real-time terhadap informasi proyek, kemampuan untuk memantau kemajuan proyek, dan menerima laporan yang akurat.
- Teknisi: Memerlukan platform kolaborasi yang memungkinkan mereka untuk berbagi informasi, mengelola tugas, dan membuat laporan secara efektif.
- Klien: Membutuhkan antarmuka pengguna yang intuitif dan mudah digunakan untuk mengakses informasi proyek yang relevan.
- Manajemen senior: Membutuhkan laporan dan analisis proyek yang komprehensif untuk pengambilan keputusan strategis.

Kebutuhan bisnis ini harus dipenuhi untuk memastikan bahwa Sistem Informasi Proyek memberikan nilai tambah yang signifikan bagi organisasi, memperbaiki efisiensi operasional, meningkatkan pengelolaan proyek, dan mengoptimalkan penggunaan sumber daya.

## 4. Berikut adalah daftar halaman utama yang akan ada dalam CPIS:

1. Dashboard
   Fitur dashboard akan memuat:
   - Data chart yang memberikan visualisasi data logsheet historis pada proyek yang sedang dibuka. Data yang ditampilkan dalam chart grafik:
     - Data Approach Unit Condenser
     - Data Ampere Unit Condenser
     - Data Approach Unit Evaporator
     - Data Ampere Unit Evaporator
   - Gallery foto yang menampilkan foto-foto yang diambil saat pengisian Logsheet, diurutkan dari tanggal terbaru.
   - Parameter akan menampilkan data parameter yang diaplikasikan pada proyek terkait.

2. Summary Reports
   - Menampilkan laporan keseluruhan pada akhir periode proyek terkait.
   - Menampilkan daftar proyek keseluruhan bagi internal.
   - Menampilkan daftar proyek terbatas bagi klien.
   - Admin atau internal dapat melakukan upload file scan PDF pada bagian:
     _ Data temuan
     _ Data blowdown silang
     _ Data suhu
     _ Data surat jalan
     Data scan PDF akan ditampilkan pada bagian dari summary reports akhir.

3. Form Laporan Kerja (Logsheet)

   Log Sheet Daily/Weekly/Scheduled
   Adminstrasi pilih jenis unit
   - Unit Condenser \*
   - Unit Evaporator \*
   - Check Water Quality \*\*
   - General Condition \*\*
   - Job Description \*\*
   - Consumption Water Meter
   - Fill Up Chemical \*\*\*
   - Note

   Pengisian Log Sheet disesuaikan pada:
   - (\*) Semua Unit Chiller
   - (\*\*) Semua Unit Cooling Tower
   - (\*\*\*) Jenis / nama chemical yang digunakan dan Unit Cooling Tower

   Log Sheet Request
   - Situasi Saat Ini
   - Pekerjaan yang Dilakukan
   - Hasil Pekerjaan

   Dengan fitur:
   - Kemampuan untuk mengisi dan menyimpan data logsheet ke database CPIS.
   - Pengisian parsial dan dapat disimpan sebagai draft
   - Pengisian data lapangan, dengan format teks dan angka desimal, dan dengan validasi:
     - Parameter Limit
     - Batasan Minimal dan Maksimal
   - Mengunggah lampiran berupa foto sebelum dan sesudah.
   - Mengunggah lampiran video sebelum dan sesudah (opsional).
     Pada menu Logsheet juga disediakan fitur untuk laporan teknisi yang tidak bisa masuk dan dapat digantikan

4. Daftar Laporan (Reports)

   Fitur daftar laporan akan memberikan:
   - Tampilan yang memuat data logsheet yang telah diinputkan.
   - Kemampuan untuk menyortir, mencari, dan memfilter laporan berdasarkan klien, proyek, dan tanggal.

5. Hasil Analisa Lab

   Berupa form isian data hasil Analisa lab yang diisi oleh internal.

6. Absensi

   Melingkupi fungsi absensi:
   - Fitur absensi bagi teknisi
   - Absensi masuk : mencatat waktu masuk dengan validasi foto
   - Absensi keluar : mencatan waktu keluar dengan validasi foto
   - Total jam kerja (Absensi Keluar - Absensi Masuk)
   - Export Data Excel

7. Administrasi:
   1. Manajemen Proyek (CRUD)

      Fitur manajemen proyek akan memungkinkan:
      - Pembuatan proyek baru dengan mengisi detail seperti nama proyek, deskripsi, dan tim yang terlibat.
      - Pembaruan informasi proyek seperti status, tanggal mulai, atau tanggal selesai.
      - Menghapus proyek yang sudah selesai atau tidak relevan.
      - Pengaturan parameter Log sheet (limit, Batasan minimal dan maksimal, daftar mesin) untuk proyek

   2. Manajemen User

      Fitur manajemen user akan melibatkan:
      - Pembuatan akun pengguna baru dengan mengatur username dan password.
      - Penetapan peran atau hak akses untuk setiap pengguna, seperti admin, teknisi, atau klien.
      - Pengelolaan informasi pengguna seperti nama, alamat email, dan kontak untuk internal.
      - Pengelolaan informasi pengguna seperti nama, alamat email, kontak, dana nama perusahaan untuk eksternal (Klien).

   3. Setting Master

      Fitur setting akan mencakup:
      - Pengaturan Log Sheet (Master)
      - Pengaturan Daftar Mesin (Master)
      - Pengaturan Daftar Parameter (Master)

   Berikut adalah daftar fitur yang akan disediakan di dalam CPIS:
   1. Notifikasi

      Notifikasi yang menampilkan pemberitahuan terkait data angka isian logsheet yang
      di atas/bawah limit parameter normal dan butuh perhatian dari teknisi.

   2. Tanda tangan digital

      Fitur untuk tanda tangan pada form web logsheet.

   3. My Profile

      Fitur my profile akan memungkinkan pengguna untuk:
      - Melihat informasi profil.
      - Melihat proyek yang terkait dengan pengguna dan peran yang ditugaskan.

## 5. Alur Kerja

![alt text](image.png)

## 6. Use Case

![alt text](image-1.png)

## 7. Arsitektur Sistem

![alt text](image-2.png)

## 8. Aturan Bisnis

### A. Log Sheet / Weekly / Scheduled Form

<table>
<thead>
<tr>
<th>Field</th>
<th>Field Type</th>
<th>Parameter Limit</th>
<th>Validasi Rentang</th>
<th>Required</th>
</tr>
</thead>
<tbody>
  <tr>
    <td colspan="5">Administrasi</td>
  </tr>
  <tr>
    <td>Tanggal</td>
    <td>Date</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Zone</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td>unit</td>
    <td>Checkbox (Button)</td>
    <td>-</td>
    <td>-</td>
    <td>Yes (Min. 1)</td>
  </tr>
  <tr>
    <td colspan="5">Unit Condenser</td>
  </tr>
  <tr>
    <td>Temp (°C) In</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Temp (°C) Out</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Saturated Temp (°C)</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Approach (°C)</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Load Demand</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
   <tr>
    <td colspan="5">Unit Evaporator</td>
  </tr>
  <tr>
    <td>Temp (°C) In</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Temp (°C) Out</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Saturated Temp (°C)</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Approach (°C)</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td colspan="5">Check Water Quality</td>
  </tr>
  <tr>
    <td>pH</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>TDS</td>
    <td>Number</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Conductivity</td>
    <td>Number</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Cycele</td>
    <td>Number (Desimal)</td>
    <td>Ada nilai default, namun ada opsi untuk diubah per proyek</td>
    <td>Ada rentang batas minimum dan maksimum angka wajar pengisian</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td colspan="5">General Condition</td>
  </tr>
  <tr>
    <td>Running Status</td>
    <td>Boolean</td>
    <td>Bentuk Opsi “Running” atau “Stop”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Algae/Lumut</td>
    <td>Boolean</td>
    <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Deposit</td>
    <td>Boolean</td>
   <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td colspan="5">Job Description</td>
  </tr>
  <tr>
    <td>Cleaning Hot Basin</td>
    <td>Boolean</td>
    <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Cleaning Cool Basin</td>
    <td>Boolean</td>
   <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr><tr>
    <td>Cleaning Filter</td>
    <td>Boolean</td>
    <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Cleaning Area</td>
    <td>Boolean</td>
   <td>Bentuk Opsi “Ya” atau “Tidak”</td>
    <td>Validasi pilih salah satu</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td colspan="5">Consumption Water Meter</td>
  </tr>
  <tr>
    <td>Before</td>
    <td>Number (Desimal)</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td>After</td>
    <td>Number (Desimal)</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td>Total Consumption</td>
    <td>Number (Desimal)</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td colspan="5">Fill Up Chemical</td>
  </tr>
  <tr>
    <td>Kuantiti/Volume</td>
    <td>Number (Desimal)</td>
    <td>Diisi sesuai volume yang digunakan</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td colspan="5">Note</td>
  </tr>
  <tr>
    <td>Note</td>
    <td>Text</td>
    <td>Diisi catatan teknisi</td>
    <td>-</td>
    <td>No</td>
  </tr>
  </tbody>
</table>


### B. Work Report Cooling Tower 

<table>
<thead>
<tr>
<th>Field</th>
<th>Field Type</th>
<th>Parameter Limit</th>
<th>Validasi Rentang</th>
<th>Required</th>
</tr>
</thead>
<tbody>
  <tr>
    <td colspan="5">Administrasi</td>
  </tr>
  <tr>
    <td>Tanggal</td>
    <td>Date</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Zone</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td>unit</td>
    <td>Checkbox (Button)</td>
    <td>-</td>
    <td>-</td>
    <td>Yes (Min. 1)</td>
  </tr>
  <tr>
    <td colspan="5">Laporan Pekerjaan</td>
  </tr>
  <tr>
    <td>Situasi saat ini</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Pekerjaan yang dilakukan</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Hasil Pekerjaan</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Foto Pekerjaan</td>
    <td>Foto Sebelum & Sesudah</td>
    <td>-</td>
    <td>-</td>
    <td>Yes (Max. 8 Foto)</td>
  </tr>
  </tbody>
  </table>

  ### C. Work Report Condenser 

<table>
<thead>
<tr>
<th>Field</th>
<th>Field Type</th>
<th>Parameter Limit</th>
<th>Validasi Rentang</th>
<th>Required</th>
</tr>
</thead>
<tbody>
  <tr>
    <td colspan="5"><b>Administrasi</b></td>
  </tr>
  <tr>
    <td>Tanggal</td>
    <td>Date</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Zone</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>No</td>
  </tr>
  <tr>
    <td>unit</td>
    <td>Checkbox (Button)</td>
    <td>-</td>
    <td>-</td>
    <td>Yes (Min. 1)</td>
  </tr>
  <tr>
    <td colspan="5"><b>Laporan Pekerjaan</b></td>
  </tr>
  <tr>
    <td>Situasi saat ini</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Pekerjaan yang dilakukan</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Hasil Pekerjaan</td>
    <td>Text</td>
    <td>-</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Foto Pekerjaan</td>
    <td>Foto Sebelum & Sesudah</td>
    <td>-</td>
    <td>-</td>
    <td>Yes (Max. 8 Foto)</td>
  </tr>
  </tbody>
  </table>

  ### D. Form

  #### Form Data Klien

  |**Field**|**Field Type**|**Required**|
  |---|---|---|
  |Nama Perusahaan|Text|Yes|
  |Alamat|Text|Yes|
  |No. Telp|Number|Yes|
  |Email|Email|Yes|
  |Website|Text|No|

  #### Form Data Project

   |**Field**|**Field Type**|**Required**|
  |---|---|---|
  |Perusahaan|Text|Yes|
  |Nama Project|Text|Yes|
  |Tipe Project|Select: (Utama; Addendum)|Yes|
  |Jenis Project |Select: (Langsung; Subcon)|Yes|
  |Pekerjaan|Select: (Operasional; Proyek/Konstruksi; Ad Hoc) |Yes|
  |No. Penawaran|Text|Yes|
  |No. PO / SPK|Text|Yes (optional)|
  |Jenis Pekerjaan|Multiselect|Yes|
  |Tanggal Mulai|Date|Yes|
  |Tanggal Selesai|Date|Yes|
  |Warranty|Number (Satuan dalam X bulan)|Yes|
  |Notes|Text|No|
  |PIC Corintek|Select (User Corintek)|Yes|
  |PIC Klien|Select (User Client)|Yes|
  |Limit Parameter|Dari data setting master (default atau per project)|Yes|
  |Mesin|Dari data setting master|Yes|
  |Chemical|Dari data setting master|Yes|

    Catatan data project:
* Jika tipe project adalah **Utama** --> maka semua data adalah baru
* Jika tipe project adalah **Addendum** ==> maka data report melanjutkan data project utamanya

#### Form Pendaftaran / Edit User

  |**Field**|**Field Type**|**Required**|
	|---|---|---|
	|Akun|Select (Corintek; Client)|Yes|
	|Perusahaan (Khusus Akun Klien)|Text|Yes|
	|Nama|Text|Yes|
	|No. ID|Text|Yes|
	|No. Telp|Number|Yes|
	|Email|Email|Yes|
	|Alamat|Text Area|Yes|
	|Role|Text|Yes|
	|Status Kepegawaian (Corintek)|Select: (Permanen; Kontrak; Pekerja Lepas)|Yes|
	|Status Kerja|Select (Actif; Non Aktif)|Yes|

  Catatan:

  Status kerja akan menentukan terutama untuk Role Teknisi:
* Jika aktif maka bisa di assign project / log sheet
* Jika non aktif maka tidak bisa di assign project / log sheet

### D. Summary Report
    Struktur Summary Report:
1.	Summary Report
    *	Executive Summary Water Quality
    *	Executive Summary Condenser Approach
2.	Hasil Analisa Air / Laboratorium
    *	Form isian manual
3.	Logsheet
    *	Data semua logsheet yang sudah diisi pada project terkait
4.	Lampiran Foto
    *	Data foto dari semua logsheet diurutkan berdasarkan tanggal
5.	Pemakaian Chemical
    *	Form isian manual

#### Executive Summary Water Quality

Tampilkan data per nama kelompok mesin

#### Hasil Analisa Laboratorium 

   |**Field**|**Field Type**|**Required**|
  |---|---|---|
  |Attn|Text|Yes|
  |Cc|Text|No|
  |Customer|Nama Perusahaan|Yes|
  |Alamat|Alamat Perusahaan|Yes|
  |Fax No|Number|No|
  |No|Text|Yes|
  |Tanggal|Date|Yes|
  |---|
  |Parameter|Text|Yes|
  |Test Result|

  ## 10. User Matrix

  |User Role|Dashboard|Summary Reports|Log Sheets|View Reports|Hasil Analisa Lab|Absensi|Administrasi User|Administrasi Project|Administrasi Setting Master|Permission|
  |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
  |Super Admin|✓|✓|✓|✓|✓|✓|✓|✓|✓|CRUD|
  |PIC Project|✓|✓|✓|✓|✓|✓|-|✓|-|CRUD|
  |Teknisi|✓|-|✓|✓|-|✓|-|-|-|CRU|
  |Reporting|✓|✓|✓|✓|-|-|-|-|-|CRU|
  |Direksi|✓|✓|✓|✓|-|-|-|-|-|R|
  |Klien|✓|✓|✓|✓|-|-|-|-|-|R|

  * User role **Reporting** untuk melakukan finalisasi data laporan

