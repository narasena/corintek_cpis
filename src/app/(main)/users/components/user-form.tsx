import { TUserCreationAttributes } from '@/types/user.type';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreationSchema } from '../schemas/userSchema';
import { useImagePreview } from '@/hooks/useImagePreview';
import useImageUpload from '@/hooks/useImageUpload';
import { createUserFormFields } from '../data/userFormFields';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';

export default function UserForm() {
  const { previewUrl, handleImagePreview } = useImagePreview<TUserCreationAttributes, 'avatarImg'>();
  const { file, handleUpload, result, setFile, uploading } = useImageUpload();

  const createUserForm = useForm<TUserCreationAttributes>({
    resolver: zodResolver(userCreationSchema),
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

  const { onSubmitWithImage, onInvalid } = useFormHandleSubmit({
    data: createUserForm,
    form: createUserForm,
    key: 'avatarImg'
  });

  return (
    <DefaultForm<TUserCreationAttributes>
      form={createUserForm}
      onSubmit={onSubmitWithImage}
      onInvalid={onInvalid}
      avatar={{
        key: 'avatarImg',
        previewUrl: previewUrl || '',
        onChange: handleImagePreview,
      }}
      formFields={createUserFormFields}
      validationSchema={userCreationSchema}
    />
  );
}
