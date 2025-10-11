import React from 'react';
import { TProjectCreationAttributes } from '@/types/project.type';
import { projectCreationSchema } from '../schemas/projectSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreationFormFields } from '../data/projectFormFields';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import useAllPersonnels from '@/hooks/users/useAllPersonnels';
import useAllClients from '@/hooks/clients/useAllClients';
import useClientPersonnels from '@/hooks/clients/useClientPersonnels';

export default function ProjectForm() {
  const { internalPersonnels } = useAllPersonnels();
  const { allClients } = useAllClients();
  const clients = allClients.map(client => {
    return { label: client.name, value: client.id };
  });

  const projectCreationForm = useForm<TProjectCreationAttributes>({
    resolver: zodResolver(projectCreationSchema),
    defaultValues: {
      parentId: null,
      clientId: '',
      name: '',
      description: null,
      quoteNumber: '',
      PONumber: '',
      startDate: new Date(),
      endDate: new Date(),
      type: undefined,
      contractType: undefined,
      workCategory: undefined,
      warranty: null,
      clientPersonnelIds: [],
      personnelIds: [],
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
  }, []);

  // Watch for client selection changes
  const selectedClientId = projectCreationForm.watch('clientId');
  const { clientPersonnels } = useClientPersonnels(selectedClientId);

  const { onSubmit, onInvalid } =
    useFormHandleSubmit<TProjectCreationAttributes>({
      form: projectCreationForm,
      apiUrl: '/projects',
    });

  return (
    <DefaultForm<TProjectCreationAttributes>
      form={projectCreationForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={projectCreationFormFields({
        clients,
        personnels: internalPersonnels,
        clientPersonnels: clientPersonnels,
      })}
      validationSchema={projectCreationSchema}
    />
  );
}
