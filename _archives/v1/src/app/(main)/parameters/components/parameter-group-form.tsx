import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parameterGroupSchema } from '../schemas/parameterGroupSchema';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { parameterGroupFormFields } from '../data/parameterGroupFormFields';
import { IDefaultFormComponentProps } from '@/types/form/form.type';
import useParameterGroupById from '../hooks/useParameterGroupById';
import { useEffect } from 'react';

interface IParameterGroupFormProps extends IDefaultFormComponentProps {}

export default function ParameterGroupForm({
  type,
  id: parameterGroupId,
  refetch,
}: IParameterGroupFormProps) {
  const isUpdate = type ? type?.toLocaleLowerCase() === 'update' : false;
  const { parameterGroup } = useParameterGroupById(parameterGroupId as string);
  const parameterGroupForm = useForm<TParameterGroupAttributes>({
    resolver: zodResolver(parameterGroupSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
    },
  });

  useEffect(() => {
    if (isUpdate && parameterGroup) {
      parameterGroupForm.reset({
        name: parameterGroup.name,
        type: parameterGroup.type,
        description: parameterGroup.description,
      });
    }
  }, [parameterGroup, isUpdate, parameterGroupForm]);

  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: parameterGroupForm,
    apiUrl: `/parameters/groups${isUpdate ? `/${parameterGroupId}` : ''}`,
    refetch,
    update: isUpdate,
  });

  return (
    <DefaultForm<TParameterGroupAttributes>
      form={parameterGroupForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFieldSelector={{
        type: 'default',
        formFields: parameterGroupFormFields,
      }}
      validationSchema={parameterGroupSchema}
      isLoading={isLoading}
    />
  );
}
