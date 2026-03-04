'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition, useEffect, useState } from 'react';
import {
  userCreateSchema,
  userUpdateSchema,
  TUserCreateInput,
  TUserUpdateInput,
  TUserResponse,
  UserRole,
  EmploymentStatus,
  TUserRole,
} from '@/@types/user.type';
import { createUserAction, updateUserAction } from '@/features/users/actions';
import { getAllClientsAction } from '@/features/clients/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IUserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TUserResponse>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CLIENT_ROLES: TUserRole[] = [
  'CLIENT',
  'CLIENT_TECHNICIAN',
  'CLIENT_SUPERVISOR',
];

export function UserForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: IUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

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

  useEffect(() => {
    if (isClientRole) {
      setIsLoadingClients(true);
      getAllClientsAction()
        .then(result => {
          if (result.success && result.data) {
            setClients(result.data);
          } else {
            toast.error('Gagal memuat data klien');
          }
        })
        .catch(() => toast.error('Gagal memuat data klien'))
        .finally(() => setIsLoadingClients(false));
    }
  }, [isClientRole]);

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
        // Set form error
        form.setError('root', {
          type: 'manual',
          message: result.error || 'An error occurred',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ID Number */}
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="123456789"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St, City"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password (only for create mode) */}
        {mode === 'create' && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min 8 characters"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(UserRole).map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Employment Status */}
        <FormField
          control={form.control}
          name="employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(EmploymentStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Selection (only for CLIENT* roles) */}
        {isClientRole && (
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client (Perusahaan)</FormLabel>
                <Select
                  onValueChange={value =>
                    field.onChange(value === 'none' ? null : value)
                  }
                  value={field.value || 'none'}
                  disabled={isLoadingClients}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingClients
                            ? 'Memuat data klien...'
                            : 'Pilih klien'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">- Tidak Ada -</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Form Actions */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? mode === 'create'
                ? 'Creating...'
                : 'Updating...'
              : mode === 'create'
                ? 'Create User'
                : 'Update User'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
