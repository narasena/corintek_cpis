import { TParameterAttributes } from '@/types/parameter.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parameterSchema } from '../schemas/parameterSchema';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { parameterFormFields } from '../data/parameterFormFields';

export default function ParameterForm() {
  const parameterForm = useForm<TParameterAttributes>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      name: '',
      valueType: undefined,
      unit: null,
      type: undefined,
      groupId: null,
    },
  });

  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: parameterForm,
    apiUrl: '/parameters',
  });

  return (
    <DefaultForm<TParameterAttributes>
      form={parameterForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={parameterFormFields}
      validationSchema={parameterSchema}
    />
  );
}
