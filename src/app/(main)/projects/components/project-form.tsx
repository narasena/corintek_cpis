'use client';

import { useTransition } from 'react';
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
import { CreateProjectSchema, TCreateProject, IProject } from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';
import { MachineFormSection } from '@/components/machine-form-section';
import { ProjectMetaSection } from './project-meta-section';
import { ProjectAssignmentsSection } from './project-assignments-section';
import { buildProjectFormDefaultValues } from './project-form-defaults';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  defaultValues?: IProject;
  clients: TClientResponse[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({
  mode,
  defaultValues,
  clients,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [isProjectPending, startProjectTransition] = useTransition();
  const form = useForm<TCreateProject>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: buildProjectFormDefaultValues(defaultValues),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Information */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-0 lg:h-fit">
            <h3 className="font-semibold text-lg border-b pb-2">
              Informasi Proyek
            </h3>

            <ProjectMetaSection form={form} clients={clients} />
            <ProjectAssignmentsSection
              mode={mode}
              projectId={defaultValues?.id}
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
          <Button type="submit" disabled={isProjectPending}>
            {isProjectPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
