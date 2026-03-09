'use client';

import { Camera, Loader2, User } from 'lucide-react';
import { ICurrentUserProfile } from '@/@types/user.type';
import { useProfileForm } from '@/features/users/hooks/use-profile-form';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoleLabel } from '@/lib/rbac';

interface IProfileFormProps {
  profile: ICurrentUserProfile;
}

export function ProfileForm({ profile }: IProfileFormProps) {
  const {
    form,
    onSubmit,
    isPending,
    avatarUrl,
    isUploadingAvatar,
    onFileChange,
  } = useProfileForm(profile);

  const initials = `${profile.firstName[0] ?? ''}${(profile.lastName?.[0] ?? '').toUpperCase()}`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={avatarUrl ?? undefined}
                alt={profile.firstName}
              />
              <AvatarFallback className="text-2xl">
                {initials || <User />}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <Camera className="h-4 w-4 text-primary-foreground" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              disabled={isUploadingAvatar}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Klik untuk mengubah foto profil
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input placeholder="+62812345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={profile.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            Email tidak dapat diubah. Hubungi administrator jika perlu.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Input
            value={getRoleLabel(profile.role)}
            disabled
            className="bg-muted"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || isUploadingAvatar}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </form>
    </Form>
  );
}
