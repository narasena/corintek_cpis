# Digital Signature for Logsheet — Implementation Plan (MVP First)

## Context

- FSD requires digital signatures on logsheet forms.
- Roadmap lists digital signatures as deferred (DS-01/DS-02).
- Logsheet submission already has status flow (DRAFT/SUBMITTED/APPROVED) and locking.

## Goals

- Capture two signatures per logsheet: Technician and Client PIC.
- Block logsheet submission until both signatures are present.
- Signature area optimized for 16:9 landscape and works on touch + mouse.
- Simple retry/clear workflow for best UX.

## Non-Goals (MVP)

- No handwriting analysis or verification.
- No multi-stroke history, undo stack, or pressure sensitivity.
- No offline signing flow.
- No server-side PDF generation.
- No background removal/segmentation of strokes (keep simple white background).

## UX Requirements (MVP)

- Signature area uses 16:9 aspect ratio with clear visual boundary.
- Works with mouse, trackpad, and touch input.
- “Retry” button clears the canvas instantly.
- “Save” button disabled until there is a visible stroke.
- After save, show signature preview, signer name/role, and timestamp.
- Mobile: open signature in a full-screen dialog optimized for landscape; show rotate hint if portrait.

## Data Model (MVP)

Add fields to `LogSheet`:

- `technicianSignatureUrl` (string, nullable)
- `technicianSignedAt` (datetime, nullable)
- `technicianSignedById` (string, nullable)
- `clientPicSignatureUrl` (string, nullable)
- `clientPicSignedAt` (datetime, nullable)
- `clientPicSignedById` (string, nullable)

Optional (Phase 2):

- `signatureVersion` or `signatureHash` for tamper detection.

## Authorization Rules

- Technician signature: only project-assigned technician(s).
- Client PIC signature: only project-assigned client PIC.
- Admin can override in case of emergency.

## Server Action & Service Layer (MVP)

**New server action**: `saveLogSheetSignatureAction`

- Input: `{ logSheetId, signatureRole, dataUrl }`
- Validate with Zod (role in TECHNICIAN | CLIENT_PIC, dataUrl format, size limit).
- Upload image via existing R2 pipeline (same as logsheet photos).
- Service updates the correct signature fields + signedBy + signedAt.
- Revalidate logsheet detail route.
- Standard error logging with `[CPIS-ERROR] LogSheet.Signature`.

**New server action**: `submitLogSheetAction` (if existing, extend)

- Enforce: both signatures present before SUBMITTED.
- Return user-facing error if missing.

## UI Integration (MVP)

**New isolated components**

- `SignaturePad`: canvas-based capture with pointer events.
- `SignatureDialog`: full-screen modal for mobile.
- `SignaturePreview`: read-only display with signer info.

**Integration points**

- Logsheet detail page: render two signature blocks.
- Submission button: disabled until both signatures exist.
- Print/preview view: render signatures as images with labels.

## Upload Strategy

Preferred: reuse existing R2 upload service and image compression engine.

- Convert canvas to PNG data URL, then to Blob and File.
- Run the File through `compressImageV2` (same V2 engine as camera uploads) with:
  - `type: 'image/webp'`
  - `quality` around `0.7–0.8`
  - `maxDimension` around `800–1000` (signatures are small).
- Use the current upload action (same pipeline as logsheet photos) to store and return URL.
- Store resulting URL on logsheet signature fields.

Fallback (if R2 not desired for MVP):

- Store base64 string directly on logsheet (only if size limits are acceptable).

## Validation Rules (MVP)

- Signature canvas must contain stroke pixels above a threshold.
- Max image size after compression (e.g., 100KB) to keep pages fast.
- Block save if empty or oversized.
- Block submit if any required signature missing.

## MVP Delivery Steps (Low Risk)

1. Add LogSheet signature fields in Prisma schema and migrate.
2. Add types and Zod schema for signature payload.
3. Implement signature upload server action + service.
4. Build SignaturePad + Dialog UI (touch + mouse).
5. Wire into logsheet detail page with minimal edits.
6. Enforce submit rules in action/service.
7. Render in print preview.

## Phase 2 Enhancements

- Signature audit trail (who, when, IP/device metadata).
- Re-sign flow with reason logging and admin approval.
- Multi-stroke smoothing and pen pressure support.
- Optional watermark with logsheet ID and timestamp.

## UX Copy (Indonesian)

- Buttons: “Tanda Tangan”, “Simpan”, “Ulangi”
- Errors: “Tanda tangan belum lengkap.”, “Tanda tangan kosong.”

## Risks & Mitigations

- **Canvas not supported**: fallback to file upload of signature image.
- **Large base64**: enforce size limits and compress.
- **Role mismatch**: strict server-side checks.

## Success Criteria

- Technician and Client PIC can sign in under 30 seconds each.
- Logsheet submit is blocked until both signatures are saved.
- Signatures appear in print preview and final report.
