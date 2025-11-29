import { TUserCreationAttributes } from '@/types/user.type';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreationSchema } from '../schemas/userSchema';
import { useImagePreview } from '@/hooks/useImagePreview';
import { createUserFormFields } from '../data/userFormFields';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';

export default function UserForm() {
  const { previewUrl, handleImagePreview } = useImagePreview();

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
    form: createUserForm,
    imageKey: 'avatarImg',
    apiUrl: '/users',
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
      formFieldSelector={{
        type: 'default',
        formFields: createUserFormFields,
      }}
      validationSchema={userCreationSchema}
    />
  );
}
