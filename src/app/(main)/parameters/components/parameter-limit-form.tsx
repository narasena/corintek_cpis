import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { parameterLimitSchema } from '../schemas/parameterLimitSchema';
import { TParameterLimitAttributes } from '@/types/parameter.type';
import useAllParameters from '@/hooks/parameters/useAllParameters';
import useAllParameterGroups from '@/hooks/parameters/useAllParameterGroups';
import useAllStandardMethods from '@/hooks/parameters/useAllStandardMethods';
import { parameterLimitFormFields } from '../data/parameterLimitFormFields';

export interface IParameterLimitFormProps {
  refetch: () => void;
}

export default function ParameterLimitForm({
  refetch,
}: IParameterLimitFormProps) {
  const { allParameters } = useAllParameters();
  const { allParameterGroups } = useAllParameterGroups();
  const { allStandardMethods } = useAllStandardMethods();

  const parameterLimitForm = useForm<TParameterLimitAttributes>({
    resolver: zodResolver(parameterLimitSchema),
    defaultValues: {
      parameterId: '',
      groupId: '',
      methodId: '',
      valueType: undefined,
      minValue: '',
      maxValue: '',
      booleanValue: undefined,
      textValue: '',
    },
  });

  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: parameterLimitForm,
    apiUrl: '/parameters/limits',
    refetch,
  });

  return (
    <DefaultForm<TParameterLimitAttributes>
      form={parameterLimitForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFields={parameterLimitFormFields({
        allParameters,
        allParameterGroups,
        allStandardMethods,
      })}
      validationSchema={parameterLimitSchema}
      isLoading={isLoading}
    />
  );
}
