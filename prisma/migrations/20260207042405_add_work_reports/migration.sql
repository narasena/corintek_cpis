-- CreateTable
CREATE TABLE "work_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situation" TEXT NOT NULL,
    "workDone" TEXT NOT NULL,
    "workResult" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_report_photos" (
    "id" TEXT NOT NULL,
    "workReportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_report_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MachineToWorkReport" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MachineToWorkReport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MachineToWorkReport_B_index" ON "_MachineToWorkReport"("B");

-- AddForeignKey
ALTER TABLE "work_reports" ADD CONSTRAINT "work_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_report_photos" ADD CONSTRAINT "work_report_photos_workReportId_fkey" FOREIGN KEY ("workReportId") REFERENCES "work_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MachineToWorkReport" ADD CONSTRAINT "_MachineToWorkReport_A_fkey" FOREIGN KEY ("A") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MachineToWorkReport" ADD CONSTRAINT "_MachineToWorkReport_B_fkey" FOREIGN KEY ("B") REFERENCES "work_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
