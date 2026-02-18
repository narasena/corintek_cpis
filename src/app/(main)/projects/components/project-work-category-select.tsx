import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectWorkCategoryEnum,
  type IProjectWorkCategorySelectProps,
  type TProjectWorkCategory,
} from '@/features/projects/types';

const PROJECT_WORK_CATEGORY_LABELS: Record<TProjectWorkCategory, string> = {
  OPERATIONAL: 'Operasional',
  CONSTRUCTION: 'Proyek/Konstruksi',
  AD_HOC: 'Ad Hoc',
};

export function ProjectWorkCategorySelect({
  value,
  onChange,
  disabled,
}: IProjectWorkCategorySelectProps) {
  const handleChange = (next: string) => {
    onChange(next as TProjectWorkCategory);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih pekerjaan" />
      </SelectTrigger>
      <SelectContent>
        {ProjectWorkCategoryEnum.options.map(category => (
          <SelectItem key={category} value={category}>
            {PROJECT_WORK_CATEGORY_LABELS[category]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

