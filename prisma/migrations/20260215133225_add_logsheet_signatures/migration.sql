-- AlterTable
ALTER TABLE "log_sheets" ADD COLUMN     "clientPicSignatureUrl" TEXT,
ADD COLUMN     "clientPicSignedAt" TIMESTAMP(3),
ADD COLUMN     "clientPicSignedByUserId" TEXT,
ADD COLUMN     "technicianSignatureUrl" TEXT,
ADD COLUMN     "technicianSignedAt" TIMESTAMP(3),
ADD COLUMN     "technicianSignedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "log_sheets" ADD CONSTRAINT "log_sheets_technicianSignedByUserId_fkey" FOREIGN KEY ("technicianSignedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_sheets" ADD CONSTRAINT "log_sheets_clientPicSignedByUserId_fkey" FOREIGN KEY ("clientPicSignedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
