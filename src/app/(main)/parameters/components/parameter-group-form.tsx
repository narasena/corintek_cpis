import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parameterGroupSchema } from '../schemas/parameterGroupSchema';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { parameterGroupFormFields } from '../data/parameterGroupFormFields';
import useAllParameterGroups from '@/hooks/parameters/useAllParameterGroups';

interface ParameterGroupFormProps {
  refetch?: () => void;
}

export default function ParameterGroupForm({ refetch }: ParameterGroupFormProps) {
  const parameterGroupForm = useForm<TParameterGroupAttributes>({
    resolver: zodResolver(parameterGroupSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
    },
  });
  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: parameterGroupForm,
    apiUrl: '/parameters/groups',
    refetch,
  });

  return (
    <DefaultForm<TParameterGroupAttributes>
      form={parameterGroupForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={parameterGroupFormFields}
      validationSchema={parameterGroupSchema}
    />
  );
}
