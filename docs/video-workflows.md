# CPIS Automated Video Workflows

This document provides a comprehensive, step-by-step breakdown of the workflows demonstrated in the automated high-res (1080p Desktop & Pixel 5 Portrait) `.webm` generation suite.

It encompasses every user interface page covered by the testing suite, simulating the end-to-end data lifecycle of Corintek's CPIS application.

---

## 1. Domain: Users & Access (`01-users-and-profiles`)

This domain highlights the Role-Based Access Control (RBAC) ensuring sensitive data boundaries.

### 1A. Admin Login & User Management

1. **Actor:** Administrator (`admin@corintek.test`)
2. **Action:** Enters credentials and lands directly on the main CPIS **Dashboard** (`/dashboard`).
3. **Action:** Pauses to present the full suite of sidebar menus available to Admins:
   - Dashboard
   - Clients
   - Projects
   - Summary Reports
   - Log Sheets
   - Work Reports
   - Lab Analyses
   - Chemicals
   - Parameters
   - Users
   - Absensi (Attendance)
4. **Action:** Navigates to **Users** (`/users`). Shows the management view where new internal/external users can be assigned roles.

### 1B. Client Login & Restricted View

1. **Actor:** Client (`client@client.test`)
2. **Action:** Enters credentials and lands on their specific **Dashboard** (`/dashboard`).
3. **Action:** Pauses to verify that the sidebar menu is highly restricted, preventing access to back-office functions. They only see:
   - Dashboard
   - Summary Reports

---

## 2. Domain: Master Data (`02-master-data`)

_All setup workflows performed by the **Administrator** before Technicians can begin work._

### 2A. Parameter Limits Setup

1. **Actor:** Admin
2. **Action:** Navigates to **Parameters** (`/parameters`).
3. **Action:** Clicks the "Tambah" (Add) button.
4. **Action:** The system pauses with the empty profile form, demonstrating where default thresholds (e.g., standard Condenser or Cooling Tower approach limits) are set.

### 2B. Client Onboarding

1. **Actor:** Admin
2. **Action:** Navigates to **Clients** (`/clients`).
3. **Action:** Clicks "Tambah" to create a new tenant.
4. **Data Entry:** Fills out the comprehensive client form:
   - _Nama Perusahaan (Company)_: PT Industrial Manufaktur
   - _Alamat (Address)_: Kawasan Industri Delta, Jakarta
   - _No. Telp (Phone)_: 021-5551234
   - _Email_: contact@industrial.co.id
5. **Action:** Clicks "Simpan" (Save) to formally register the tenant in CPIS.

### 2C. Project Assignment

1. **Actor:** Admin
2. **Action:** Navigates to **Projects** (`/projects`).
3. **Action:** Clicks "Tambah" to initiate a new service project.
4. **Data Entry:** Links the work to a Client:
   - _Nama Proyek_: Water Treatment Q3
   - _Client_: Selects "PT Industrial Manufaktur"
   - _Lokasi_: Pabrik Site A
   - _Tipe Layanan_: FULL_SERVICE
   - _Estimasi Target Selesai_: Sets a future date.
5. **Action:** Clicks "Simpan", finalizing the operational scaffolding for field work.

---

## 3. Domain: Operations (`03-operations`)

_Demonstrates the daily field execution cycle (Technicians) and the approval queue (Admin)._

### 3A. Technician Attendance (Absensi)

1. **Actor:** Technician (`technician@corintek.test`)
2. **Action:** Logs in and navigates to the **Absensi** page (`/attendance`).
3. **Action:** The video pauses on the clock-in interface, demonstrating the UI where technicians would trigger geolocation tracking and take their mandatory morning site photo before beginning daily routing.

### 3B. Log Sheet Data Entry

1. **Actor:** Technician
2. **Action:** Navigates to **Log Sheets** (`/log-sheets`) and clicks "Tambah".
3. **Action:** Selects an assigned Project and a specific Unit Type (e.g., Condenser).
4. **Data Entry:** Simulates a typical monthly routine inspection, typing in hard values:
   - _Temperature In_: `28.5`
   - _Temperature Out_: `32.1`
5. **Action:** Clicks the "Draft" button. This demonstrates the ability of a technician to save partial work without permanently locking the sheet into the Admin's "Approval/Pending" queue.

### 3C. Ad-Hoc Work Reports

1. **Actor:** Technician
2. **Action:** Navigates to **Work Reports** (`/work-reports`) and clicks "Tambah".
3. **Data Entry:** Simulates the reporting of an unexpected, un-scheduled site incident:
   - _Situasi/Masalah_: Ditemukan tekanan air rendah pada pipa utama chiller.
   - _Pekerjaan Dilakukan_: Melakukan flushing pada pipa dan pengecekan filter.
   - _Hasil_: Tekanan air kembali normal (2.5 bar).
4. **Action:** Points out the interface where technicians attach field photos as proof of intervention.

### 3D. Admin Review & E-Signature Approval

1. **Actor:** Admin
2. **Action:** Logs in, navigates to pending **Work Reports** or **Log Sheets** to perform a managerial review.
3. **Action:** Expands the completed Technician report.
4. **Action:** Slowly scrolls down the data tables to verify the inputs and parameters.
5. **Action:** Accesses the "Tanda Tangan" (Signature) interface.
6. **Action:** Uses the mouse pointer to digitally draw a legally binding signature inside the canvas.
7. **Action:** Verifies the presence of the "Approve/Setuju" state to lock the document and finalize it for customer viewing.

---

## 4. Domain: Analytics & Client Handoff (`04-analytics`)

_Demonstrates what end-customers visually receive after Corintek processes the data._

### 4A. Client Dashboard and Reports

1. **Actor:** Client
2. **Action:** Lands on the restricted **Dashboard** (`/dashboard`).
3. **Action:** Scrolls vertically to showcase the key executive components:
   - _Activity Feed_: The timeline of recently approved Log Sheets and Work Reports.
   - _Ampere Chart_: The historical trend graph tracking hardware efficiency.
   - _Approach Chart_: The cooling efficiency graph visualizing thermodynamic performance limit alerts.
4. **Action:** Mentions (in the test runner) navigation to the **Summary Reports** section (`/summary-reports`), confirming the client can view high-level monthly sign-offs and securely download their Lab Analysis PDF attachments.
