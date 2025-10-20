'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { logSheetSchema } from '../schemas/logSheetSchema';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { useMemo } from 'react';
import { IProject } from '@/types/project.type';
import { IAccordionDataFormatted } from '@/components/features/forms/default-form';
import { valueLogSheetFormFieldGenerator } from '../data/logSheetFormFields';
import { ValueType } from '@/features/api/generated/prisma';

interface ILogSheetsFormProps {
  projectData: IProject | null;
  refetch?: () => void;
}

export default function LogSheetsForm({
  projectData,
  refetch = () => {},
}: ILogSheetsFormProps) {
  const chillerCount = projectData?.chillers?.length ?? 0;
  const coolingTowerCount = projectData?.coolingTowers?.length ?? 0;

  const logSheetForm = useForm({
    resolver: zodResolver(
      logSheetSchema({
        chillerTotalUnit: chillerCount,
        coolingTowerTotalUnit: coolingTowerCount,
      })
    ),
    defaultValues: {
      notes: '',
      condenserData: [],
      evaporatorData: [],
      coolingTowerWaterQualityData: [],
      rawWaterQualityData: {
        pH: 0,
        TDS: 0,
        conductivity: 0,
        cycle: 0,
        notes: '',
      },
      coolingTowerGeneralConditionData: [],
      coolingTowerJobData: [],
      waterMeterConsumptionData: {
        before: 0,
        after: 0,
        totalConsumption: 0,
      },
      chemicalUsageData: [],
    },
  });

  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: logSheetForm,
    apiUrl: '/log-sheets',
    refetch,
  });

  const accordionData = useMemo((): IAccordionDataFormatted[] => {
    const data: IAccordionDataFormatted[] = [];

    // If no project data, show a loading section
    if (!projectData) {
      data.push({
        type: 'single',
        title: 'Loading Project Data...',
        value: 'loading',
        fields: [],
      });
      return data;
    }

    // Chillers Section
    if (projectData.chillers.length > 0) {
      data.push({
        title: 'Chillers',
        value: 'chillers',
        description: `Isi data untuk ${projectData.chillers.length} unit chiller`,
        fields: [],
        children: projectData.chillers.map((chiller, index) => ({
          title: `Chiller Unit ${index + 1}`,
          value: `chiller-${index}`,
          fields: [
            // Condenser Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${index}].tempIn`,
              label: 'Condenser Temp In (°C)',
              description: 'Temperature input for condenser unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${index}].tempOut`,
              label: 'Condenser Temp Out (°C)',
              description: 'Temperature output for condenser unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${index}].saturatedTemp`,
              label: 'Condenser Saturated Temp (°C)',
              description: 'Saturated temperature for condenser',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${index}].approachTemp`,
              label: 'Condenser Approach Temp (°C)',
              description: 'Approach temperature for condenser',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${index}].loadDemand`,
              label: 'Condenser Load Demand (%)',
              description: 'Load demand percentage (0-100)',
            }),

            // Evaporator Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${index}].tempIn`,
              label: 'Evaporator Temp In (°C)',
              description: 'Temperature input for evaporator unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${index}].tempOut`,
              label: 'Evaporator Temp Out (°C)',
              description: 'Temperature output for evaporator unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${index}].saturatedTemp`,
              label: 'Evaporator Saturated Temp (°C)',
              description: 'Saturated temperature for evaporator',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${index}].approachTemp`,
              label: 'Evaporator Approach Temp (°C)',
              description: 'Approach temperature for evaporator',
            }),
          ].filter(
            (field): field is NonNullable<typeof field> => field !== null
          ),
        })),
      });
    }

    // Cooling Towers Section
    if (projectData.coolingTowers.length > 0) {
      data.push({
        title: 'Cooling Towers',
        value: 'cooling-towers',
        description: `Configure data for ${projectData.coolingTowers.length} cooling tower unit(s)`,
        fields: [],
        children: projectData.coolingTowers.map((tower, index) => ({
          title: `Cooling Tower ${index + 1}`,
          value: `cooling-tower-${index}`,
          fields: [
            // Water Quality Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${index}].pH`,
              label: 'pH Level',
              description: 'pH level measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${index}].TDS`,
              label: 'TDS (ppm)',
              description: 'Total Dissolved Solids measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${index}].conductivity`,
              label: 'Conductivity (µS/cm)',
              description: 'Electrical conductivity measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${index}].cycle`,
              label: 'Cycle Count',
              description: 'Number of cycles completed',
            }),

            // General Condition Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${index}].runningStatus`,
              label: 'Running Status',
              description: 'Current operational status',
              customBooleanSelect: {
                trueLabel: 'Running',
                falseLabel: 'Stopped',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${index}].algae`,
              label: 'Algae Presence',
              description: 'Presence of algae',
              customBooleanSelect: {
                trueLabel: 'Present',
                falseLabel: 'Absent',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${index}].deposit`,
              label: 'Deposit Presence',
              description: 'Presence of mineral deposits',
              customBooleanSelect: {
                trueLabel: 'Present',
                falseLabel: 'Absent',
              },
            }),

            // Job Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${index}].hotBasinCleaning`,
              label: 'Hot Basin Cleaning',
              description: 'Hot basin cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${index}].coldBasinCleaning`,
              label: 'Cold Basin Cleaning',
              description: 'Cold basin cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${index}].fillerCleaning`,
              label: 'Filler Cleaning',
              description: 'Filler cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${index}].areaCleaning`,
              label: 'Area Cleaning',
              description: 'General area cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
          ].filter(Boolean) as any[],
        })),
      });
    }

    // Additional Data Section
    data.push({
      title: 'Additional Data',
      value: 'additional-data',
      description: 'Additional measurements and notes',
      fields: [
        // Raw Water Quality Data
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'rawWaterQualityData.pH',
          label: 'Raw Water pH Level',
          description: 'pH level measurement for raw water',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'rawWaterQualityData.TDS',
          label: 'Raw Water TDS (ppm)',
          description: 'Total Dissolved Solids for raw water',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'rawWaterQualityData.conductivity',
          label: 'Raw Water Conductivity (µS/cm)',
          description: 'Electrical conductivity for raw water',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'rawWaterQualityData.cycle',
          label: 'Raw Water Cycle Count',
          description: 'Number of cycles for raw water',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.TEXT,
          name: 'rawWaterQualityData.notes',
          label: 'Raw Water Notes',
          description: 'Additional notes for raw water quality',
        }),

        // Water Meter Consumption Data
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'waterMeterConsumptionData.before',
          label: 'Water Meter Before (m³)',
          description: 'Water meter reading before operations',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'waterMeterConsumptionData.after',
          label: 'Water Meter After (m³)',
          description: 'Water meter reading after operations',
        }),
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.NUMBER,
          name: 'waterMeterConsumptionData.totalConsumption',
          label: 'Total Consumption (m³)',
          description: 'Calculated total water consumption',
        }),

        // Notes
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.TEXT,
          name: 'notes',
          label: 'General Notes',
          description: 'Additional general notes for this log sheet',
        }),
      ].filter(Boolean) as any[],
    });

    return data;
  }, [chillerCount, coolingTowerCount, projectData]);

  return (
    <DefaultForm
      form={logSheetForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFieldSelector={{
        type: 'accordion',
        accordions: accordionData,
      }}
      validationSchema={logSheetSchema({
        chillerTotalUnit: chillerCount,
        coolingTowerTotalUnit: coolingTowerCount,
      })}
      isLoading={isLoading}
    />
  );
}
