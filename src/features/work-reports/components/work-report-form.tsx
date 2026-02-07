'use client';

import { useTransition, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Trash2, Loader2, Save } from 'lucide-react';
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
  revalidateWorkReportPathAction,
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
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [machineOptions, setMachineOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Photo State Management
  const [existingPhotos, setExistingPhotos] = useState<
    { id: string; url: string; caption: string | null }[]
  >(initialData?.photos || []);

  const [pendingPhotos, setPendingPhotos] = useState<
    { id: string; file: File; previewUrl: string }[]
  >([]);

  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);

  // Combine for display
  const allPhotos = [
    ...existingPhotos.map(p => ({ ...p, isTemp: false })),
    ...pendingPhotos.map(p => ({
      ...p,
      url: p.previewUrl,
      caption: null,
      isTemp: true,
    })),
  ];

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

  const handlePhotoUpload = (_url: string | null, file?: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingPhotos(prev => [
        ...prev,
        { id: `temp-${Date.now()}-${Math.random()}`, file, previewUrl },
      ]);
    }
  };

  const handleDeletePhoto = (photoId: string, isTemp: boolean) => {
    if (isTemp) {
      setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
    } else {
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
      setDeletedPhotoIds(prev => [...prev, photoId]);
    }
  };

  const onSubmit = (data: CreateWorkReportInput) => {
    startTransition(async () => {
      try {
        setSubmitStatus('Menyimpan data laporan...');
        // 1. Submit the report data first
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
        let reportId = initialData?.id;

        if (reportId) {
          formData.append('id', reportId);
          result = await updateWorkReportAction(formData);
        } else {
          // For CREATE: Send photos in the same request for transactional handling
          if (pendingPhotos.length > 0) {
            setSubmitStatus(
              `Menyimpan & Mengupload ${pendingPhotos.length} foto...`
            );
            pendingPhotos.forEach(p => formData.append('photos', p.file));
          }
          result = await createWorkReportAction(formData);
        }

        if (!result.success) {
          toast.error('Gagal menyimpan laporan', {
            description: result.message || 'Terjadi kesalahan',
          });
          return;
        }

        // Get the report ID from result (for create case) or use existing
        // We cast result to expected shape since we updated the action
        const resultData = (
          result as { success: boolean; data?: { id: string } }
        ).data;
        if (resultData?.id) {
          reportId = resultData.id;
        }

        if (!reportId) {
          toast.error('Gagal mendapatkan ID laporan');
          return;
        }

        // 2. Upload Pending Photos (ONLY for Update mode)
        // For Create, photos are already handled transactionally in the action above.
        if (initialData?.id && pendingPhotos.length > 0) {
          setSubmitStatus(`Mengupload ${pendingPhotos.length} foto...`);
          const uploadPromises = pendingPhotos.map(photo => {
            const fd = new FormData();
            fd.append('file', photo.file);
            fd.append('workReportId', reportId!);
            fd.append('projectId', projectId);
            fd.append('skipRevalidate', 'true'); // Batch mode
            return uploadWorkReportPhotoAction(fd);
          });

          const uploadResults = await Promise.all(uploadPromises);
          const failedUploads = uploadResults.filter(r => !r.success);
          if (failedUploads.length > 0) {
            toast.warning(`${failedUploads.length} foto gagal diupload`, {
              description: 'Silakan coba upload ulang foto yang gagal nanti.',
            });
            // We do NOT return here, we proceed to success for the report itself
          }
        }

        // 3. Delete Removed Photos
        if (deletedPhotoIds.length > 0) {
          setSubmitStatus('Menghapus foto lama...');
          const deletePromises = deletedPhotoIds.map(id => {
            const fd = new FormData();
            fd.append('photoId', id);
            fd.append('workReportId', reportId!);
            fd.append('projectId', projectId);
            return deleteWorkReportPhotoAction(fd);
          });
          await Promise.all(deletePromises);
        }

        // 4. Final Revalidation
        setSubmitStatus('Memuat ulang data...');
        await revalidateWorkReportPathAction(projectId);

        toast.success(initialData ? 'Laporan diperbarui' : 'Laporan dibuat', {
          description: 'Data dan foto berhasil disimpan',
        });
        onSuccess();
      } catch (error) {
        console.error('[WorkReportForm] Error:', error);
        toast.error('Terjadi kesalahan sistem', {
          description:
            error instanceof Error ? error.message : 'Silakan coba lagi.',
        });
      } finally {
        setSubmitStatus('');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Photo Section - Now part of the main flow */}
          <div className="border rounded-md p-4 bg-gray-50/50">
            <h3 className="text-sm font-medium mb-3">Foto Dokumentasi</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Foto akan disimpan saat tombol &quot;Simpan&quot; ditekan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="relative aspect-square border rounded-md overflow-hidden group bg-white"
                >
                  <Image
                    src={photo.url}
                    alt="Work Report Photo"
                    fill
                    className="object-cover"
                  />
                  {photo.isTemp && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                      Menunggu Upload
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id, photo.isTemp)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center border border-dashed rounded-md p-4 bg-white hover:bg-gray-50 transition-colors min-h-[120px]">
                <CameraInput
                  onChange={handlePhotoUpload}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {submitStatus || 'Menyimpan...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Laporan
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
