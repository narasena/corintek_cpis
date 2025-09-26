-- CreateEnum
CREATE TYPE "public"."ChemicalType" AS ENUM ('BOILER_SYSTEM', 'COOLING_SYSTEM', 'CHEMICAL_CLEANING', 'WASTE_WATER_TREATMENT');

-- CreateEnum
CREATE TYPE "public"."LogSheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "public"."LogSheetDetailType" AS ENUM ('CHILLER_CONDENSER', 'CHILLER_EVAPORATOR', 'COOLING_TOWER_WATER_QUALITY', 'COOLING_TOWER_CONDITION', 'COOLING_TOWER_CLEANING', 'COOLING_TOWER_CONSUMPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MachineType" AS ENUM ('CHILLER', 'COOLING_TOWER');

-- CreateEnum
CREATE TYPE "public"."MachineStatus" AS ENUM ('RUNNING', 'IDLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."ParameterType" AS ENUM ('LAB_REPORT', 'LOG_SHEET', 'MASTER_SETTING', 'MACHINE_MONITORING', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('MAIN', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('DIRECT', 'SUBCONTRACT');

-- CreateEnum
CREATE TYPE "public"."WorkCategory" AS ENUM ('OPERATIONAL', 'CONSTRUCTION', 'AD_HOC', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PENDING', 'ONGOING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'DIRECTOR', 'CLIENT_PIC', 'CLIENT_MANAGER');

-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('PERMANENT', 'CONTRACT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "public"."ValueType" AS ENUM ('NUMBER', 'TEXT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "public"."technician_absences" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockInImgUrl" TEXT NOT NULL,
    "clockInPublicId" TEXT NOT NULL,
    "clockOut" TIMESTAMP(3),
    "clockOutImgUrl" TEXT,
    "clockOutPublicId" TEXT,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "technician_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chemicals" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ChemicalType" NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chemical_usages" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "chemicalId" TEXT NOT NULL,
    "dosage" DOUBLE PRECISION NOT NULL,
    "coolingTowerLogSheetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chemical_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lab_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "attention" TEXT,
    "carbonCopy" TEXT,
    "faxNumber" TEXT,
    "labReportNumber" TEXT NOT NULL,
    "remarks" JSONB NOT NULL,
    "comments" JSONB,
    "recommendations" JSONB,
    "fileUrl" TEXT,
    "filePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lab_report_details" (
    "id" TEXT NOT NULL,
    "labReportId" TEXT NOT NULL,
    "machineId" TEXT,
    "parameterId" TEXT NOT NULL,
    "valueType" "public"."ValueType" NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "boolValue" BOOLEAN,
    "textValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lab_report_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_sheets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "notes" TEXT,
    "PICSignatureId" TEXT NOT NULL,
    "clientPICSignatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_sheet_histories" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "status" "public"."LogSheetStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheet_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_sheet_details" (
    "id" TEXT NOT NULL,
    "logSheetId" TEXT NOT NULL,
    "machineId" TEXT,
    "parameterId" TEXT NOT NULL,
    "detailType" "public"."LogSheetDetailType" NOT NULL,
    "checkTime" TEXT,
    "valueType" "public"."ValueType" NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "boolValue" BOOLEAN,
    "textValue" TEXT,
    "imgUrl" TEXT,
    "imgPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "log_sheet_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."machines" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "public"."MachineType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."machine_histories" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "status" "public"."MachineStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "machine_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parameters" (
    "id" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "valueType" "public"."ValueType" NOT NULL,
    "unit" TEXT,
    "type" "public"."ParameterType" NOT NULL,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parameter_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameter_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."standard_methods" (
    "id" TEXT NOT NULL,
    "methodName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "standard_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parameter_limits" (
    "id" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "methodId" TEXT,
    "valueType" "public"."ValueType" NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "booleanValue" BOOLEAN,
    "textValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameter_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "avatarPublicId" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "parent_project_id" TEXT,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quoteNumber" TEXT NOT NULL,
    "PONumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "public"."ProjectType" NOT NULL,
    "contractType" "public"."ContractType" NOT NULL,
    "workCategory" "public"."WorkCategory" NOT NULL,
    "warranty" INTEGER,
    "clientPICId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_histories" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "project_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cleaning_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "zone" TEXT,
    "workToDo" TEXT NOT NULL,
    "logSheetNotes" JSONB NOT NULL,
    "chemicalStartTime" TIMESTAMP(3) NOT NULL,
    "chemicalEndTime" TIMESTAMP(3) NOT NULL,
    "chemicalTotalTime" INTEGER NOT NULL,
    "disinfectantChemicalId" TEXT NOT NULL,
    "descalingChemicalId" TEXT NOT NULL,
    "chemicalNotes" JSONB NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "beforeBrushingNotes" JSONB NOT NULL,
    "afterBrushingNotes" JSONB NOT NULL,
    "PICNotes" JSONB NOT NULL,
    "clientNotes" JSONB NOT NULL,
    "PICSignatureId" TEXT NOT NULL,
    "clientPICSignatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cleaning_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "zone" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "public"."MachineType" NOT NULL,
    "currentCondition" TEXT NOT NULL,
    "workDone" TEXT NOT NULL,
    "endResult" TEXT NOT NULL,
    "PICSignatureId" TEXT NOT NULL,
    "clientPICSignatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_report_photos" (
    "id" TEXT NOT NULL,
    "workReportId" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_report_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePublicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "master_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_setting_details" (
    "id" TEXT NOT NULL,
    "masterSettingId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "master_setting_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."signatures" (
    "id" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "IDNumber" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "employmentStatus" "public"."EmploymentStatus" NOT NULL,
    "avatarUrl" TEXT,
    "avatarPublicId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "logSheetId" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chemical_usages_machineId_chemicalId_idx" ON "public"."chemical_usages"("machineId", "chemicalId");

-- CreateIndex
CREATE INDEX "chemical_usages_chemicalId_idx" ON "public"."chemical_usages"("chemicalId");

-- CreateIndex
CREATE INDEX "chemical_usages_coolingTowerLogSheetId_machineId_idx" ON "public"."chemical_usages"("coolingTowerLogSheetId", "machineId");

-- CreateIndex
CREATE INDEX "lab_reports_projectId_idx" ON "public"."lab_reports"("projectId");

-- CreateIndex
CREATE INDEX "lab_report_details_labReportId_machineId_parameterId_idx" ON "public"."lab_report_details"("labReportId", "machineId", "parameterId");

-- CreateIndex
CREATE INDEX "lab_report_details_labReportId_parameterId_idx" ON "public"."lab_report_details"("labReportId", "parameterId");

-- CreateIndex
CREATE INDEX "lab_report_details_machineId_parameterId_idx" ON "public"."lab_report_details"("machineId", "parameterId");

-- CreateIndex
CREATE INDEX "lab_report_details_parameterId_idx" ON "public"."lab_report_details"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "log_sheets_PICSignatureId_key" ON "public"."log_sheets"("PICSignatureId");

-- CreateIndex
CREATE UNIQUE INDEX "log_sheets_clientPICSignatureId_key" ON "public"."log_sheets"("clientPICSignatureId");

-- CreateIndex
CREATE INDEX "log_sheets_projectId_idx" ON "public"."log_sheets"("projectId");

-- CreateIndex
CREATE INDEX "log_sheet_histories_logSheetId_idx" ON "public"."log_sheet_histories"("logSheetId");

-- CreateIndex
CREATE INDEX "log_sheet_details_logSheetId_machineId_parameterId_idx" ON "public"."log_sheet_details"("logSheetId", "machineId", "parameterId");

-- CreateIndex
CREATE INDEX "log_sheet_details_logSheetId_parameterId_idx" ON "public"."log_sheet_details"("logSheetId", "parameterId");

-- CreateIndex
CREATE INDEX "log_sheet_details_machineId_parameterId_idx" ON "public"."log_sheet_details"("machineId", "parameterId");

-- CreateIndex
CREATE INDEX "log_sheet_details_parameterId_idx" ON "public"."log_sheet_details"("parameterId");

-- CreateIndex
CREATE INDEX "machines_projectId_idx" ON "public"."machines"("projectId");

-- CreateIndex
CREATE INDEX "machine_histories_machineId_idx" ON "public"."machine_histories"("machineId");

-- CreateIndex
CREATE UNIQUE INDEX "parameters_parameter_key" ON "public"."parameters"("parameter");

-- CreateIndex
CREATE INDEX "parameters_groupId_idx" ON "public"."parameters"("groupId");

-- CreateIndex
CREATE INDEX "parameter_limits_parameterId_idx" ON "public"."parameter_limits"("parameterId");

-- CreateIndex
CREATE INDEX "projects_clientId_parent_project_id_idx" ON "public"."projects"("clientId", "parent_project_id");

-- CreateIndex
CREATE INDEX "projects_clientPICId_idx" ON "public"."projects"("clientPICId");

-- CreateIndex
CREATE INDEX "projects_technicianId_idx" ON "public"."projects"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_reports_disinfectantChemicalId_key" ON "public"."cleaning_reports"("disinfectantChemicalId");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_reports_descalingChemicalId_key" ON "public"."cleaning_reports"("descalingChemicalId");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_reports_PICSignatureId_key" ON "public"."cleaning_reports"("PICSignatureId");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_reports_clientPICSignatureId_key" ON "public"."cleaning_reports"("clientPICSignatureId");

-- CreateIndex
CREATE UNIQUE INDEX "work_reports_PICSignatureId_key" ON "public"."work_reports"("PICSignatureId");

-- CreateIndex
CREATE UNIQUE INDEX "work_reports_clientPICSignatureId_key" ON "public"."work_reports"("clientPICSignatureId");

-- CreateIndex
CREATE INDEX "work_reports_projectId_idx" ON "public"."work_reports"("projectId");

-- CreateIndex
CREATE INDEX "work_report_photos_workReportId_idx" ON "public"."work_report_photos"("workReportId");

-- CreateIndex
CREATE INDEX "reports_projectId_idx" ON "public"."reports"("projectId");

-- CreateIndex
CREATE INDEX "master_settings_projectId_idx" ON "public"."master_settings"("projectId");

-- CreateIndex
CREATE INDEX "master_setting_details_masterSettingId_parameterId_idx" ON "public"."master_setting_details"("masterSettingId", "parameterId");

-- CreateIndex
CREATE INDEX "master_setting_details_parameterId_idx" ON "public"."master_setting_details"("parameterId");

-- CreateIndex
CREATE INDEX "signatures_signerId_idx" ON "public"."signatures"("signerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "public"."users"("phoneNumber");

-- CreateIndex
CREATE INDEX "notifications_technicianId_logSheetId_idx" ON "public"."notifications"("technicianId", "logSheetId");

-- CreateIndex
CREATE INDEX "notifications_logSheetId_idx" ON "public"."notifications"("logSheetId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "public"."technician_absences" ADD CONSTRAINT "technician_absences_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chemical_usages" ADD CONSTRAINT "chemical_usages_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "public"."machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chemical_usages" ADD CONSTRAINT "chemical_usages_chemicalId_fkey" FOREIGN KEY ("chemicalId") REFERENCES "public"."chemicals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chemical_usages" ADD CONSTRAINT "chemical_usages_coolingTowerLogSheetId_fkey" FOREIGN KEY ("coolingTowerLogSheetId") REFERENCES "public"."log_sheet_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_reports" ADD CONSTRAINT "lab_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_report_details" ADD CONSTRAINT "lab_report_details_labReportId_fkey" FOREIGN KEY ("labReportId") REFERENCES "public"."lab_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_report_details" ADD CONSTRAINT "lab_report_details_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "public"."machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_report_details" ADD CONSTRAINT "lab_report_details_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheets" ADD CONSTRAINT "log_sheets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheets" ADD CONSTRAINT "log_sheets_PICSignatureId_fkey" FOREIGN KEY ("PICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheets" ADD CONSTRAINT "log_sheets_clientPICSignatureId_fkey" FOREIGN KEY ("clientPICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheet_histories" ADD CONSTRAINT "log_sheet_histories_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "public"."log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheet_details" ADD CONSTRAINT "log_sheet_details_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "public"."log_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheet_details" ADD CONSTRAINT "log_sheet_details_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "public"."machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_sheet_details" ADD CONSTRAINT "log_sheet_details_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."machines" ADD CONSTRAINT "machines_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."machine_histories" ADD CONSTRAINT "machine_histories_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "public"."machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameters" ADD CONSTRAINT "parameters_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."parameter_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter_limits" ADD CONSTRAINT "parameter_limits_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter_limits" ADD CONSTRAINT "parameter_limits_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "public"."standard_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_parent_project_id_fkey" FOREIGN KEY ("parent_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_clientPICId_fkey" FOREIGN KEY ("clientPICId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cleaning_reports" ADD CONSTRAINT "cleaning_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cleaning_reports" ADD CONSTRAINT "cleaning_reports_disinfectantChemicalId_fkey" FOREIGN KEY ("disinfectantChemicalId") REFERENCES "public"."chemical_usages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cleaning_reports" ADD CONSTRAINT "cleaning_reports_descalingChemicalId_fkey" FOREIGN KEY ("descalingChemicalId") REFERENCES "public"."chemical_usages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cleaning_reports" ADD CONSTRAINT "cleaning_reports_PICSignatureId_fkey" FOREIGN KEY ("PICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cleaning_reports" ADD CONSTRAINT "cleaning_reports_clientPICSignatureId_fkey" FOREIGN KEY ("clientPICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_reports" ADD CONSTRAINT "work_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_reports" ADD CONSTRAINT "work_reports_PICSignatureId_fkey" FOREIGN KEY ("PICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_reports" ADD CONSTRAINT "work_reports_clientPICSignatureId_fkey" FOREIGN KEY ("clientPICSignatureId") REFERENCES "public"."signatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_report_photos" ADD CONSTRAINT "work_report_photos_workReportId_fkey" FOREIGN KEY ("workReportId") REFERENCES "public"."work_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_settings" ADD CONSTRAINT "master_settings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_setting_details" ADD CONSTRAINT "master_setting_details_masterSettingId_fkey" FOREIGN KEY ("masterSettingId") REFERENCES "public"."master_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_setting_details" ADD CONSTRAINT "master_setting_details_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."signatures" ADD CONSTRAINT "signatures_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "public"."log_sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
