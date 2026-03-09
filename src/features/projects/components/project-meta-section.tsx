import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UseFormReturn } from 'react-hook-form';
import type { TCreateProject, TProjectType } from '@/features/projects/types';
import { ProjectStatusEnum } from '@/features/projects/types';
import type { TClientResponse } from '@/@types/client.type';
import { ProjectTypeSelect } from './project-type-select';
import { ProjectParentSelect } from './project-parent-select';
import { ProjectContractTypeSelect } from './project-contract-type-select';
import { ProjectWorkCategorySelect } from './project-work-category-select';
import { ProfileSelector } from '@/features/parameter-limit-profiles/components/profile-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectMetaSectionProps {
  form: UseFormReturn<TCreateProject>;
  clients: TClientResponse[];
}

export function ProjectMetaSection({ form, clients }: ProjectMetaSectionProps) {
  const projectType = form.watch('projectType') as TProjectType | undefined;
  const clientId = form.watch('clientId') || null;

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="pb-3 border-b mb-4">
          <CardTitle className="text-sm font-semibold">
            Informasi Utama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <FormControl>
                  <Combobox
                    options={clients.map(c => ({ label: c.name, value: c.id }))}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Pilih klien..."
                    searchPlaceholder="Cari klien..."
                    emptyMessage="Klien tidak ditemukan"
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
        </CardContent>
      </Card>

      <Card className="shadow-none bg-muted/20">
        <CardHeader className="pb-3 border-b mb-4 bg-muted/30">
          <CardTitle className="text-sm font-semibold">
            Jadwal & Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value as Date | undefined}
                      onChange={field.onChange}
                      placeholder="Pilih tanggal"
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
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Selesai</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value as Date | undefined}
                      onChange={field.onChange}
                      placeholder="Pilih tanggal"
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
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-3 border-b mb-4">
          <CardTitle className="text-sm font-semibold">
            Detail Kontrak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Proyek</FormLabel>
                  <FormControl>
                    <ProjectTypeSelect
                      value={(field.value as 'UTAMA' | 'ADDENDUM') || 'UTAMA'}
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
                  <FormLabel>Jenis Kontrak</FormLabel>
                  <FormControl>
                    <ProjectContractTypeSelect
                      value={
                        (field.value as 'DIRECT' | 'SUBCONTRACT') || 'DIRECT'
                      }
                      onChange={field.onChange}
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
              name="workCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Pekerjaan</FormLabel>
                  <FormControl>
                    <ProjectWorkCategorySelect
                      value={
                        (field.value as
                          | 'OPERATIONAL'
                          | 'CONSTRUCTION'
                          | 'AD_HOC') || 'OPERATIONAL'
                      }
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warrantyMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garansi (Bulan)</FormLabel>
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
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-3 border-b mb-4">
          <CardTitle className="text-sm font-semibold">Lainnya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            name="parameterLimitProfileId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profil Limit Parameter</FormLabel>
                <FormControl>
                  <ProfileSelector
                    value={field.value ?? null}
                    onChange={field.onChange}
                    disabled={false}
                    placeholder="Pilih profil limit (opsional)"
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
        </CardContent>
      </Card>
    </div>
  );
}
