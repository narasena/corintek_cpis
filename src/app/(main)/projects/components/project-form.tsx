'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  getProjectAssignmentsAction,
  setProjectAssignmentsAction,
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
import { getAllUsersAction } from '@/features/users/actions';
import type { TUserResponse } from '@/@types/user.type';
import { MultiSelect } from '@/components/multi-select';

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
  const [isProjectPending, startProjectTransition] = useTransition();
  const [isAssignmentPending, startAssignmentTransition] = useTransition();
  const [users, setUsers] = useState<TUserResponse[]>([]);
  const [projectPicUserId, setProjectPicUserId] = useState<string>('none');
  const [clientPicUserId, setClientPicUserId] = useState<string>('none');
  const [technicianUserIds, setTechnicianUserIds] = useState<string[]>([]);

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
      machines: defaultValues?.machines || [],
    },
  });

  const onSubmit = (data: TCreateProject) => {
    startProjectTransition(async () => {
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

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!defaultValues?.id) return;

    (async () => {
      const [usersRes, assignmentsRes] = await Promise.all([
        getAllUsersAction(),
        getProjectAssignmentsAction(defaultValues.id),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      } else {
        toast.error(usersRes.error || 'Gagal mengambil data pengguna');
      }

      if (assignmentsRes.success && assignmentsRes.data) {
        const assignments = assignmentsRes.data as Array<{
          userId: string;
          role: 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC';
        }>;

        setProjectPicUserId(
          assignments.find(a => a.role === 'PROJECT_PIC')?.userId ?? 'none'
        );
        setClientPicUserId(
          assignments.find(a => a.role === 'CLIENT_PIC')?.userId ?? 'none'
        );
        setTechnicianUserIds(
          assignments.filter(a => a.role === 'TECHNICIAN').map(a => a.userId)
        );
      } else {
        toast.error(assignmentsRes.error || 'Gagal mengambil data penugasan');
      }
    })();
  }, [defaultValues?.id, mode]);

  const activeUsers = useMemo(
    () => users.filter(u => u.isActive && !u.isBlocked && !u.deletedAt),
    [users]
  );

  const projectPicOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'SUPERVISOR')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const clientPicOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'CLIENT_SUPERVISOR')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const technicianOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'TECHNICIAN' || u.role === 'CLIENT_TECHNICIAN')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const saveAssignments = () => {
    if (mode !== 'edit') return;
    if (!defaultValues?.id) {
      toast.error('ID proyek tidak ditemukan');
      return;
    }

    startAssignmentTransition(async () => {
      const assignments: Array<{
        userId: string;
        role: 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC';
      }> = [];

      if (projectPicUserId !== 'none') {
        assignments.push({ userId: projectPicUserId, role: 'PROJECT_PIC' });
      }

      for (const userId of technicianUserIds) {
        assignments.push({ userId, role: 'TECHNICIAN' });
      }

      if (clientPicUserId !== 'none') {
        assignments.push({ userId: clientPicUserId, role: 'CLIENT_PIC' });
      }

      const result = await setProjectAssignmentsAction({
        projectId: defaultValues.id,
        assignments,
      });

      if (result.success) {
        toast.success('Penugasan berhasil disimpan');
      } else {
        toast.error(result.error || 'Gagal menyimpan penugasan');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Information */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-0 lg:h-fit">
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

            {mode === 'edit' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Penugasan
                </h3>

                <div className="space-y-2">
                  <FormLabel>PIC Project</FormLabel>
                  <Select
                    value={projectPicUserId}
                    onValueChange={setProjectPicUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PIC Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">- Tidak Ada -</SelectItem>
                      {projectPicOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Teknisi</FormLabel>
                  <MultiSelect
                    options={technicianOptions}
                    selected={technicianUserIds}
                    onChange={setTechnicianUserIds}
                    placeholder="Pilih teknisi..."
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>PIC Klien</FormLabel>
                  <Select
                    value={clientPicUserId}
                    onValueChange={setClientPicUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PIC Klien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">- Tidak Ada -</SelectItem>
                      {clientPicOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={isAssignmentPending}
                  onClick={saveAssignments}
                >
                  {isAssignmentPending ? 'Menyimpan...' : 'Simpan Penugasan'}
                </Button>
              </div>
            )}
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
          <Button type="submit" disabled={isProjectPending}>
            {isProjectPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
