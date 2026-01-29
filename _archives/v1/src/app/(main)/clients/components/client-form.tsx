import { TClientCreationAttributes } from '@/types/client.type';
import { useForm } from 'react-hook-form';
import { clientCreationSchema } from '../schemas/clientSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import DefaultForm from '@/components/features/forms/default-form';
import { useImagePreview } from '@/hooks/useImagePreview';
import { createClientFormFields } from '../data/clientFormFields';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';

export default function ClientForm() {
  const createClientForm = useForm<TClientCreationAttributes>({
    resolver: zodResolver(clientCreationSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phoneNumber: '',
      websiteUrl: '',
      address: '',
      avatarImg: null,
    },
  });

  const { previewUrl, handleImagePreview } = useImagePreview();

  const { onSubmitWithImage, onInvalid } = useFormHandleSubmit({
    form: createClientForm,
    imageKey: 'avatarImg',
    apiUrl: '/clients',
  });

  return (
    <DefaultForm<TClientCreationAttributes>
      form={createClientForm}
      onSubmit={onSubmitWithImage}
      onInvalid={onInvalid}
      avatar={{
        key: 'avatarImg',
        previewUrl: previewUrl || '',
        onChange: handleImagePreview,
      }}
      formFieldSelector={{
        type: 'default',
        formFields: createClientFormFields,
      }}
      validationSchema={clientCreationSchema}
    />
  );
}
