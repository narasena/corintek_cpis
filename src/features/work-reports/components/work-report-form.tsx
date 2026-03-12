'use client';

import { useTransition, useEffect, useRef, useState } from 'react';
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
  getWorkReportByIdAction,
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
  workReportId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function WorkReportForm({
  projectId,
  workReportId,
  onSuccess,
  onCancel,
}: IWorkReportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<WorkReportRow | null>(null);

  const isEditMode = !!workReportId;
  const effectiveData = fetchedData || undefined;
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [statusIntent, setStatusIntent] = useState<'DRAFT' | 'SUBMITTED'>(
    effectiveData?.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT'
  );
  const statusIntentRef = useRef<'DRAFT' | 'SUBMITTED'>(
    effectiveData?.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT'
  );
  const [machineOptions, setMachineOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Photo State Management
  const [existingPhotos, setExistingPhotos] = useState<
    {
      id: string;
      url: string;
      caption: string | null;
      type: 'BEFORE' | 'AFTER' | 'GENERAL';
    }[]
  >((effectiveData?.photos as any) || []);

  const [pendingPhotos, setPendingPhotos] = useState<
    {
      id: string;
      file: File;
      previewUrl: string;
      type: 'BEFORE' | 'AFTER' | 'GENERAL';
    }[]
  >([]);

  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const deletedPhotoIdsRef = useRef<string[]>([]);

  // Keep ref in sync with state to avoid stale closure in async onSubmit
  useEffect(() => {
    deletedPhotoIdsRef.current = deletedPhotoIds;
  }, [deletedPhotoIds]);

  // Fetch work report data when in edit mode
  useEffect(() => {
    if (workReportId) {
      // Reset fetchedData to ensure we always get fresh data when dialog reopens
      // This handles the case where same workReportId is opened after close
      setFetchedData(null);
      setIsLoading(true);
      getWorkReportByIdAction(workReportId).then(res => {
        if (res.success && res.data) {
          setFetchedData(res.data as WorkReportRow);
        } else {
          const errorMsg =
            (res as { message?: string }).message || 'Terjadi kesalahan';
          toast.error('Gagal memuat data laporan', {
            description: errorMsg,
          });
        }
        setIsLoading(false);
      });
    }
  }, [workReportId]);

  // Reset photo state when form loads with effectiveData (edit mode)
  useEffect(() => {
    if (effectiveData) {
      setPendingPhotos([]);
      setDeletedPhotoIds([]);
      // Reset existingPhotos to match the current work report's photos
      setExistingPhotos((effectiveData?.photos as any) || []);
    }
  }, [effectiveData?.id]);

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
            label: `${m.type.replace(/_/g, ' ')} #${m.unitNumber}`,
            value: m.id,
          }))
        );
      }
    });
  }, [projectId]);

  const form = useForm<CreateWorkReportInput>({
    resolver: zodResolver(WorkReportSchema),
    defaultValues: effectiveData
      ? {
          projectId,
          date: new Date(effectiveData.date),
          timeStart: effectiveData.timeStart ?? undefined,
          timeEnd: effectiveData.timeEnd ?? undefined,
          zone: effectiveData.zone ?? undefined,
          situation: effectiveData.situation,
          workDone: effectiveData.workDone,
          workResult: effectiveData.workResult,
          machineIds: effectiveData.machines.map(m => m.id),
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

  // Reset form values when effectiveData changes (after fetch completes)
  useEffect(() => {
    if (effectiveData) {
      form.reset({
        projectId,
        date: new Date(effectiveData.date),
        timeStart: effectiveData.timeStart ?? undefined,
        timeEnd: effectiveData.timeEnd ?? undefined,
        zone: effectiveData.zone ?? undefined,
        situation: effectiveData.situation,
        workDone: effectiveData.workDone,
        workResult: effectiveData.workResult,
        machineIds: effectiveData.machines.map(m => m.id),
      });
    }
  }, [effectiveData?.id, form, projectId]);

  const handlePhotoUpload =
    (type: 'BEFORE' | 'AFTER' | 'GENERAL') =>
    (_url: string | null, file?: File | null) => {
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPendingPhotos(prev => [
          ...prev,
          { id: `temp-${Date.now()}-${Math.random()}`, file, previewUrl, type },
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
        const intent = statusIntentRef.current;
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
        formData.append('status', intent);

        if (data.machineIds) {
          data.machineIds.forEach(id => formData.append('machineIds', id));
        }

        let result;
        let reportId = effectiveData?.id;

        if (reportId) {
          formData.append('id', reportId);
          result = await updateWorkReportAction(formData);
        } else {
          // For CREATE: Send photos in the same request for transactional handling
          if (pendingPhotos.length > 0) {
            setSubmitStatus(
              `Menyimpan & Mengupload ${pendingPhotos.length} foto...`
            );
            pendingPhotos.forEach(p => {
              if (p.type === 'BEFORE') formData.append('photos_BEFORE', p.file);
              else if (p.type === 'AFTER')
                formData.append('photos_AFTER', p.file);
              else formData.append('photos', p.file);
            });
          }
          result = await createWorkReportAction(formData);
        }

        if (!result.success) {
          toast.error('Gagal menyimpan laporan', {
            description: result.error || 'Terjadi kesalahan',
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
        let uploadErrors = false;
        if (effectiveData?.id && pendingPhotos.length > 0) {
          setSubmitStatus(`Mengupload ${pendingPhotos.length} foto...`);
          const uploadPromises = pendingPhotos.map(photo => {
            const fd = new FormData();
            fd.append('file', photo.file);
            fd.append('workReportId', reportId!);
            fd.append('projectId', projectId);
            fd.append('skipRevalidate', 'true'); // Batch mode
            fd.append('type', photo.type);
            return uploadWorkReportPhotoAction(fd);
          });

          const uploadResults = await Promise.all(uploadPromises);

          // Handle partial successes
          const successfulUploads: typeof existingPhotos = [];
          const failedPendingIds: string[] = [];

          uploadResults.forEach((res, index) => {
            const photo = pendingPhotos[index];
            if (res.success && (res as any).id) {
              successfulUploads.push({
                id: (res as any).id,
                url: (res as any).url,
                caption: null,
                type: photo.type,
              });
            } else {
              failedPendingIds.push(photo.id);
            }
          });

          // Move successful uploads to existingPhotos (with duplicate check)
          if (successfulUploads.length > 0) {
            setExistingPhotos(prev => {
              const newPhotos = successfulUploads.filter(
                newPhoto =>
                  !prev.some(existing => existing.url === newPhoto.url)
              );
              return [...prev, ...newPhotos];
            });
            setPendingPhotos(prev =>
              prev.filter(p => failedPendingIds.includes(p.id))
            );
          }

          if (failedPendingIds.length > 0) {
            uploadErrors = true;
            // Get error details from first failure if available
            const firstFailure = uploadResults.find(r => !r.success);
            const errorMessage =
              firstFailure && 'message' in firstFailure
                ? (firstFailure as any).message
                : 'Unknown error';

            toast.error(`${failedPendingIds.length} foto gagal diupload`, {
              description: `Error: ${errorMessage}. Laporan tersimpan, silakan coba upload ulang foto.`,
              duration: 5000,
            });
          }
        }

        // 3. Delete Removed Photos (use ref to avoid stale closure)
        const photoIdsToDelete = deletedPhotoIdsRef.current;
        if (photoIdsToDelete.length > 0) {
          setSubmitStatus('Menghapus foto lama...');
          const deletePromises = photoIdsToDelete.map(id => {
            const fd = new FormData();
            fd.append('photoId', id);
            fd.append('workReportId', reportId!);
            fd.append('projectId', projectId);
            return deleteWorkReportPhotoAction(fd);
          });
          await Promise.all(deletePromises);

          // Remove deleted photos from existingPhotos state immediately
          setExistingPhotos(prev =>
            prev.filter(p => !photoIdsToDelete.includes(p.id))
          );
          setDeletedPhotoIds([]);
          deletedPhotoIdsRef.current = [];
        }

        // 4. Final Revalidation
        setSubmitStatus('Memuat ulang data...');
        await revalidateWorkReportPathAction(projectId, reportId);

        if (!uploadErrors) {
          toast.success(
            intent === 'SUBMITTED'
              ? 'Laporan berhasil dikirim'
              : effectiveData
                ? 'Laporan diperbarui'
                : 'Laporan dibuat',
            {
              description: 'Data dan foto berhasil disimpan',
            }
          );
          onSuccess();
        } else {
          // If upload errors occurred, DO NOT close the dialog (don't call onSuccess)
          // The user can retry uploading the remaining pending photos.
          setSubmitStatus(''); // Clear loading state
        }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Memuat data...</span>
      </div>
    );
  }

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

          {/* Photo Sections */}
          <div className="space-y-4">
            <h3 className="font-medium">Dokumentasi Foto</h3>

            {/* Before Photos */}
            <PhotoSection
              title="Foto Sebelum (Before)"
              photos={allPhotos.filter(p => p.type === 'BEFORE')}
              onUpload={handlePhotoUpload('BEFORE')}
              onDelete={handleDeletePhoto}
              disabled={isPending}
            />

            {/* After Photos */}
            <PhotoSection
              title="Foto Sesudah (After)"
              photos={allPhotos.filter(p => p.type === 'AFTER')}
              onUpload={handlePhotoUpload('AFTER')}
              onDelete={handleDeletePhoto}
              disabled={isPending}
            />

            {/* General/Legacy Photos */}
            {allPhotos.some(p => p.type === 'GENERAL' || !p.type) && (
              <PhotoSection
                title="Foto Lainnya (General)"
                photos={allPhotos.filter(p => p.type === 'GENERAL' || !p.type)}
                onUpload={handlePhotoUpload('GENERAL')}
                onDelete={handleDeletePhoto}
                disabled={isPending}
              />
            )}
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
            <Button
              type="submit"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                statusIntentRef.current = 'DRAFT';
                setStatusIntent('DRAFT');
              }}
            >
              {isPending && statusIntent === 'DRAFT' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {submitStatus || 'Menyimpan...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Draft
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                (effectiveData ? effectiveData.status !== 'DRAFT' : false)
              }
              onClick={() => {
                statusIntentRef.current = 'SUBMITTED';
                setStatusIntent('SUBMITTED');
              }}
            >
              {isPending && statusIntent === 'SUBMITTED' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {submitStatus || 'Mengirim...'}
                </>
              ) : (
                'Kirim ke PIC'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function PhotoSection({
  title,
  photos,
  onUpload,
  onDelete,
  disabled,
}: {
  title: string;
  photos: {
    id: string;
    url: string;
    isTemp?: boolean;
    type?: 'BEFORE' | 'AFTER' | 'GENERAL';
  }[];
  onUpload: (url: string | null, file?: File | null) => void;
  onDelete: (id: string, isTemp: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="border rounded-md p-4 bg-gray-50/50">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map(photo => (
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
                onClick={() => onDelete(photo.id, !!photo.isTemp)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center border border-dashed rounded-md p-4 bg-white hover:bg-gray-50 transition-colors min-h-[120px]">
          <CameraInput onChange={onUpload} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
