import React from 'react';
import { TProjectCreationAttributes } from '@/types/project.type';
import { projectCreationSchema } from '../schemas/projectSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreationFormFields } from '../data/projectFormFields';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import useAllPersonnel from '@/hooks/users/useAllPersonnel';
import useAllClients from '@/hooks/clients/useAllClients';
import useClientPersonnel from '@/hooks/clients/useClientPersonnel';

export default function ProjectForm() {
  const { internalPersonnel } = useAllPersonnel();
  const { allClients } = useAllClients();
  const clients = allClients.map(client => {
    return { label: client.name, value: client.id };
  });

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
  const { clientPersonnel } = useClientPersonnel(selectedClientId);

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
        personnel: internalPersonnel,
        clientPersonnel: clientPersonnel,
      })}
      validationSchema={projectCreationSchema}
    />
  );
}
