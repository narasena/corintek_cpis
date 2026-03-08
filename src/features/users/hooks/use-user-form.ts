'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition } from 'react';
import {
  userCreateSchema,
  userUpdateSchema,
  TUserCreateInput,
  TUserUpdateInput,
  TUserResponse,
  TUserRole,
} from '@/@types/user.type';
import { createUserAction, updateUserAction } from '@/features/users/actions';
import { useUserClients } from '@/features/users/hooks/use-user-clients';

interface IUseUserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TUserResponse>;
  onSuccess?: () => void;
}

const CLIENT_ROLES: TUserRole[] = [
  'CLIENT',
  'CLIENT_TECHNICIAN',
  'CLIENT_SUPERVISOR',
];

export function useUserForm({ mode, defaultValues, onSuccess }: IUseUserFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TUserCreateInput | TUserUpdateInput>({
    resolver: zodResolver(
      mode === 'create' ? userCreateSchema : userUpdateSchema
    ),
    defaultValues:
      mode === 'create'
        ? {
            firstName: '',
            lastName: '',
            idNumber: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            address: '',
            role: undefined,
            employmentStatus: undefined,
            clientId: null,
          }
        : {
            firstName: defaultValues?.firstName || '',
            lastName: defaultValues?.lastName || '',
            idNumber: defaultValues?.idNumber || '',
            email: defaultValues?.email || '',
            phoneNumber: defaultValues?.phoneNumber || '',
            address: defaultValues?.address || '',
            role: defaultValues?.role,
            employmentStatus: defaultValues?.employmentStatus,
            clientId: defaultValues?.clientId || null,
          },
  });

  const selectedRole = useWatch({ control: form.control, name: 'role' });
  const isClientRole =
    selectedRole && CLIENT_ROLES.includes(selectedRole as TUserRole);

  const { clients, isLoading: isLoadingClients } = useUserClients(!!isClientRole);

  const onSubmit = async (data: TUserCreateInput | TUserUpdateInput) => {
    startTransition(async () => {
      let result;

      if (mode === 'create') {
        result = await createUserAction(data as TUserCreateInput);
      } else {
        if (!defaultValues?.id) {
          toast.error('Kesalahan Implementasi', {
            description: 'ID Pengguna diperlukan untuk pembaruan',
          });
          return;
        }
        result = await updateUserAction(
          defaultValues.id,
          data as TUserUpdateInput
        );
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Pengguna berhasil dibuat'
            : 'Pengguna berhasil diperbarui'
        );
        form.reset();
        onSuccess?.();
      } else {
        toast.error(
          mode === 'create'
            ? 'Gagal membuat pengguna'
            : 'Gagal memperbarui pengguna',
          {
            description: result.error || 'Terjadi kesalahan',
          }
        );
        form.setError('root', {
          type: 'manual',
          message: result.error || 'An error occurred',
        });
      }
    });
  };

  return {
    form,
    onSubmit,
    isPending,
    clients,
    isLoadingClients,
    isClientRole,
  };
}
