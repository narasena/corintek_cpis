-- CreateTable
CREATE TABLE "log_sheet_machines" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_sheet_machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "log_sheet_machines_logSheetId_machineId_key" ON "log_sheet_machines"("logSheetId", "machineId");

-- AddForeignKey
ALTER TABLE "log_sheet_machines" ADD CONSTRAINT "log_sheet_machines_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_sheet_machines" ADD CONSTRAINT "log_sheet_machines_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
