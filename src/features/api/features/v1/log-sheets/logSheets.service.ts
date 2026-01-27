import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma/client';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';
import { ILogSheetServiceData } from '@/types/log-sheet.type';

export async function createLogSheetService(
  data: ILogSheetServiceData,
  tx?: Prisma.TransactionClient,
  projectId?: string
) {
  // Parse and validate the date
  let logSheetDate: Date;
  if (data.date) {
    if (typeof data.date === 'string') {
      logSheetDate = new Date(data.date);
    } else {
      logSheetDate = data.date;
    }
    // Validate that the date is valid
    if (isNaN(logSheetDate.getTime())) {
      throw new AppError({
        status: 400,
        message: 'Invalid date provided.',
        isExpose: true,
      });
    }
  } else {
    // Default to current date if no date is provided
    logSheetDate = new Date();
  }

  // Create placeholder signatures if they don't exist
  // This is a temporary solution until proper signature handling is implemented
  const picSignatureId = `placeholder-pic-${projectId}`;
  const clientSignatureId = `placeholder-client-${projectId}`;

  // Get a default user for placeholder signatures (first admin user)
  const defaultUser = await tx?.user.findFirst({
    where: {
      role: 'ADMIN',
      isActive: true,
    },
  });

  if (!defaultUser) {
    throw new AppError({
      status: 500,
      message: 'No active admin user found for signature creation.',
    });
  }

  // Create PIC signature if it doesn't exist
  const existingPicSignature = await tx?.signature.findUnique({
    where: { id: picSignatureId },
  });

  if (!existingPicSignature) {
    await tx?.signature.create({
      data: {
        id: picSignatureId,
        signerId: defaultUser.id,
        imgUrl: 'https://via.placeholder.com/200x100?text=PIC+Signature',
        publicId: `placeholder-pic-${projectId}`,
      },
    });
  }

  // Create client signature if it doesn't exist
  const existingClientSignature = await tx?.signature.findUnique({
    where: { id: clientSignatureId },
  });

  if (!existingClientSignature) {
    await tx?.signature.create({
      data: {
        id: clientSignatureId,
        signerId: defaultUser.id,
        imgUrl: 'https://via.placeholder.com/200x100?text=Client+Signature',
        publicId: `placeholder-client-${projectId}`,
      },
    });
  }

  const newLogSheet = await tx?.logSheet.create({
    data: {
      projectId: projectId as string,
      date: logSheetDate,
      notes: data.notes ? (data.notes as string) : null,
      clientPICSignatureId: clientSignatureId,
      PICSignatureId: picSignatureId,
    },
  });

  if (!newLogSheet) {
    throw new AppError({
      status: 500,
      message: 'Failed to create log sheet.',
    });
  }

  await tx?.logSheetHistory.create({
    data: {
      logSheetId: newLogSheet.id,
      status: 'DRAFT',
    },
  });

  const allProjectMachines = await tx?.machine.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: { id: true, unitNumber: true, type: true },
  });

  const logSheetDetails: Prisma.LogSheetDetailCreateManyInput[] = [];

  const parameterGroups = await tx?.parameterGroup.findMany({
    where: {
      type: 'LOG_SHEET',
    },
    include: {
      members: {
        include: {
          parameter: true,
        },
      },
    },
  });

  if (!parameterGroups) {
    throw new AppError({
      status: 500,
      message: 'Log sheet parameter groups not found.',
    });
  }

  for (const group of parameterGroups) {
    const groupData = (data as Record<string, unknown>)[group.id] as
      | Record<string, unknown>
      | undefined;
    if (!groupData) continue;

    // Determine if this is a machine-specific group based on naming convention
    const groupNameLower = group.name.toLowerCase();
    const isChillerGroup =
      groupNameLower.includes('unit evaporator') ||
      groupNameLower.includes('unit condensor') ||
      groupNameLower.includes('unit condenser') ||
      (groupNameLower.includes('chiller') &&
        !groupNameLower.includes('cooling') &&
        !groupNameLower.includes('tower'));
    const isCoolingTowerGroup =
      groupNameLower.includes('cooling tower') ||
      groupNameLower.includes('general condition') ||
      groupNameLower.includes('job description') ||
      (groupNameLower.includes('tower') && !groupNameLower.includes('unit'));
    const isMachineGroup = isChillerGroup || isCoolingTowerGroup;

    if (isMachineGroup) {
      // Handle machine-specific parameters
      // Since the API groups are already unit-specific, we need to determine which machines to associate
      const machineType = isChillerGroup ? 'CHILLER' : 'COOLING_TOWER';
      const relevantMachines =
        allProjectMachines?.filter(m => m.type === machineType) || [];

      if (relevantMachines.length === 0) {
        throw new AppError({
          status: 400,
          message: `No ${machineType
            .toLowerCase()
            .replace('_', ' ')} machines found in this project.`,
          isExpose: true,
        });
      }

      // For each relevant machine, create log sheet details
      for (const machine of relevantMachines) {
        for (const member of group.members) {
          const param = member.parameter;
          const value = (groupData as Record<string, unknown>)[param.id];
          if (value !== undefined && value !== null) {
            logSheetDetails.push({
              logSheetId: newLogSheet.id,
              machineId: machine.id,
              parameterId: param.id,
              groupId: group.id,
              valueType: param.valueType,
              numericValue:
                param.valueType === 'NUMBER' ? Number(value) : undefined,
              boolValue:
                param.valueType === 'BOOLEAN' ? Boolean(value) : undefined,
              textValue: param.valueType === 'TEXT' ? String(value) : undefined,
            });
          }
        }
      }
    } else {
      // Handle general parameters (non-machine-specific)
      for (const member of group.members) {
        const param = member.parameter;
        const value = (groupData as Record<string, unknown>)[param.id];
        if (value !== undefined && value !== null) {
          logSheetDetails.push({
            logSheetId: newLogSheet.id,
            parameterId: param.id,
            groupId: group.id,
            valueType: param.valueType,
            numericValue:
              param.valueType === 'NUMBER' ? Number(value) : undefined,
            boolValue:
              param.valueType === 'BOOLEAN' ? Boolean(value) : undefined,
            textValue: param.valueType === 'TEXT' ? String(value) : undefined,
          });
        }
      }
    }
  }

  // TODO: Implement chemical usage creation
  // The ChemicalUsage model requires machineId and dosage fields
  // This needs to be implemented based on business logic for which machine the chemical is used for
  if (data.chemicalUsageData && data.chemicalUsageData.length > 0) {
    // For now, we'll skip chemical usage creation until the business logic is clarified
    console.log(
      'Chemical usage data received but not processed:',
      data.chemicalUsageData
    );
  }

  try {
    if (logSheetDetails.length > 0) {
      await tx?.logSheetDetail.createMany({
        data: logSheetDetails,
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
    return logSheets;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching log sheets',
      status: 500,
    });
  }
}

