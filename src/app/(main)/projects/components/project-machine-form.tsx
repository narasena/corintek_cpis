import { useForm } from 'react-hook-form';
import { machineSchema, TMachineAttributes } from '../schemas/machineSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { machineFormFields } from '../data/machineFormFields';

interface IProjectMachineFormProps {
  refetch: () => void;
}

export default function ProjectMachineForm({
  refetch,
}: IProjectMachineFormProps) {
  const projectMachineForm = useForm<TMachineAttributes>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      type: undefined,
      ownership: undefined,
      capacity: 0,
      brand: '',
      model: '',
      serialNumber: '',
    },
  });

  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: projectMachineForm,
    apiUrl: '/projects/machines',
    refetch,
  });
  return (
    <DefaultForm<TMachineAttributes>
      form={projectMachineForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={machineFormFields}
      validationSchema={machineSchema}
      isLoading={isLoading}
    />
  );
}
