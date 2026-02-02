'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';

import {
  createProjectAction,
  updateProjectAction,
} from '@/features/projects/actions';
import {
  CreateProjectSchema,
  TCreateProject,
  IProject,
  ProjectStatusEnum,
} from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';
import { MachineFormSection } from '@/components/machine-form-section';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  defaultValues?: IProject;
  clients: TClientResponse[];
  onSuccess: () => void;
  onCancel: () => void;
}

const formatDateForInput = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export function ProjectForm({
  mode,
  defaultValues,
  clients,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      clientId: defaultValues?.clientId || '',
      description: defaultValues?.description || '',
      quoteNumber: defaultValues?.quoteNumber || '',
      poNumber: defaultValues?.poNumber || '',
      status: defaultValues?.status || 'PENDING',
      startDate: defaultValues?.startDate
        ? new Date(defaultValues.startDate)
        : new Date(),
      endDate: defaultValues?.endDate
        ? new Date(defaultValues.endDate)
        : undefined,
      machines: [], // Machines will be loaded separately if editing
    },
  });

  const onSubmit = (data: TCreateProject) => {
    startTransition(async () => {
      try {
        let result;
        if (mode === 'create') {
          result = await createProjectAction(data);
        } else {
          if (!defaultValues?.id) {
            toast.error('ID proyek tidak ditemukan');
            return;
          }
          // @ts-ignore
          result = await updateProjectAction({ ...data, id: defaultValues.id });
        }

        if (result && result.success) {
          const machineCount = data.machines?.length || 0;
          const machineText =
            machineCount > 0 ? ` dengan ${machineCount} mesin` : '';
          toast.success(
            mode === 'create'
              ? `Proyek berhasil dibuat${machineText}`
              : 'Proyek berhasil diperbarui'
          );
          onSuccess();
        } else {
          toast.error(result?.error || 'Terjadi kesalahan');
        }
      } catch {
        toast.error('Terjadi kesalahan yang tidak terduga');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Information */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Informasi Proyek
            </h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Proyek</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama proyek" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klien</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih klien" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quoteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Penawaran</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Q-2024-001"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor PO</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: PO-2024-001"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? formatDateForInput(field.value as Date)
                            : ''
                        }
                        onChange={e => field.onChange(e.target.valueAsDate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? formatDateForInput(field.value as Date)
                            : ''
                        }
                        onChange={e => field.onChange(e.target.valueAsDate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ProjectStatusEnum.options.map(status => (
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi proyek (opsional)"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Machine List */}
          <div className="lg:col-span-8 lg:border-l lg:pl-6 space-y-4">
            <MachineFormSection control={form.control as any} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
