-- AlterTable
ALTER TABLE "work_reports" ADD COLUMN     "clientPicSignatureUrl" TEXT,
ADD COLUMN     "clientPicSignedAt" TIMESTAMP(3),
ADD COLUMN     "clientPicSignedByUserId" TEXT,
ADD COLUMN     "technicianSignatureUrl" TEXT,
ADD COLUMN     "technicianSignedAt" TIMESTAMP(3),
ADD COLUMN     "technicianSignedByUserId" TEXT;
