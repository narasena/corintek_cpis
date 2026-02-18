import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectContractTypeEnum,
  type IProjectContractTypeSelectProps,
  type TProjectContractType,
} from '@/features/projects/types';

const PROJECT_CONTRACT_TYPE_LABELS: Record<TProjectContractType, string> = {
  DIRECT: 'Langsung',
  SUBCONTRACT: 'Subkon',
};

export function ProjectContractTypeSelect({
  value,
  onChange,
  disabled,
}: IProjectContractTypeSelectProps) {
  const handleChange = (next: string) => {
    onChange(next as TProjectContractType);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih jenis proyek" />
      </SelectTrigger>
      <SelectContent>
        {ProjectContractTypeEnum.options.map(type => (
          <SelectItem key={type} value={type}>
            {PROJECT_CONTRACT_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
