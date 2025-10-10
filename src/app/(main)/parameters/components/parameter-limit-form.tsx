import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { parameterLimitFormFields } from '../data/parameterLimitFormFields';
import { parameterLimitSchema } from '../schemas/parameterLimitSchema';
import { TParameterLimitAttributes } from '@/types/parameter.type';

export default function ParameterLimitForm() {
  const parameterLimitForm = useForm<TParameterLimitAttributes>({
    resolver: zodResolver(parameterLimitSchema),
    defaultValues: {
      parameterId: '',
      methodId: '',
      valueType: undefined,
      minValue: '',
      maxValue: '',
      booleanValue: undefined,
      textValue: '',
    },
  });

  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: parameterLimitForm,
    apiUrl: '/parameter-limits',
  });

  return (
    <DefaultForm<TParameterLimitAttributes>
      form={parameterLimitForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={parameterLimitFormFields}
      validationSchema={parameterLimitSchema}
    />
  );
}
