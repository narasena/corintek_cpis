'use client';

import { useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import {
  createProjectAction,
  updateProjectAction,
} from '@/features/projects/actions';
import {
  CreateProjectSchema,
  TCreateProject,
  IProject,
} from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';
import { MachineFormSection } from '@/features/machines/components/machine-form-section';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateProjectSchema) as any,
    defaultValues: buildProjectFormDefaultValues(defaultValues),
  });

  const selectedClientId = useWatch({
    control: form.control,
    name: 'clientId',
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-[calc(90vh-140px)] min-h-[500px] max-h-[900px]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Project Information */}
          <div className="lg:col-span-5 h-full overflow-y-auto p-6 space-y-4 bg-muted/5">
            <h3 className="font-semibold text-lg border-b pb-2">
              Informasi Proyek
            </h3>

            <ProjectMetaSection form={form} clients={clients} />
            <ProjectAssignmentsSection
              mode={mode}
              projectId={defaultValues?.id}
              projectClientId={selectedClientId}
              form={form}
            />
          </div>

          {/* Right Column: Machine List */}
          <div className="lg:col-span-7 h-full overflow-y-auto p-6 lg:border-l space-y-4">
            <MachineFormSection control={form.control} />
          </div>
        </div>

        <div className="shrink-0 p-4 px-6 border-t bg-background flex justify-end gap-2 z-10">
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
