import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { standardMethodFormFields } from '../data/standardMethodFormFields';
import { standardMethodSchema } from '../schemas/standardMethodSchema';
import { TStandardMethodAttributes } from '@/types/parameter.type';

export default function StandardMethodForm() {
  const standardMethodForm = useForm<TStandardMethodAttributes>({
    resolver: zodResolver(standardMethodSchema),
    defaultValues: {
      methodName: '',
      year: new Date().getFullYear(),
      version: '',
      isActive: true,
      description: '',
    },
  });

  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: standardMethodForm,
    apiUrl: '/standard-methods',
  });

  return (
    <DefaultForm<TStandardMethodAttributes>
      form={standardMethodForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFieldSelector={{
        type: 'default',
        formFields: standardMethodFormFields,
      }}
      validationSchema={standardMethodSchema}
    />
  );
}
