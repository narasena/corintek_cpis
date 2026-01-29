'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { logSheetSchema } from '../schemas/logSheetSchema';
import { createDynamicLogSheetSchema } from '../schemas/dynamicLogSheetSchema';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { IProject } from '@/types/project.type';
import { IAccordionDataFormatted } from '@/components/features/forms/default-form';
import {
  EFieldType,
  IFormFieldBasic,
  IFormFields,
} from '@/types/form/form.type';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import useAllChemicals from '@/hooks/chemicals/useAllChemicals';
import useLogSheetSchemaParameters from '../hooks/useLogSheetSchemaParameters';
import { IGroupParameterByType } from '@/types/parameter.type';
import { cn } from '@/lib/utils';
import { ValueType } from '@/features/api/generated/prisma/enums';
import { IChemicalUsageData, ParameterValue } from '@/types/log-sheet.type';

interface ILogSheetsFormProps {
  projectData: IProject | null;
  refetch?: () => void;
}

const parameterToFormField = (
  param: {
    id: string;
    name: string;
    valueType: string;
    unit?: string | null;
    description?: string | null;
  },
  group: IGroupParameterByType
): IFormFields | null => {
  // Since API groups are already unit-specific, we don't need unit indexing
  const name = `${group.id}.${param.id}`;

  const baseField = {
    name,
    label: param.name + (param.unit ? ` (${param.unit})` : ''),
    description: param.description || undefined,
    className: 'col-span-2',
  };

  switch (param.valueType) {
    case ValueType.NUMBER:
      return {
        ...baseField,
        type: EFieldType.NUMBER,
        placeHolder: '0',
      };
    case ValueType.BOOLEAN:
      return {
        ...baseField,
        type: EFieldType.SELECT,
        selectData: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      };
    case ValueType.TEXT:
      return {
        ...baseField,
        type: EFieldType.TEXTAREA,
        placeHolder: 'Enter notes...',
      };
    default:
      return null;
  }
};

