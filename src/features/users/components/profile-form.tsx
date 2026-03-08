'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition, useState, useEffect } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import {
  profileUpdateSchema,
  TProfileUpdateInput,
  ICurrentUserProfile,
} from '@/@types/user.type';
import {
  updateCurrentUserProfileAction,
  uploadAvatarAction,
} from '@/features/users/actions';
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
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<TProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName ?? '',
      phoneNumber: profile.phoneNumber,
      avatarUrl: profile.avatarUrl,
    },
  });

  useEffect(() => {
    if (avatarUrl) {
      form.setValue('avatarUrl', avatarUrl);
    }
  }, [avatarUrl, form]);

  const handleAvatarChange = async (url: string | null, file: File | null) => {
    setAvatarUrl(url);
    setAvatarFile(file);
  };

  const onSubmit = async (data: TProfileUpdateInput) => {
    startTransition(async () => {
      let finalData = { ...data };

      if (avatarFile) {
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('file', avatarFile);

        const uploadResult = await uploadAvatarAction(formData);
        if (uploadResult.success && uploadResult.data?.url) {
          finalData = { ...finalData, avatarUrl: uploadResult.data.url };
          setAvatarUrl(uploadResult.data.url);
        } else {
          toast.error('Gagal mengupload avatar', {
            description: uploadResult.error || 'Terjadi kesalahan',
          });
          setIsUploadingAvatar(false);
          return;
        }
        setIsUploadingAvatar(false);
      } else if (avatarUrl === null && profile.avatarUrl) {
        finalData.avatarUrl = null;
      }

      const result = await updateCurrentUserProfileAction(finalData);

      if (result.success) {
        toast.success('Profil berhasil diperbarui');
      } else {
        toast.error('Gagal memperbarui profil', {
          description: result.error || 'Terjadi kesalahan',
        });
        // Set form error for consistency with UserForm
        form.setError('root', {
          type: 'manual',
          message: result.error || 'An error occurred',
        });
      }
    });
  };

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
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  handleAvatarChange(url, file);
                }
              }}
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
