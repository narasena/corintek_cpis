import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parameterGroupSchema } from '../schemas/parameterGroupSchema';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { parameterGroupFormFields } from '../data/parameterGroupFormFields';

export default function ParameterGroupForm() {
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
