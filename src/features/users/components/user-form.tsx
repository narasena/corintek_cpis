'use client';

import { TUserResponse } from '@/@types/user.type';
import { useUserForm } from '@/features/users/hooks/use-user-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UserBasicFields } from './form-sections/UserBasicFields';
import { UserRoleFields } from './form-sections/UserRoleFields';
import { UserSecurityFields } from './form-sections/UserSecurityFields';

interface IUserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TUserResponse>;
  onSuccess?: () => void;
  onCancel?: () => void;
  canResetPassword?: boolean;
}

export function UserForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
  canResetPassword,
}: IUserFormProps) {
  const { form, onSubmit, isPending, clients, isLoadingClients, isClientRole } =
    useUserForm({ mode, defaultValues, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UserBasicFields control={form.control} />

        <UserRoleFields
          control={form.control}
          isClientRole={!!isClientRole}
          clients={clients}
          isLoadingClients={isLoadingClients}
        />

        {(mode === 'create' || canResetPassword) && (
          <UserSecurityFields control={form.control} mode={mode} />
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {mode === 'create' ? 'Buat Pengguna' : 'Simpan Perubahan'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
