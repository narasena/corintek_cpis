'use client';

import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TUserCreateInput, TUserUpdateInput } from '@/@types/user.type';

interface IUserSecurityFieldsProps {
  control: Control<TUserCreateInput | TUserUpdateInput>;
  mode?: 'create' | 'edit';
}

export function UserSecurityFields({ control, mode }: IUserSecurityFieldsProps) {
  return (
    <>
      {mode === 'edit' && (
        <p className="text-sm text-muted-foreground">
          Kosongkan jika tidak ingin mengubah password
        </p>
      )}
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Min 8 characters"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirm"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
