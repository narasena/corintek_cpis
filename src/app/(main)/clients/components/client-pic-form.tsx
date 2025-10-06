import { TClientPICCreationAttributes } from '@/types/client.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { clientPICCreationSchema } from '../schemas/clientPICSchema';
import { useImagePreview } from '@/hooks/useImagePreview';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { createClientPICFormFields } from '../data/clientPICFormFields';

export default function ClientPicForm() {
  const createClientPICForm = useForm<TClientPICCreationAttributes>({
    resolver: zodResolver(clientPICCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      employmentStatus: undefined,
      avatarImg: null,
    },
  });

  const { previewUrl, handleImagePreview } = useImagePreview<
    TClientPICCreationAttributes,
    'avatarImg'
  >();

  const { onSubmitWithImage, onInvalid } = useFormHandleSubmit({
    form: createClientPICForm,
    imageKey: 'avatarImg',
    apiUrl: '/clients/pic/create',
  });

  return (
    <DefaultForm<TClientPICCreationAttributes>
      form={createClientPICForm}
      onSubmit={onSubmitWithImage}
      onInvalid={onInvalid}
      avatar={{
        key: 'avatarImg',
        previewUrl: previewUrl || '',
        onChange: handleImagePreview,
      }}
      formFields={createClientPICFormFields}
      validationSchema={clientPICCreationSchema}
    />
  );
}
