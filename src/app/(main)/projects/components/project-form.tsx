import React, { useCallback, useMemo, useState } from 'react';
import { TProjectCreationAttributes } from '@/types/project.type';
import { projectCreationSchema } from '../schemas/projectSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreationFormFields } from '../data/projectFormFields';
import { machineFormFields } from '../data/machineFormFields';
import DefaultForm, {
  IAccordionDataFormatted,
} from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import useAllPersonnel from '@/hooks/users/useAllPersonnel';
import useAllClients from '@/hooks/clients/useAllClients';
import useClientPersonnel from '@/hooks/clients/useClientPersonnel';
import useProjectsByClient from '@/hooks/projects/useProjectsByClient';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { MachineType } from '@/features/api/generated/prisma/enums';
import { IDefaultFormComponentProps } from '@/types/form/form.type';

interface IProjectFormProps extends IDefaultFormComponentProps {}

export default function ProjectForm({ refetch }: IProjectFormProps) {
  const { internalPersonnel } = useAllPersonnel();
  const { allClients } = useAllClients();
  const clients = allClients.map(client => {
    return { label: client.name, value: client.id };
  });

  // State for dynamic machine forms
  const [chillerForms, setChillerForms] = useState([0]); // Start with one chiller form
  const [coolingTowerForms, setCoolingTowerForms] = useState([0]); // Start with one cooling tower form
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  const projectCreationForm = useForm<TProjectCreationAttributes>({
    resolver: zodResolver(projectCreationSchema),
    defaultValues: {
      parentId: '',
      clientId: '',
      name: '',
      description: '',
      quoteNumber: '',
      PONumber: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],

      type: undefined,
      contractType: undefined,
      workCategory: undefined,
      warranty: '',
      clientPersonnelIds: [],
      personnelIds: [],
      chillers: [] as Array<{
        ownership: 'CORINTEK' | 'CLIENT';
        capacity?: number | null;
        brand?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        unitNumber: number;
      }>,
      coolingTowers: [] as Array<{
        ownership: 'CORINTEK' | 'CLIENT';
        capacity?: number | null;
        brand?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        unitNumber: number;
      }>,
    },
  });

  // Ensure array fields are properly initialized
  React.useEffect(() => {
    const currentValues = projectCreationForm.getValues();
    if (typeof currentValues.clientPersonnelIds === 'string') {
      projectCreationForm.setValue('clientPersonnelIds', []);
    }
    if (typeof currentValues.personnelIds === 'string') {
      projectCreationForm.setValue('personnelIds', []);
    }
    if (
      typeof currentValues.chillers === 'string' ||
      currentValues.chillers.length === 0
    ) {
      projectCreationForm.setValue('chillers', [
        {
          ownership: 'CORINTEK',
          capacity: null,
          brand: null,
          model: null,
          serialNumber: null,
          unitNumber: 0,
        },
      ]);
    }
    if (
      typeof currentValues.coolingTowers === 'string' ||
      currentValues.coolingTowers.length === 0
    ) {
      projectCreationForm.setValue('coolingTowers', [
        {
          ownership: 'CORINTEK',
          capacity: null,
          brand: null,
          model: null,
          serialNumber: null,
          unitNumber: 0,
        },
      ]);
    }
  }, []);

  // Watch for client selection changes
  const selectedClientId = projectCreationForm.watch('clientId');
  const { clientPersonnel } = useClientPersonnel(selectedClientId);
  const watchedType = projectCreationForm.watch('type');
  const { clientProjects } = useProjectsByClient(selectedClientId);

  const formFields = useMemo(() => {
    return projectCreationFormFields(
      {
        clients,
        personnel: internalPersonnel,
        clientPersonnel: clientPersonnel,
        projects: clientProjects,
      },
      {
        type: watchedType,
      }
    );
  }, [
    clients,
    internalPersonnel,
    clientPersonnel,
    clientProjects,
    watchedType,
  ]);

  const {
    onSubmit: originalOnSubmit,
    onInvalid,
    isLoading,
  } = useFormHandleSubmit<TProjectCreationAttributes>({
    form: projectCreationForm,
    apiUrl: '/projects',
    refetch,
  });

  // Custom submit handler to automatically set machine types
  const onSubmit = async (data: TProjectCreationAttributes) => {
    // Create a modified copy of the data with proper machine types
    const modifiedData = {
      ...data,
      chillers:
        data.chillers?.map(chiller => ({
          ...chiller,
          type: MachineType.CHILLER,
        })) || [],
      coolingTowers:
        data.coolingTowers?.map(tower => ({
          ...tower,
          type: MachineType.COOLING_TOWER,
        })) || [],
    };

    // Call the original submit handler with modified data
    return originalOnSubmit(modifiedData);
  };

  // Functions to handle dynamic machine forms
  const addChillerForm = useCallback(() => {
    setChillerForms(prev => [...prev, prev.length]);
    // Add a new chiller object to the form array
    const currentChillers = projectCreationForm.getValues('chillers') || [];
    currentChillers.push({
      ownership: 'CORINTEK',
      capacity: null,
      brand: null,
      model: null,
      serialNumber: null,
      unitNumber: currentChillers.length,
    });
    projectCreationForm.setValue('chillers', currentChillers);
  }, [projectCreationForm]);

  const removeChillerForm = useCallback(
    (index: number) => {
      if (chillerForms.length > 1) {
        setChillerForms(prev => prev.filter((_, i) => i !== index));
        // Remove the chiller data from form
        const currentChillers = projectCreationForm.getValues('chillers') || [];
        currentChillers.splice(index, 1);
        projectCreationForm.setValue('chillers', currentChillers);
      }
    },
    [chillerForms.length, projectCreationForm]
  );

  const addCoolingTowerForm = useCallback(() => {
    setCoolingTowerForms(prev => [...prev, prev.length]);
  }, []);

  const removeCoolingTowerForm = useCallback(
    (index: number) => {
      if (coolingTowerForms.length > 1) {
        setCoolingTowerForms(prev => prev.filter((_, i) => i !== index));
        // Remove the cooling tower data from form
        const currentCoolingTowers =
          projectCreationForm.getValues('coolingTowers') || [];
        currentCoolingTowers.splice(index, 1);
        projectCreationForm.setValue('coolingTowers', currentCoolingTowers);
      }
    },
    [coolingTowerForms.length, projectCreationForm]
  );

  // Create accordion data for DefaultForm
  const accordionData = useMemo(() => {
    const accordions: IAccordionDataFormatted[] = [
      {
        title: 'Data Proyek',
        value: 'general-info',
        fields: formFields,
      },
    ];

    // Create machine accordions with proper re-indexing
    const machineAccordions: IAccordionDataFormatted[] = [];

    // Add chiller forms with reindexed numbers
    chillerForms.forEach((formIndex, displayIndex) => {
      machineAccordions.push({
        title: (
          <div className="flex items-center justify-between w-full">
            <span>Chiller {displayIndex + 1}</span>
            <div className="flex gap-2">
              {chillerForms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeChillerForm(formIndex);
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ),
        value: `chiller-${formIndex}`,
        fields: machineFormFields.map(field => ({
          ...field,
          name: `chillers.${formIndex}.${field.name}` as string,
        })),
      });
    });

    // Add cooling tower forms with reindexed numbers
    coolingTowerForms.forEach((formIndex, displayIndex) => {
      machineAccordions.push({
        title: (
          <div className="flex items-center justify-between w-full">
            <span>Cooling Tower {displayIndex + 1}</span>
            <div className="flex gap-2">
              {coolingTowerForms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeCoolingTowerForm(formIndex);
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ),
        value: `cooling-tower-${formIndex}`,
        fields: machineFormFields.map(field => ({
          ...field,
          name: `coolingTowers.${formIndex}.${field.name}` as string,
        })),
      });
    });

    // Add Unit Machines section with nested accordions
    if (machineAccordions.length > 0) {
      accordions.push({
        title: <span>Unit Machines ({machineAccordions.length})</span>,
        description: (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                addChillerForm();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Chiller</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                addCoolingTowerForm();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Cooling Tower</span>
            </Button>
          </div>
        ),
        value: 'unit-machines',
        fields: [],
        children: machineAccordions,
      });
    }

    return accordions;
  }, [
    formFields,
    chillerForms,
    coolingTowerForms,
    addChillerForm,
    removeChillerForm,
    addCoolingTowerForm,
    removeCoolingTowerForm,
  ]);

  return (
    <DefaultForm<TProjectCreationAttributes>
      form={projectCreationForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={projectCreationSchema}
      isLoading={isLoading}
      formFieldSelector={{
        type: 'accordion',
        accordions: accordionData,
        value: accordionValue,
        onValueChange: value => setAccordionValue(value as string[]),
      }}
    />
  );
}