export async function fetchLogSheetByIdService(id: string) {
  try {
    const whereClause: Prisma.LogSheetWhereUniqueInput = {
      id,
      deletedAt: null,
    };
    const logSheet = await prisma.logSheet.findUnique({
      where: whereClause,
      select: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        date: true,
        notes: true,
        logSheetHistories: {
          select: {
            status: true,
            createdAt: true,
          },
        },
        details: {
          select: {
            parameter: {
              select: {
                id: true,
                name: true,
                valueType: true,
                unit: true,
                description: true,
              },
            },
            machine: {
              select: {
                id: true,
                unitNumber: true,
                type: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            valueType: true,
            numericValue: true,
            boolValue: true,
            textValue: true,
          },
        },
      },
    });

    if (!logSheet) {
      throw new AppError({
        status: 404,
        message: 'Log sheet not found.',
        isExpose: true,
      });
    }

    const machines = await prisma.machine.findMany({
      where: {
        deletedAt: null,
        projectId: logSheet.project.id,
      },
      select: {
        type: true,
      },
    });

    const transformedDetails = logSheet.details.reduce((acc, detail) => {
      const groupKey = detail.group.id;
      const unitNumber = detail.machine?.unitNumber || 'general'; // 'general' for non-machine parameters

      if (!acc.has(groupKey)) {
        acc.set(groupKey, {
          groupInfo: {
            id: detail.group.id,
            name: detail.group.name,
          },
          units: new Map(),
        });
      }

      const group = acc.get(groupKey);

      if (!group.units.has(unitNumber)) {
        group.units.set(unitNumber, {
          unitInfo: detail.machine
            ? {
                id: detail.machine.id,
                unitNumber: detail.machine.unitNumber,
                type: detail.machine.type,
              }
            : null,
          parameters: [],
        });
      }

      const unit = group.units.get(unitNumber);
      unit.parameters.push({
        id: detail.parameter.id,
        name: detail.parameter.name,
        valueType: detail.parameter.valueType,
        unit: detail.parameter.unit,
        description: detail.parameter.description,
        value:
          detail.valueType === 'NUMBER'
            ? detail.numericValue
            : detail.valueType === 'BOOLEAN'
              ? detail.boolValue
              : detail.textValue,
      });

      return acc;
    }, new Map());

    // Convert nested Maps to arrays for JSON serialization
    const groupedDetails = Array.from(transformedDetails.values()).map(
      group => ({
        groupInfo: group.groupInfo,
        units: Array.from(group.units.values()),
      })
    );

    return {
      ...logSheet,
      chillerCount: machines.filter(m => m.type === 'CHILLER').length,
      coolingTowerCount: machines.filter(m => m.type === 'COOLING_TOWER')
        .length,
      details: groupedDetails,
    };
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching log sheet',
      status: 500,
    });
  }
}
