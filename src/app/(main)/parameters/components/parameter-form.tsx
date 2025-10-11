import { TParameterAttributes } from '@/types/parameter.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parameterSchema } from '../schemas/parameterSchema';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { parameterFormFields } from '../data/parameterFormFields';

export interface IParameterFormProps {
  refetch: () => void;
}

export default function ParameterForm({ refetch }: IParameterFormProps) {
  const parameterForm = useForm<TParameterAttributes>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      name: '',
      valueType: undefined,
      unit: '',
    },
  });

  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: parameterForm,
    apiUrl: '/parameters',
    refetch,
  });

  return (
    <DefaultForm<TParameterAttributes>
      form={parameterForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={parameterFormFields}
      validationSchema={parameterSchema}
      isLoading={isLoading}
    />
  );
}
