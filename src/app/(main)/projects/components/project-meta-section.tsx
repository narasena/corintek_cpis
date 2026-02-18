import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type {
  TCreateProject,
  TProjectType,
} from '@/features/projects/types';
import { ProjectStatusEnum } from '@/features/projects/types';
import type { TClientResponse } from '@/@types/client.type';
import { ProjectTypeSelect } from './project-type-select';
import { ProjectParentSelect } from './project-parent-select';
import { ProjectContractTypeSelect } from './project-contract-type-select';
import { ProjectWorkCategorySelect } from './project-work-category-select';

interface ProjectMetaSectionProps {
  form: UseFormReturn<TCreateProject>;
  clients: TClientResponse[];
}

const formatDateForInput = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export function ProjectMetaSection({ form, clients }: ProjectMetaSectionProps) {
  const projectType = form.watch('projectType') as TProjectType | undefined;
  const clientId = form.watch('clientId') || null;

  return (
    <>
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    field.value ? formatDateForInput(field.value as Date) : ''
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
                    field.value ? formatDateForInput(field.value as Date) : ''
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
        name="warrantyMonths"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Garansi (bulan)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                placeholder="Contoh: 12"
                value={field.value ?? ''}
                onChange={e =>
                  field.onChange(
                    e.target.value === ''
                      ? undefined
                      : Number(e.target.value)
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        name="projectType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipe Proyek</FormLabel>
            <FormControl>
              <ProjectTypeSelect
                value={(field.value as string) || 'UTAMA'}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contractType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jenis Proyek</FormLabel>
            <FormControl>
              <ProjectContractTypeSelect
                value={(field.value as string) || 'DIRECT'}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="workCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pekerjaan</FormLabel>
            <FormControl>
              <ProjectWorkCategorySelect
                value={(field.value as string) || 'OPERATIONAL'}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parentProjId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Utama</FormLabel>
            <FormControl>
              <ProjectParentSelect
                projectType={projectType || 'UTAMA'}
                clientId={clientId}
                value={field.value ?? null}
                onChange={field.onChange}
              />
            </FormControl>
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
    </>
  );
}
