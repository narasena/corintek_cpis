'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition, useState, useEffect } from 'react';
import {
  profileUpdateSchema,
  TProfileUpdateInput,
  ICurrentUserProfile,
} from '@/@types/user.type';
import {
  updateCurrentUserProfileAction,
  uploadAvatarAction,
} from '@/features/users/actions';

export function useProfileForm(profile: ICurrentUserProfile) {
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

  const handleAvatarChange = (url: string | null, file: File | null) => {
    setAvatarUrl(url);
    setAvatarFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleAvatarChange(url, file);
    }
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
    avatarUrl,
    isUploadingAvatar,
    onFileChange,
  };
}
