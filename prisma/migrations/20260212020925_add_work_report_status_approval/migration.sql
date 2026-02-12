-- CreateEnum
CREATE TYPE "WorkReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- AlterTable
ALTER TABLE "work_reports" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedByUserId" TEXT,
ADD COLUMN     "status" "WorkReportStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "work_reports" ADD CONSTRAINT "work_reports_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
