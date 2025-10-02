import { TUserCreationAttributes } from '@/types/user.type';
import React from 'react';
import { Field, FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreationSchema } from '../schemas/userSchema';
import useImageUpload from '@/hooks/useImageUpload';
import { createUserFormFields } from '../data/userFormFields';
import { toast } from 'sonner';
import errorMessageResponse from '@/utils/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import DefaultForm from '@/components/features/forms/default-form';
import useUsers from '../hooks/useUsers';

export default function UserForm() {
  const {
    allUsers,
    previewUrl,
    handleImagePreview,
    file,
    handleUpload,
    result,
    setFile,
    uploading,
    createUserForm,
    onSubmitWithImage,
    onInvalid,
  } = useUsers();

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
