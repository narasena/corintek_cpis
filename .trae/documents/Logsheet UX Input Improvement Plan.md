# Logsheet UX Input Improvement Plan

## Tujuan
- Membuat input log sheet fleksibel dengan pilihan unit mesin yang aktif per hari.
- Menampilkan validasi sebelum Simpan/Kirim tanpa reset data pengguna.
- Mengoptimalkan pengalaman input mobile untuk teknisi lapangan.

## Kondisi Saat Ini
- UI input log sheet berada di [page.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx).
- Validasi server pada submit/approve berada di [service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/service.ts).
- Model data log sheet ada di [log-sheets.prisma](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/prisma/schema/log-sheets.prisma).
- Saat ini semua unit mesin selalu muncul di tabel input.

## BDD (Input → Proses → Outcome)
- Input: Pengguna memilih unit Chiller/CT yang aktif hari itu.
- Proses: UI hanya menampilkan kolom unit terpilih; raw water tetap wajib.
- Outcome: Form lebih ringkas dan fokus pada unit yang relevan.

- Input: Pengguna menekan Simpan/Kirim dengan data yang belum lengkap.
- Proses: Validasi client mendeteksi field wajib kosong dan menampilkan error.
- Outcome: Data tidak reset dan user tahu apa yang harus diisi.

- Input: Pengguna membuka log sheet di ponsel.
- Proses: UI menampilkan kartu/stacked layout, tombol aksi mudah dijangkau.
- Outcome: Input cepat, minim scroll horizontal, lebih nyaman di lapangan.

## Rencana Implementasi (Detail)

### 1) Data Model: Relasi Unit Aktif per Log Sheet
- Tambahkan model `LogSheetMachine`:
  - Fields: `id`, `logSheetId`, `machineId`, `createdAt`.
  - Relation: `LogSheet` 1..* `LogSheetMachine`, `Machine` 1..* `LogSheetMachine`.
  - Index unik: `@@unique([logSheetId, machineId])`.
- Tambahkan relasi di model `LogSheet`.
- Update prisma schema pada [log-sheets.prisma](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/prisma/schema/log-sheets.prisma).
- Jalankan migrasi: `npm run prisma:migrate`.

### 2) Service Layer: Ambil & Simpan Unit Aktif
- Tambahkan fungsi di [service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/service.ts):
  - `getLogSheetActiveMachines(logSheetId)` → return `machineIds`.
  - `upsertLogSheetMachines(logSheetId, machineIds)` → insert/delete.
- Update `getLogSheetDetail` agar mengembalikan:
  - `activeMachineIds: { chillers: string[]; coolingTowers: string[] }`.
  - Fallback: jika belum ada data, gunakan semua mesin project.
- Update validasi server:
  - `validateLogSheetForSubmission` dan `validateLogSheetForApproval` hanya memeriksa unit yang aktif.
  - Raw water selalu wajib untuk `COOLING_WATER_QUALITY`.
  - Konsumsi air tetap wajib meskipun unit mesin kosong.
- Update `upsertLogSheetEntries` atau pemanggilnya agar menghapus entries untuk unit yang dinonaktifkan.

### 3) Actions: Endpoint Server Action untuk Unit Aktif
- Tambahkan action baru di [actions.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/actions.ts):
  - `saveLogSheetMachinesAction({ logSheetId, machineIds })`.
  - Zod schema validasi UUID.
  - Revalidate path log sheet.

### 4) UI: Pilih Unit Mesin yang Aktif
- Di [page.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx):
  - Tambahkan state `activeChillerIds`, `activeCoolingTowerIds`.
  - Tambahkan UI multi-select (checkbox list) untuk Chiller dan CT.
  - Tombol cepat: “Pilih Semua”, “Kosongkan”.
  - Simpan pilihan ke server via `saveLogSheetMachinesAction`.
  - Saat render tabel, filter `machines` agar hanya yang aktif.
  - Jika tidak ada unit terpilih, tampilkan empty-state dan hint untuk memilih unit.

### 5) Validasi Client Sebelum Simpan/Kirim
- Tambahkan fungsi `validateBeforeSave()` di `page.tsx`:
  - Bangun daftar error berdasarkan `entryState` dan unit aktif.
  - Aturan:
    - Semua parameter kategori `UNIT_CONDENSOR/UNIT_EVAPORATOR` wajib untuk Chiller aktif.
    - Semua parameter kategori `COOLING_WATER_QUALITY/GENERAL_CONDITION/JOB_DESCRIPTION` wajib untuk CT aktif.
    - Raw water untuk `COOLING_WATER_QUALITY` wajib selalu.
    - `CONSUMPTION` wajib selalu.
  - Simpan `validationErrors` sebagai map `entryKey → message`.
  - Highlight input invalid (border merah) dan tampilkan toast ringkas.
- Panggil validasi di:
  - `handleSave` → blok save jika error.
  - `handleSubmit` → blok submit jika error.
- Pastikan `saveDraft` tidak memanggil `fetchData()` jika validasi gagal agar data tidak reset.

### 6) Mobile-First UI Layout
- Gunakan dua layout:
  - Desktop: tabel existing (`md:block`).
  - Mobile: kartu/stacked list (`md:hidden`) per kategori & per unit.
- Setiap kartu mobile:
  - Header: kategori + nama unit.
  - List parameter dengan input full-width.
  - Catatan (Notes) dan raw water ditampilkan di bagian bawah.
- Tambahkan action bar mobile:
  - Sticky bottom dengan tombol Simpan/Kirim.
  - Pastikan tombol mudah dijangkau (height ≥ 44px).

### 7) Cleanup & Consistency
- Pastikan semua error toast memakai format konsisten.
- Pastikan log sheet preview tetap menggunakan semua mesin dari server data (preview tidak berubah).

## Verifikasi (Manual)
- Pilih hanya Chiller #1 dan #3, CT #2:
  - Tabel hanya menampilkan kolom unit aktif.
  - Raw water tetap muncul dan wajib.
- Coba Simpan tanpa isi Consumption:
  - Error tampil, data tidak reset.
- Coba Kirim tanpa isi satu field wajib:
  - Error tampil, submit diblok.
- Cek mobile:
  - Tidak ada scroll horizontal.
  - Input nyaman di layar kecil.

## Risiko & Mitigasi
- Risiko: log sheet lama tanpa data unit aktif.
  - Mitigasi: fallback ke semua mesin jika data kosong.
- Risiko: data entry lama untuk unit non-aktif hilang.
  - Mitigasi: hanya hapus entries saat user menyimpan pilihan unit baru.
