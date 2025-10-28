'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { logSheetSchema } from '../schemas/logSheetSchema';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { useMemo, useState, useCallback } from 'react';
import { IProject } from '@/types/project.type';
import { IAccordionDataFormatted } from '@/components/features/forms/default-form';
import { valueLogSheetFormFieldGenerator } from '../data/logSheetFormFields';
import { ValueType } from '@/features/api/generated/prisma';
import {
  EFieldType,
  IFormFieldBasic,
  IFormFields,
} from '@/types/form/form.type';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import useAllChemicals from '@/hooks/chemicals/useAllChemicals';
import { UniqueIdentifier } from '@dnd-kit/core';

interface ILogSheetsFormProps {
  projectData: IProject | null;
  refetch?: () => void;
}

export default function LogSheetsForm({
  projectData,
  refetch = () => {},
}: ILogSheetsFormProps) {
  const { allChemicals } = useAllChemicals();
  const chillerCount = projectData?.chillers?.length ?? 0;
  const coolingTowerCount = projectData?.coolingTowers?.length ?? 0;
  const [chemicalUsageForms, setChemicalUsageForms] = useState<number[]>([]);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [selectedChillers, setSelectedChillers] = useState<number[]>([]); // Now stores unitNumbers
  const [selectedCoolingTowers, setSelectedCoolingTowers] = useState<number[]>(
    []
  ); // Now stores unitNumbers

  const logSheetForm = useForm({
    resolver: zodResolver(
      logSheetSchema({
        chillerTotalUnit: chillerCount,
        coolingTowerTotalUnit: coolingTowerCount,
      })
    ),
    defaultValues: {
      date: new Date(),
      notes: '',
      condenserData: {},
      evaporatorData: {},
      coolingTowerWaterQualityData: {},
      rawWaterQualityData: {
        pH: 0,
        TDS: 0,
        conductivity: 0,
        cycle: 0,
        notes: '',
      },
      coolingTowerGeneralConditionData: {},
      coolingTowerJobData: {},
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
    apiUrl: `/projects/${projectData?.id}/log-sheets`,
    refetch,
  });

  const addChemicalForm = useCallback(() => {
    const nextId =
      chemicalUsageForms.length === 0 ? 0 : Math.max(...chemicalUsageForms) + 1;
    setChemicalUsageForms(prev => [...prev, nextId]);
  }, [chemicalUsageForms]);

  const removeChemicalForm = useCallback(
    (formIndex: number) => {
      setChemicalUsageForms(prev => prev.filter(id => id !== formIndex));
      const currentChemical = logSheetForm.getValues('chemicalUsageData') || [];
      const arrayIndex = chemicalUsageForms.findIndex(id => id === formIndex);
      if (arrayIndex !== -1) {
        currentChemical.splice(arrayIndex, 1);
        logSheetForm.setValue('chemicalUsageData', currentChemical);
      }
    },
    [chemicalUsageForms, logSheetForm]
  );

  const chemicalAccordions = useMemo((): IAccordionDataFormatted[] => {
    // Get already selected chemical IDs
    const chemicalUsageData = logSheetForm.getValues('chemicalUsageData') || [];
    const selectedChemicalIds = chemicalUsageData
      .map(
        (chemical: { id: UniqueIdentifier; quantity: number }) => chemical?.id
      )
      .filter(Boolean);

    return chemicalUsageForms.map((formIndex, displayIndex) => ({
      title: (
        <div className="flex items-center justify-between w-full">
          <span>Bahan Kimia / Chemical {displayIndex + 1}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                removeChemicalForm(formIndex);
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800 bg-white"
            >
              <IconTrash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
      value: `chemical-usage-data-${formIndex}`,
      description: 'Chemical usage data',
      fields: [
        {
          name: `chemicalUsageData.${displayIndex}.id`,
          type: EFieldType.SELECT,
          label: 'Bahan Kimia',
          className: 'col-span-2',
          placeHolder: '',
          description: 'Nama Bahan Kimia',
          selectData: (allChemicals || []).map(chemicalData => {
            const currentSelection = chemicalUsageData[displayIndex]?.id;
            const isSelected =
              selectedChemicalIds.includes(chemicalData.id as string) &&
              chemicalData.id !== currentSelection;

            return {
              label: (
                chemicalData.code +
                ' - ' +
                chemicalData.name +
                ` [${chemicalData.type}]` +
                (isSelected ? ' (Already Selected)' : '')
              ).trim(),
              value: chemicalData.id,
              disabled: isSelected,
            };
          }),
        },
        {
          name: `chemicalUsageData.${displayIndex}.quantity`,
          icon: undefined,
          type: EFieldType.NUMBER,
          label: 'Jumlah',
          className: 'col-span-2',
          placeHolder: '0',
          description: 'Jumlah Bahan Kimia',
        },
      ] as IFormFields[],
    }));
  }, [chemicalUsageForms, allChemicals, removeChemicalForm, logSheetForm]);

  const chemicalSection = useMemo(
    (): IAccordionDataFormatted => ({
      title: (
        <div className="flex items-center justify-between w-full">
          <span>Bahan Kimia/ Chemical ({chemicalUsageForms.length})</span>
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              addChemicalForm();
            }}
            className="flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            <span>Tambah Chemical</span>
          </Button>
        </div>
      ),
      value: 'chemical-usage-data',
      fields: [],
      children: chemicalAccordions,
    }),
    [chemicalUsageForms.length, chemicalAccordions, addChemicalForm]
  );

  const getAccordionData = useMemo((): IAccordionDataFormatted[] => {
    const data: IAccordionDataFormatted[] = [];

    // Date Selection Section - Always at the top
    data.push({
      title: 'Pilih tanggal log-sheet:',
      value: 'date-selection',
      fields: [
        {
          name: 'date',
          type: EFieldType.DATE,
          label: 'Tanggal',
          className: 'col-span-2',
          description: 'Pilih tanggal untuk log sheet ini',
        } as IFormFieldBasic,
      ],
    });

    // If no project data, show a loading section
    if (!projectData) {
      data.push({
        title: 'Loading Project Data...',
        value: 'loading',
        fields: [],
      });
      return data;
    }

    // Chillers Section
    if (projectData.chillers.length > 0) {
      data.push({
        title: 'Unit Selection - Chillers',
        value: 'chiller-selection',
        description: (
          <div className="space-y-2">
            <p>Select which chiller units to include in this log sheet:</p>
            <div className="grid grid-cols-3 gap-2">
              {projectData.chillers.map(chiller => (
                <label
                  key={chiller.unitNumber}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedChillers.includes(chiller.unitNumber)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedChillers(prev => [
                          ...prev,
                          chiller.unitNumber,
                        ]);
                      } else {
                        setSelectedChillers(prev =>
                          prev.filter(i => i !== chiller.unitNumber)
                        );
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    Chiller Unit {chiller.unitNumber}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ),
        fields: [],
      });

      // Add individual chiller forms directly
      selectedChillers.forEach(unitNumber => {
        data.push({
          title: `Chiller Unit ${unitNumber}`,
          value: `chiller-${unitNumber}`,
          fields: [
            {
              name: `separator-${unitNumber}`,
              label: 'Unit Condenser',
              type: EFieldType.SEPARATOR,
              className: 'col-span-2',
            } as IFormFieldBasic,
            // Condenser Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${unitNumber}].tempIn`,
              label: 'Temp In (°C)',
              description: 'Temperature input for condenser unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${unitNumber}].tempOut`,
              label: 'Temp Out (°C)',
              description: 'Temperature output for condenser unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${unitNumber}].saturatedTemp`,
              label: 'Saturated Temp (°C)',
              description: 'Saturated temperature for condenser',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${unitNumber}].approachTemp`,
              label: 'Approach Temp (°C)',
              description: 'Approach temperature for condenser',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `condenserData[${unitNumber}].loadDemand`,
              label: 'Load Demand (%)',
              description: 'Load demand percentage (0-100)',
            }),
            {
              name: `separator-${unitNumber}`,
              label: 'Unit Evaporator',
              type: EFieldType.SEPARATOR,
              className: 'col-span-2',
            } as IFormFieldBasic,
            // Evaporator Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${unitNumber}].tempIn`,
              label: 'Temp In (°C)',
              description: 'Temperature input for evaporator unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${unitNumber}].tempOut`,
              label: 'Temp Out (°C)',
              description: 'Temperature output for evaporator unit',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${unitNumber}].saturatedTemp`,
              label: 'Saturated Temp (°C)',
              description: 'Saturated temperature for evaporator',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `evaporatorData[${unitNumber}].approachTemp`,
              label: 'Approach Temp (°C)',
              description: 'Approach temperature for evaporator',
            }),
          ].filter(
            (field): field is NonNullable<typeof field> => field !== null
          ),
        });
      });
    }

    // Cooling Towers Section
    if (projectData.coolingTowers.length > 0) {
      data.push({
        title: 'Unit Selection - Cooling Towers',
        value: 'cooling-tower-selection',
        description: (
          <div className="space-y-2">
            <p>
              Select which cooling tower units to include in this log sheet:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {projectData.coolingTowers.map(tower => (
                <label
                  key={tower.unitNumber}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCoolingTowers.includes(tower.unitNumber)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedCoolingTowers(prev => [
                          ...prev,
                          tower.unitNumber,
                        ]);
                      } else {
                        setSelectedCoolingTowers(prev =>
                          prev.filter(i => i !== tower.unitNumber)
                        );
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    Cooling Tower Unit {tower.unitNumber}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ),
        fields: [],
      });

      // Add individual cooling tower forms directly
      selectedCoolingTowers.forEach(unitNumber => {
        data.push({
          title: `Cooling Tower Unit ${unitNumber}`,
          value: `cooling-tower-${unitNumber}`,
          fields: [
            {
              name: `separator-${unitNumber}`,
              label: 'Water Quality',
              type: EFieldType.SEPARATOR,
              className: 'col-span-2',
            } as IFormFieldBasic,
            // Water Quality Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${unitNumber}].pH`,
              label: 'pH Level',
              description: 'pH level measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${unitNumber}].TDS`,
              label: 'TDS (ppm)',
              description: 'Total Dissolved Solids measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${unitNumber}].conductivity`,
              label: 'Conductivity (µS/cm)',
              description: 'Electrical conductivity measurement',
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.NUMBER,
              name: `coolingTowerWaterQualityData[${unitNumber}].cycle`,
              label: 'Cycle Count',
              description: 'Number of cycles completed',
            }),
            {
              name: `separator-${unitNumber}`,
              label: 'General Condition',
              type: EFieldType.SEPARATOR,
              className: 'col-span-2',
            } as IFormFieldBasic,
            // General Condition Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${unitNumber}].runningStatus`,
              label: 'Running Status',
              description: 'Current operational status',
              customBooleanSelect: {
                trueLabel: 'Running',
                falseLabel: 'Stopped',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${unitNumber}].algae`,
              label: 'Algae Presence',
              description: 'Presence of algae',
              customBooleanSelect: {
                trueLabel: 'Present',
                falseLabel: 'Absent',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerGeneralConditionData[${unitNumber}].deposit`,
              label: 'Deposit Presence',
              description: 'Presence of mineral deposits',
              customBooleanSelect: {
                trueLabel: 'Present',
                falseLabel: 'Absent',
              },
            }),
            {
              name: `separator-${unitNumber}`,
              label: 'Jobs',
              type: EFieldType.SEPARATOR,
              className: 'col-span-2',
            } as IFormFieldBasic,
            // Job Data
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${unitNumber}].hotBasinCleaning`,
              label: 'Hot Basin Cleaning',
              description: 'Hot basin cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${unitNumber}].coldBasinCleaning`,
              label: 'Cold Basin Cleaning',
              description: 'Cold basin cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${unitNumber}].fillerCleaning`,
              label: 'Filler Cleaning',
              description: 'Filler cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
            valueLogSheetFormFieldGenerator({
              valueType: ValueType.BOOLEAN,
              name: `coolingTowerJobData[${unitNumber}].areaCleaning`,
              label: 'Area Cleaning',
              description: 'General area cleaning performed',
              customBooleanSelect: {
                trueLabel: 'Done',
                falseLabel: 'Not Done',
              },
            }),
          ].filter(Boolean) as any[],
        });
      });
    }

    // Additional Data Section
    data.push({
      title: 'Additional Data',
      value: 'additional-data',
      description: 'Additional measurements and notes',
      fields: [
        {
          name: `separator-additional-data`,
          label: 'Raw Water Quality',
          type: EFieldType.SEPARATOR,
          className: 'col-span-2',
        } as IFormFieldBasic,
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
        {
          name: `separator-additional-data`,
          label: 'Water Meter',
          type: EFieldType.SEPARATOR,
          className: 'col-span-2',
        } as IFormFieldBasic,
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
        {
          name: `separator-additional-data`,
          label: 'Notes',
          type: EFieldType.SEPARATOR,
          className: 'col-span-2',
        } as IFormFieldBasic,
        // Notes
        valueLogSheetFormFieldGenerator({
          valueType: ValueType.TEXT,
          textType: EFieldType.TEXTAREA,
          className: 'col-span-2',
          name: 'notes',
          label: 'General Notes',
          description: 'Additional general notes for this log sheet',
        }),
      ].filter(Boolean) as any[],
    });

    data.push(chemicalSection);

    return data;
  }, [projectData, chemicalSection, selectedChillers, selectedCoolingTowers]);

  return (
    <DefaultForm
      form={logSheetForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFieldSelector={{
        type: 'accordion',
        accordions: getAccordionData,
        value: accordionValue,
        onValueChange: value => setAccordionValue(value as string[]),
      }}
      validationSchema={logSheetSchema({
        chillerTotalUnit: chillerCount,
        coolingTowerTotalUnit: coolingTowerCount,
      })}
      isLoading={isLoading}
    />
  );
}
