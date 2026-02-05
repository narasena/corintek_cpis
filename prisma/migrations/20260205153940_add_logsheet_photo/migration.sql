-- CreateEnum
CREATE TYPE "LogSheetPhotoType" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "log_sheet_photos" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "type" "LogSheetPhotoType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheet_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_sheet_photos_logSheetId_idx" ON "log_sheet_photos"("logSheetId");

-- CreateIndex
CREATE INDEX "log_sheet_photos_type_idx" ON "log_sheet_photos"("type");

-- AddForeignKey
ALTER TABLE "log_sheet_photos" ADD CONSTRAINT "log_sheet_photos_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
