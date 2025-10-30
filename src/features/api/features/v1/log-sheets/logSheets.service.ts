import { TLogSheetAttributes } from '@/app/(main)/log-sheets/schemas/logSheetSchema';
import {
  LogSheetDetailType,
  Prisma,
  ValueType,
} from '@/features/api/generated/prisma';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function createLogSheetService(
  data: TLogSheetAttributes,
  tx?: Prisma.TransactionClient,
  projectId?: string
) {
  const newLogSheet = await tx?.logSheet.create({
    data: {
      projectId: projectId as string,
      notes: data.notes ? (data.notes as string) : null,
      clientPICSignatureId: `test-signature-client-personnel-${projectId}`,
      PICSignatureId: `test-signature-personnel-${projectId}`,
    },
  });
  const newLogSheetHistory = await tx?.logSheetHistory.create({
    data: {
      logSheetId: newLogSheet?.id as string,
      status: 'DRAFT',
    },
  });
  console.log(newLogSheetHistory);

  interface IMachineUnitId {
    unitNumber: number;
    machineId: string;
  }
  const allProjectMachines = await tx?.machine.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
  });

  const currentLogSheetMachines: {
    chillers: IMachineUnitId[];
    coolingTowers: IMachineUnitId[];
  } = {
    chillers: [],
    coolingTowers: [],
  };

  if (
    Object.keys(data.condenserData).length === 0 &&
    Object.keys(data.coolingTowerJobData).length === 0
  ) {
    throw new AppError({
      status: 400,
      message: 'Data chiller dan cooling tower tidak boleh kosong',
      isExpose: true,
    });
  }
  if (Object.keys(data.condenserData).length > 0) {
    currentLogSheetMachines.chillers = Object.keys(data.condenserData).map(
      (unitNumber: string) => {
        const machineId = allProjectMachines?.find(
          machine => machine.unitNumber === parseInt(unitNumber)
        )?.id;
        if (!machineId) {
          throw new AppError({
            status: 400,
            message: `Unit number ${unitNumber} tidak ditemukan`,
            isExpose: true,
          });
        }
        return {
          unitNumber: parseInt(unitNumber),
          machineId: machineId,
        };
      }
    );
  }
  if (Object.keys(data.coolingTowerJobData).length > 0) {
    currentLogSheetMachines.coolingTowers = Object.keys(
      data.coolingTowerJobData
    ).map((unitNumber: string) => {
      const machineId = allProjectMachines?.find(
        machine => machine.unitNumber === parseInt(unitNumber)
      )?.id;
      if (!machineId) {
        throw new AppError({
          status: 400,
          message: `Unit number ${unitNumber} tidak ditemukan`,
          isExpose: true,
        });
      }
      return {
        unitNumber: parseInt(unitNumber),
        machineId: machineId,
      };
    });
  }

  const logSheetDetails: Omit<
    Prisma.LogSheetDetailUncheckedCreateInput,
    'createdAt' | 'updatedAt' | 'deletedAt'
  >[] = [];

  // Condenser
  for (const unitNumber in data.condenserData) {
    for (const [paramName, paramValue] of Object.entries(
      data.condenserData[unitNumber] as Record<string, number>
    )) {
      const machineId = currentLogSheetMachines.chillers.find(
        machine => machine.unitNumber === parseInt(unitNumber)
      )?.machineId;
      if (!machineId) {
        throw new AppError({
          status: 400,
          message: `Unit number ${unitNumber} tidak ditemukan`,
          isExpose: true,
        });
      }
      logSheetDetails.push({
        logSheetId: newLogSheet?.id as string,
        machineId: machineId,
        parameterId: paramName,
        detailType: LogSheetDetailType.CHILLER_CONDENSER,
        valueType: ValueType.NUMBER,
        numericValue: paramValue,
      });
    }
  }

  // Evaporator
  for (const unitNumber in data.evaporatorData) {
    for (const [paramName, paramValue] of Object.entries(
      data.evaporatorData[unitNumber] as Record<string, number>
    )) {
      const machineId = currentLogSheetMachines.chillers.find(
        machine => machine.unitNumber === parseInt(unitNumber)
      )?.machineId;
      if (!machineId) {
        throw new AppError({
          status: 400,
          message: `Unit number ${unitNumber} tidak ditemukan`,
          isExpose: true,
        });
      }
      logSheetDetails.push({
        logSheetId: newLogSheet?.id as string,
        machineId: machineId,
        parameterId: paramName,
        detailType: LogSheetDetailType.CHILLER_EVAPORATOR,
        valueType: ValueType.NUMBER,
        numericValue: paramValue,
      });
    }
  }

  // Cooling tower
  for (const unitNumber in data.coolingTowerJobData) {
    for (const [paramName, paramValue] of Object.entries(
      data.coolingTowerJobData[unitNumber] as Record<string, number>
    )) {
      const machineId = currentLogSheetMachines.coolingTowers.find(
        machine => machine.unitNumber === parseInt(unitNumber)
      )?.machineId;
      if (!machineId) {
        throw new AppError({
          status: 400,
          message: `Unit number ${unitNumber} tidak ditemukan`,
          isExpose: true,
        });
      }
      logSheetDetails.push({
        logSheetId: newLogSheet?.id as string,
        machineId: machineId,
        parameterId: paramName,
        detailType: LogSheetDetailType.COOLING_TOWER_WATER_QUALITY,
        valueType: ValueType.BOOLEAN,
        numericValue: paramValue,
      });
    }
  }

  // Raw Water Quality
  for (const [paramName, paramValue] of Object.entries(
    data.rawWaterQualityData as Record<string, number>
  )) {
    logSheetDetails.push({
      logSheetId: newLogSheet?.id as string,
      parameterId: paramName,
      detailType: LogSheetDetailType.RAW_WATER_QUALITY,
      valueType: ValueType.NUMBER,
      numericValue: paramValue,
    });
  }

  // Cooling Tower Condition
  for (const unitNumber in data.coolingTowerGeneralConditionData) {
    for (const [paramName, paramValue] of Object.entries(
      data.coolingTowerGeneralConditionData[unitNumber] as Record<
        string,
        boolean
      >
    )) {
      const machineId = currentLogSheetMachines.coolingTowers.find(
        machine => machine.unitNumber === parseInt(unitNumber)
      )?.machineId;
      if (!machineId) {
        throw new AppError({
          status: 400,
          message: `Unit number ${unitNumber} tidak ditemukan`,
          isExpose: true,
        });
      }
      logSheetDetails.push({
        logSheetId: newLogSheet?.id as string,
        machineId: machineId,
        parameterId: paramName,
        detailType: LogSheetDetailType.COOLING_TOWER_CONDITION,
        valueType: ValueType.BOOLEAN,
        boolValue: paramValue,
      });
    }
  } catch (error) {
    return serviceErrorResponse({
      error,
      customErrorMessage: 'Failed to create log sheet details.',
      status: 400,
    });
  }

  return newLogSheet;
}

export async function fetchAllLogSheetsService(projectId: string) {
  try {
    const logSheets = await prisma.logSheet.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        date: true,
        clientPICSignature: true,
        PICSignature: true,
        logSheetHistories: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  try {
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Gagal membuat log sheet',
      status: 400,
    });
  }
}
