import { TProjectCreationAttributes } from '@/types/project.type';
import { projectCreationSchema } from '../schemas/projectSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreationFormFields } from '../data/projectFormFields';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';

export default function ProjectForm() {
  const projectCreationForm = useForm<TProjectCreationAttributes>({
    resolver: zodResolver(projectCreationSchema),
    defaultValues: {
      parentId: '',
      clientId: '',
      name: '',
      description: '',
      quoteNumber: '',
      PONumber: '',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-01-01'),
      type: undefined,
      contractType: undefined,
      workCategory: undefined,
      warranty: 0,
      clientPersonnelIds: [],
      personnelIds: [],
    },
  });

  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: projectCreationForm,
    apiUrl: '/projects',
  });

  return (
    <DefaultForm<TProjectCreationAttributes>
      form={projectCreationForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={projectCreationFormFields}
      validationSchema={projectCreationSchema}
    />
  );
}