export default function LogSheetsForm({
  projectData,
  refetch = () => {},
}: ILogSheetsFormProps) {
  const { logSheetSchemaParameters, isLoadingData } =
    useLogSheetSchemaParameters();
  const { allChemicals } = useAllChemicals();
  const chillerCount = projectData?.chillers?.length ?? 0;
  const coolingTowerCount = projectData?.coolingTowers?.length ?? 0;
  const [chemicalUsageForms, setChemicalUsageForms] = useState<number[]>([]);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [selectedChillers, setSelectedChillers] = useState<number[]>([]);
  const [selectedCoolingTowers, setSelectedCoolingTowers] = useState<number[]>(
    []
  );

  // Create dynamic schema based on parameter groups
  const dynamicSchema = useMemo(() => {
    if (logSheetSchemaParameters.length === 0) {
      return logSheetSchema({
        chillerTotalUnit: chillerCount,
        coolingTowerTotalUnit: coolingTowerCount,
      });
    }
    return createDynamicLogSheetSchema(logSheetSchemaParameters);
  }, [logSheetSchemaParameters, chillerCount, coolingTowerCount]);

  const logSheetForm = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
      notes: '',
      chemicalUsageData: [],
    },
  });

  const chemicalUsageData = useWatch({
    control: logSheetForm.control,
    name: 'chemicalUsageData',
  });

  // Reset form when schema changes
  useEffect(() => {
    logSheetForm.reset({
      date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
      notes: '',
      chemicalUsageData: [],
    });
  }, [dynamicSchema, logSheetForm]);

  // Initialize default values for parameter groups
  useEffect(() => {
    if (logSheetSchemaParameters.length > 0) {
      const newDefaultValues: Record<string, unknown> = {
        date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
        notes: '',
        chemicalUsageData: [],
      };

      logSheetSchemaParameters.forEach(group => {
        // For all groups, create flat structure since the API groups are already unit-specific
        if (!newDefaultValues[group.id]) {
          newDefaultValues[group.id] = {};
        }

        (group.members || []).forEach(member => {
          const param = member.parameter;
          const groupData = newDefaultValues[group.id] as Record<
            string,
            unknown
          >;
          if (groupData[param.id] === undefined) {
            let defaultValue: ParameterValue;
            switch (param.valueType) {
              case ValueType.NUMBER:
                defaultValue = 0;
                break;
              case ValueType.BOOLEAN:
                defaultValue = false;
                break;
              case ValueType.TEXT:
                defaultValue = '';
                break;
              default:
                defaultValue = null;
            }
            groupData[param.id] = defaultValue;
          }
        });
      });
      logSheetForm.reset(newDefaultValues);
    }
  }, [logSheetSchemaParameters, logSheetForm]);

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
      const currentChemical =
        (logSheetForm.getValues('chemicalUsageData') as IChemicalUsageData[]) ||
        [];
      const arrayIndex = chemicalUsageForms.findIndex(id => id === formIndex);
      if (arrayIndex !== -1) {
        currentChemical.splice(arrayIndex, 1);
        logSheetForm.setValue('chemicalUsageData', currentChemical);
      }
    },
    [chemicalUsageForms, logSheetForm]
  );

  const chemicalAccordions = useMemo((): IAccordionDataFormatted[] => {
    const selectedChemicalIds = (
      (chemicalUsageData as IChemicalUsageData[]) || []
    )
      .map((chemical: IChemicalUsageData) => chemical?.id)
      .filter(Boolean);

    return chemicalUsageForms.map((formIndex, displayIndex) => ({
      title: (
        <div className="flex items-center justify-between w-full">
          <span>Bahan Kimia / Chemical {displayIndex + 1}</span>
          <div
            role="button"
            aria-label="Remove chemical"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              removeChemicalForm(formIndex);
            }}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-6 w-6 p-0 text-red-600 hover:text-red-800 bg-white'
            )}
          >
            <IconTrash className="h-3 w-3" />
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
          selectData: (allChemicals || []).map(chemical => {
            const currentSelection =
              ((chemicalUsageData as IChemicalUsageData[]) || [])[displayIndex]
                ?.id;
            const isSelected =
              selectedChemicalIds.includes(chemical.id as string) &&
              chemical.id !== currentSelection;

            return {
              label: (
                chemical.code +
                ' - ' +
                chemical.name +
                ` [${chemical.type}]` +
                (isSelected ? ' (Already Selected)' : '')
              ).trim(),
              value: chemical.id,
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
  }, [chemicalUsageForms, allChemicals, removeChemicalForm, chemicalUsageData]);

  const chemicalSection = useMemo(
    (): IAccordionDataFormatted => ({
      title: (
        <div className="flex items-center justify-between w-full">
          <span>Bahan Kimia/ Chemical ({chemicalUsageForms.length})</span>
          <div
            role="button"
            aria-label="Tambah Chemical"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              addChemicalForm();
            }}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'flex items-center gap-2'
            )}
          >
            <IconPlus className="h-4 w-4" />
            <span>Tambah Chemical</span>
          </div>
        </div>
      ),
      value: 'chemical-usage-data',
      fields: [],
      children: chemicalAccordions,
    }),
    [chemicalUsageForms.length, chemicalAccordions, addChemicalForm]
  );

  // Helper function to generate chiller form children
  const getChillerFormChildren = useMemo((): IAccordionDataFormatted[] => {
    if (selectedChillers.length === 0) return [];

    // Determine chiller-specific groups
    const chillerGroups: IGroupParameterByType[] = [];
    logSheetSchemaParameters.forEach(group => {
      const groupNameLower = group.name.toLowerCase();
      if (
        groupNameLower.includes('unit evaporator') ||
        groupNameLower.includes('unit condensor') ||
        groupNameLower.includes('unit condenser') ||
        (groupNameLower.includes('chiller') &&
          !groupNameLower.includes('cooling') &&
          !groupNameLower.includes('tower'))
      ) {
        chillerGroups.push(group);
      }
    });

    const chillerFields: IFormFields[] = [];

    chillerGroups.forEach(group => {
      // Add separator for each parameter group
      chillerFields.push({
        name: `separator-${group.id}`,
        type: EFieldType.SEPARATOR,
        label: group.name,
        className: 'col-span-4 mt-4 mb-2',
      });

      // Add all fields for this parameter group
      const groupFields = (group.members || [])
        .map(member => parameterToFormField(member.parameter, group))
        .filter((field): field is NonNullable<typeof field> => field !== null);

      chillerFields.push(...groupFields);
    });

    return [
      {
        title: `Chiller Units (${selectedChillers.join(', ')})`,
        value: `chiller-units`,
        description: `Parameters for selected chiller units: ${selectedChillers.join(', ')}`,
        fields: chillerFields,
      },
    ];
  }, [selectedChillers, logSheetSchemaParameters]);

  // Helper function to generate cooling tower form children
  const getCoolingTowerFormChildren = useMemo((): IAccordionDataFormatted[] => {
    if (selectedCoolingTowers.length === 0) return [];

    // Determine cooling tower-specific groups
    const coolingTowerGroups: IGroupParameterByType[] = [];
    logSheetSchemaParameters.forEach(group => {
      const groupNameLower = group.name.toLowerCase();
      if (
        groupNameLower.includes('cooling tower') ||
        (groupNameLower.includes('tower') &&
          !groupNameLower.includes('unit')) ||
        groupNameLower.includes('general condition') ||
        groupNameLower.includes('job description')
      ) {
        coolingTowerGroups.push(group);
      }
    });

    const coolingTowerFields: IFormFields[] = [];

    coolingTowerGroups.forEach(group => {
      // Add separator for each parameter group
      coolingTowerFields.push({
        name: `separator-${group.id}`,
        type: EFieldType.SEPARATOR,
        label: group.name,
        className: 'col-span-4 mt-4 mb-2',
      });

      // Add all fields for this parameter group
      const groupFields = (group.members || [])
        .map(member => parameterToFormField(member.parameter, group))
        .filter((field): field is NonNullable<typeof field> => field !== null);

      coolingTowerFields.push(...groupFields);
    });

    return [
      {
        title: `Cooling Tower Units (${selectedCoolingTowers.join(', ')})`,
        value: `cooling-tower-units`,
        description: `Parameters for selected cooling tower units: ${selectedCoolingTowers.join(', ')}`,
        fields: coolingTowerFields,
      },
    ];
  }, [selectedCoolingTowers, logSheetSchemaParameters]);

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

    if (!projectData || isLoadingData) {
      data.push({
        title: 'Loading Project Data...',
        value: 'loading',
        fields: [],
      });
      return data;
    }

    // Add date field at the beginning
    data.push({
      title: 'Log Sheet Information',
      value: 'log-sheet-info',
      description: 'Basic information for the log sheet',
      fields: [
        {
          name: 'date',
          type: EFieldType.DATE,
          label: 'Log Sheet Date',
          className: 'col-span-2',
          description:
            'Select the date for this log sheet entry. You can backdate entries if needed.',
        },
        {
          name: 'notes',
          type: EFieldType.TEXTAREA,
          label: 'Notes',
          className: 'col-span-2',
          placeHolder: 'Enter any additional notes...',
          description: 'Optional notes for this log sheet',
        },
      ] as IFormFields[],
    });

    if (projectData.chillers.length > 0) {
      data.push({
        title: `Unit Selection - Chillers${selectedChillers.length > 0 ? ` (${selectedChillers.length})` : ''}`,
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
        children: getChillerFormChildren,
      });
    }

    if (projectData.coolingTowers.length > 0) {
      data.push({
        title: `Unit Selection - Cooling Towers${selectedCoolingTowers.length > 0 ? ` (${selectedCoolingTowers.length})` : ''}`,
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
        children: getCoolingTowerFormChildren,
      });
    }

    // Add general parameter groups (non-unit-specific)
    const generalGroups: IGroupParameterByType[] = [];
    logSheetSchemaParameters.forEach(group => {
      const groupNameLower = group.name.toLowerCase();
      // Only include groups that are not unit-specific
      if (
        !groupNameLower.includes('unit evaporator') &&
        !groupNameLower.includes('unit condensor') &&
        !groupNameLower.includes('unit condenser') &&
        !groupNameLower.includes('cooling tower') &&
        !groupNameLower.includes('general condition') &&
        !groupNameLower.includes('job description') &&
        !(
          groupNameLower.includes('chiller') &&
          !groupNameLower.includes('cooling') &&
          !groupNameLower.includes('tower')
        ) &&
        !(groupNameLower.includes('tower') && !groupNameLower.includes('unit'))
      ) {
        generalGroups.push(group);
      }
    });

    generalGroups.forEach(group => {
      data.push({
        title: group.name,
        value: group.id,
        description: group.description || undefined,
        fields: (group.members || [])
          .map(member => parameterToFormField(member.parameter, group))
          .filter(
            (field): field is NonNullable<typeof field> => field !== null
          ),
      });
    });

    data.push(chemicalSection);

    return data;
  }, [
    projectData,
    isLoadingData,
    logSheetSchemaParameters,
    chemicalSection,
    getChillerFormChildren,
    getCoolingTowerFormChildren,
    selectedChillers,
    selectedCoolingTowers,
  ]);

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
      validationSchema={dynamicSchema}
      isLoading={isLoading}
    />
  );
}
