import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectTypeEnum,
  type IProjectTypeSelectProps,
  type TProjectType,
} from '@/features/projects/types';

const PROJECT_TYPE_LABELS: Record<TProjectType, string> = {
  UTAMA: 'Proyek Utama',
  ADDENDUM: 'Addendum',
};

export function ProjectTypeSelect({
  value,
  onChange,
  disabled,
}: IProjectTypeSelectProps) {
  const handleChange = (next: string) => {
    onChange(next as TProjectType);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih tipe proyek" />
      </SelectTrigger>
      <SelectContent>
        {ProjectTypeEnum.options.map(type => (
          <SelectItem key={type} value={type}>
            {PROJECT_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
