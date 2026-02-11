# Attendance (Absensi) — MVP Implementation Plan

## 1) MVP Objective
Deliver a reliable attendance flow for technicians with photo validation on clock-in/out, automatic total hours calculation, and admin/supervisor reporting with export.

## 2) In Scope (MVP)
- Technician clock-in with photo validation.
- Technician clock-out with photo validation.
- One attendance record per technician per day.
- Total hours calculation (clockOut - clockIn).
- Admin/Supervisor list view with filters and CSV export (Excel-compatible).

## 3) Out of Scope (Defer)
- GPS/geofencing.
- Shift scheduling or overtime rules.
- Approval workflows.
- Biometric verification.
- Attendance correction requests.

## 4) User Journeys
### 4.1 Technician — Clock In
Input:
- User opens Attendance page.
- System checks if today’s attendance exists.

Process:
- Show “Belum Absen Masuk” state.
- User captures photo using CameraInput.
- User submits clock-in.

Outcome:
- Record created with clockIn timestamp and photo URL.
- Success toast.
- UI shows clock-in time and photo.

### 4.2 Technician — Clock Out
Input:
- User opens Attendance page.
- System finds OPEN attendance record for today.

Process:
- Show “Sudah Absen Masuk” state.
- User captures clock-out photo.
- User submits clock-out.

Outcome:
- Record updated with clockOut timestamp, photo URL, total hours.
- Success toast.
- UI shows total hours and both photos.

### 4.3 Supervisor/Admin — Review and Export
Input:
- Supervisor/Admin opens Attendance list.
- Select date range and optional technician filter.

Process:
- System queries attendance list.
- User clicks Export.

Outcome:
- CSV file downloaded.
- Data ready for Excel import.

## 5) Data Model (Prisma)
### 5.1 Attendance Model
Fields:
- id: String (uuid)
- userId: String (relation to User)
- dateLocal: String (YYYY-MM-DD, local date)
- clockInAt: DateTime
- clockOutAt: DateTime?
- clockInPhotoUrl: String
- clockOutPhotoUrl: String?
- totalHours: Float?
- status: AttendanceStatus (OPEN | CLOSED)
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?

Indexes:
- @@unique([userId, dateLocal])
- @@index([dateLocal])

## 6) Service Layer (Business Logic)
### 6.1 createClockIn
Input:
- userId, dateLocal, clockInAt, clockInPhotoUrl

Process:
- Check no existing attendance for userId + dateLocal.
- Create Attendance with status OPEN.

Output:
- Attendance record.

### 6.2 createClockOut
Input:
- userId, dateLocal, clockOutAt, clockOutPhotoUrl

Process:
- Find OPEN attendance record for userId + dateLocal.
- Calculate totalHours = (clockOutAt - clockInAt) in hours.
- Validate duration > 0.
- Update record, status CLOSED.

Output:
- Updated attendance record.

### 6.3 getTodayAttendance
Input:
- userId, dateLocal

Process:
- Find attendance by userId + dateLocal.

Output:
- Attendance record or null.

### 6.4 listAttendance
Input:
- dateFrom, dateTo, userId?

Process:
- Filter by date range, optional userId.

Output:
- Attendance list.

### 6.5 exportAttendanceCsv
Input:
- dateFrom, dateTo, userId?

Process:
- Use listAttendance query.
- Map to CSV rows with headers.

Output:
- CSV content string.

## 7) Server Actions (Next.js)
### 7.1 clockInAction(formData)
Validations:
- userId from session.
- photo present.
- dateLocal computed from server time zone.

Flow:
- Upload photo to R2.
- Call createClockIn service.
- Revalidate attendance paths.

### 7.2 clockOutAction(formData)
Validations:
- userId from session.
- photo present.
- existing OPEN record.

Flow:
- Upload photo to R2.
- Call createClockOut service.
- Revalidate attendance paths.

### 7.3 getTodayAttendanceAction()
Flow:
- Resolve userId from session.
- Call getTodayAttendance service.

### 7.4 getAttendanceListAction(filters)
Flow:
- Validate admin/supervisor role.
- Call listAttendance service.

### 7.5 exportAttendanceCsvAction(filters)
Flow:
- Validate admin/supervisor role.
- Call exportAttendanceCsv service.
- Return file response or downloadable blob.

## 8) UI Implementation
### 8.1 Attendance Page (Technician)
Route:
- /attendance

Components:
- Status card: “Belum Absen Masuk” / “Sudah Absen Masuk”.
- Clock In button with CameraInput.
- Clock Out button with CameraInput (enabled only after clock-in).
- Photo previews.
- Total hours display after clock-out.

### 8.2 Attendance Admin Page
Route:
- /attendance/admin

Components:
- DataTable with filters (date range + user).
- Export CSV button.
- Columns: technician, date, clockIn, clockOut, totalHours, status.

## 9) Validation & Rules
- One attendance per user per dateLocal.
- clockOut requires existing OPEN record.
- Reject if clockOut <= clockIn.
- Photos required for both clock-in and clock-out.

## 10) Permissions
- Technician: can only view and create own attendance.
- Supervisor/Admin: can view all, export.

## 11) Acceptance Criteria
- Technician can clock in with photo and see updated status.
- Technician can clock out with photo, total hours computed.
- Admin/Supervisor can filter and export CSV.
- All actions return proper toasts and server error logs.

## 12) Implementation Checklist (MVP)
- Prisma schema + migration.
- Attendance feature folder: types, service, actions.
- Routes: /attendance, /attendance/admin.
- CameraInput integration for photos.
- CSV export action and UI button.
