-- CreateEnum
CREATE TYPE "SummaryReportStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "summary_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "dataTemuanUrl" TEXT,
    "dataBlowdownUrl" TEXT,
    "dataSuhuUrl" TEXT,
    "dataSuratJalanUrl" TEXT,
    "notes" TEXT,
    "status" "SummaryReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summary_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "summary_reports_projectId_period_key" ON "summary_reports"("projectId", "period");

-- AddForeignKey
ALTER TABLE "summary_reports" ADD CONSTRAINT "summary_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
