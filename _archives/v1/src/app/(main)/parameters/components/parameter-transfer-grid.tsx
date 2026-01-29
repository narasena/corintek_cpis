'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { IParameter } from '@/types/parameter.type';
import { Search } from 'lucide-react';

interface ParameterTransferGridProps {
  title: string;
  parameters: IParameter[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ParameterTransferGrid({
  title,
  parameters,
  selectedIds,
  onSelectionChange,
}: ParameterTransferGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParameters = parameters.filter(param =>
    param?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredParameters.map(p => p.id as string));
    } else {
      onSelectionChange([]);
    }
  };

  const handleItemSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="p-3 border-b">
        <h3 className="font-medium mb-2">{title}</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari parameter..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedIds.length === filteredParameters.length &&
              filteredParameters.length > 0
            }
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Pilih Semua</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filteredParameters.map(parameter => (
            <div
              key={parameter.id}
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
            >
              <Checkbox
                checked={selectedIds.includes(parameter.id as string)}
                onCheckedChange={checked =>
                  handleItemSelect(parameter.id as string, checked as boolean)
                }
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{parameter.name}</div>
                {parameter.description !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    {parameter.description as string}
                  </div>
                )}
                {parameter.unit !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Unit: {parameter.unit as string}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
