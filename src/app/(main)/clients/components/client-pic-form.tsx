import { TClientPICCreationAttributes } from '@/types/client.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { clientPersonnelCreateSchema } from '../schemas/clientPICSchema';
import { useImagePreview } from '@/hooks/useImagePreview';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { createClientPICFormFields } from '../data/clientPICFormFields';
import useClientById from '@/hooks/clients/useClientById';

interface IClientPicFormProps {
  clientId: string;
}

export default function ClientPicForm(props: IClientPicFormProps) {
  const { refetch } = useClientById(props.clientId);
  const createClientPICForm = useForm<TClientPICCreationAttributes>({
    resolver: zodResolver(clientPersonnelCreateSchema),
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
    apiUrl: `/clients/${props.clientId}/personnels`,
    refetch,
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
      validationSchema={clientPersonnelCreateSchema}
    />
  );
}
