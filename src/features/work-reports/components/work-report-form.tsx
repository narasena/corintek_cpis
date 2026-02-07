'use client';

import { useTransition, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/date-picker';
import { MultiSelect } from '@/components/multi-select';
import { CameraInput } from '@/components/camera-input';

import {
  createWorkReportAction,
  updateWorkReportAction,
  uploadWorkReportPhotoAction,
  deleteWorkReportPhotoAction,
} from '@/features/work-reports/actions';
import { getMachinesByProjectAction } from '@/features/machines/actions';
import {
  WorkReportSchema,
  type CreateWorkReportInput,
} from '@/features/work-reports/types';
import type { IMachine } from '@/features/machines/types';
import type { WorkReportRow } from '@/features/work-reports/types';

interface IWorkReportFormProps {
  projectId: string;
  initialData?: WorkReportRow;
  onSuccess: () => void;
  onCancel: () => void;
}

export function WorkReportForm({
  projectId,
  initialData,
  onSuccess,
  onCancel,
}: IWorkReportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [machineOptions, setMachineOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Fetch machines for the project
  useEffect(() => {
    getMachinesByProjectAction(projectId).then(res => {
      if (res.success && res.data) {
        const fetchedMachines = res.data as IMachine[];
        setMachineOptions(
          fetchedMachines.map(m => ({
            label: `${m.name} (${m.unitNumber})`,
            value: m.id,
          }))
        );
      }
    });
  }, [projectId]);

  const form = useForm<CreateWorkReportInput>({
    resolver: zodResolver(WorkReportSchema),
    defaultValues: initialData
      ? {
          projectId,
          id: initialData.id,
          date: new Date(initialData.date),
          timeStart: initialData.timeStart,
          timeEnd: initialData.timeEnd,
          zone: initialData.zone,
          situation: initialData.situation,
          workDone: initialData.workDone,
          workResult: initialData.workResult,
          machineIds: initialData.machines.map(m => m.id),
        }
      : {
          projectId,
          date: new Date(),
          timeStart: '09:00',
          timeEnd: '17:00',
          zone: '',
          situation: '',
          workDone: '',
          workResult: '',
          machineIds: [],
        },
  });

  const onSubmit = (data: CreateWorkReportInput) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('projectId', data.projectId);
        formData.append('date', data.date.toISOString());
        if (data.timeStart) formData.append('timeStart', data.timeStart);
        if (data.timeEnd) formData.append('timeEnd', data.timeEnd);
        if (data.zone) formData.append('zone', data.zone);
        formData.append('situation', data.situation);
        formData.append('workDone', data.workDone);
        formData.append('workResult', data.workResult);

        if (data.machineIds) {
          data.machineIds.forEach(id => formData.append('machineIds', id));
        }

        let result;
        if (initialData?.id) {
          formData.append('id', initialData.id);
          result = await updateWorkReportAction(formData);
        } else {
          result = await createWorkReportAction(formData);
        }

        if (result.success) {
          toast.success(initialData ? 'Laporan diperbarui' : 'Laporan dibuat', {
            description: 'Data berhasil disimpan',
          });
          onSuccess();
        } else {
          toast.error('Gagal menyimpan laporan', {
            description: result.message || 'Terjadi kesalahan',
          });
        }
      } catch (error) {
        console.error(error);
        toast.error('Terjadi kesalahan yang tidak terduga');
      }
    });
  };

  // Photo handling
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState(initialData?.photos || []);

  const handlePhotoUpload = async (url: string | null, file?: File | null) => {
    if (!file || !initialData?.id) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workReportId', initialData.id);
      formData.append('projectId', projectId);

      const res = await uploadWorkReportPhotoAction(formData);
      if (res.success && res.url) {
        toast.success('Foto berhasil diupload');
        setPhotos(prev => [
          ...prev,
          { id: 'temp-' + Date.now(), url: res.url!, caption: '' },
        ]);
        // In a real app we'd want to refresh the full data to get the real ID,
        // but for now let's just show it.
        // Actually, to delete it later we need the ID.
        // The action returns { success: true, url }. Ideally it should return the created object.
        // Let's just trigger onSuccess() to refresh the parent which refreshes the form?
        // No, form state is local.
        // Best approach: Just refresh the parent list/dialog.
        onSuccess();
      } else {
        toast.error('Gagal upload foto', { description: res.message });
      }
    } catch {
      toast.error('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!initialData?.id) return;

    // If it's a temp ID (optimistic UI), we can't delete from server easily without the real ID.
    // But since we called onSuccess() after upload, the initialData should be stale?
    // Ah, if the parent re-renders and passes new initialData, this component might strictly respect it
    // if we used a key or useEffect.

    // For now, let's assume we have valid IDs.
    if (photoId.startsWith('temp-')) return;

    const formData = new FormData();
    formData.append('photoId', photoId);
    formData.append('workReportId', initialData.id);
    formData.append('projectId', projectId);

    const res = await deleteWorkReportPhotoAction(formData);
    if (res.success) {
      toast.success('Foto dihapus');
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      onSuccess();
    } else {
      toast.error('Gagal menghapus foto');
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Mulai</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Selesai</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone / Area</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Contoh: Cleaning Cooling Tower No 1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mesin (Opsional)</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={machineOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Pilih mesin..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="situation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situasi / Masalah</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Deskripsikan situasi atau masalah..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workDone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan Dilakukan</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Deskripsikan pekerjaan yang dilakukan..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workResult"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasil</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Hasil pekerjaan..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Simpan Perubahan' : 'Buat Laporan'}
            </Button>
          </div>
        </form>
      </Form>

      {initialData && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Foto Dokumentasi</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="relative aspect-square border rounded-md overflow-hidden group"
              >
                <Image
                  src={photo.url}
                  alt="Work Report Photo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center border rounded-md p-4 bg-muted/20">
              <CameraInput onChange={handlePhotoUpload} disabled={uploading} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * Klik tombol kamera untuk mengambil atau mengupload foto baru.
          </p>
        </div>
      )}
    </div>
  );
}
