-- CreateTable
CREATE TABLE "chemicals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemical_usages" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "chemicalId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chemical_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chemicals_name_key" ON "chemicals"("name");

-- CreateIndex
CREATE INDEX "chemical_usages_logSheetId_idx" ON "chemical_usages"("logSheetId");

-- CreateIndex
CREATE INDEX "chemical_usages_chemicalId_idx" ON "chemical_usages"("chemicalId");

-- AddForeignKey
ALTER TABLE "chemical_usages" ADD CONSTRAINT "chemical_usages_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_usages" ADD CONSTRAINT "chemical_usages_chemicalId_fkey" FOREIGN KEY ("chemicalId") REFERENCES "chemicals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
