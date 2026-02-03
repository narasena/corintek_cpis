-- CreateEnum
CREATE TYPE "LogSheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('CHILLER', 'COOLING_TOWER');

-- CreateEnum
CREATE TYPE "MachineOwnership" AS ENUM ('CORINTEK', 'CLIENT');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('RUNNING', 'IDLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('NUMBER', 'BOOLEAN', 'TEXT');

-- CreateEnum
CREATE TYPE "ParameterCategory" AS ENUM ('UNIT_CONDENSOR', 'UNIT_EVAPORATOR', 'COOLING_WATER_QUALITY', 'GENERAL_CONDITION', 'JOB_DESCRIPTION', 'CONSUMPTION');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'ONGOING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_sheets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "LogSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_sheet_entries" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "machineId" TEXT,
    "valueType" "ValueType" NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "boolValue" BOOLEAN,
    "textValue" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "type" "MachineType" NOT NULL,
    "ownership" "MachineOwnership" NOT NULL DEFAULT 'CORINTEK',
    "status" "MachineStatus" NOT NULL DEFAULT 'IDLE',
    "capacity" DOUBLE PRECISION,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variableName" TEXT NOT NULL,
    "category" "ParameterCategory" NOT NULL,
    "valueType" "ValueType" NOT NULL,
    "unit" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quoteNumber" TEXT,
    "poNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_name_key" ON "clients"("name");

-- CreateIndex
CREATE INDEX "log_sheets_projectId_date_idx" ON "log_sheets"("projectId", "date");

-- CreateIndex
CREATE INDEX "log_sheet_entries_logSheetId_idx" ON "log_sheet_entries"("logSheetId");

-- CreateIndex
CREATE INDEX "log_sheet_entries_parameterId_idx" ON "log_sheet_entries"("parameterId");

-- CreateIndex
CREATE INDEX "log_sheet_entries_machineId_idx" ON "log_sheet_entries"("machineId");

-- CreateIndex
CREATE INDEX "machines_projectId_idx" ON "machines"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "parameters_variableName_key" ON "parameters"("variableName");

-- CreateIndex
CREATE INDEX "projects_clientId_idx" ON "projects"("clientId");

-- AddForeignKey
ALTER TABLE "log_sheets" ADD CONSTRAINT "log_sheets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_sheet_entries" ADD CONSTRAINT "log_sheet_entries_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_sheet_entries" ADD CONSTRAINT "log_sheet_entries_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_sheet_entries" ADD CONSTRAINT "log_sheet_entries_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
