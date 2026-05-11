/*
  Warnings:

  - A unique constraint covering the columns `[projectId,date]` on the table `log_sheets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "log_sheets" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedByUserId" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "log_sheets_projectId_date_key" ON "log_sheets"("projectId", "date");

-- AddForeignKey
ALTER TABLE "log_sheets" ADD CONSTRAINT "log_sheets_rejectedByUserId_fkey" FOREIGN KEY ("rejectedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
