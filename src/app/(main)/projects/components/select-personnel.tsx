import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IPersonnelGroup } from '@/types/project.type';

interface ISelectPersonnelProps<TFormAttributes extends FieldValues> {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  dataGroup: IPersonnelGroup[];
}

export function SelectPersonnel<TFormAttributes extends FieldValues>(
  props: ISelectPersonnelProps<TFormAttributes>
) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedValues = (props.field.value as string[]) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const togglePersonnel = (personnelId: string) => {
    const newValues = selectedValues.includes(personnelId)
      ? selectedValues.filter(id => id !== personnelId)
      : [...selectedValues, personnelId];
    props.field.onChange(newValues.length > 0 ? newValues : []);
  };

  const removePersonnel = (personnelId: string) => {
    const newValues = selectedValues.filter(id => id !== personnelId);
    props.field.onChange(newValues);
  };

  const getSelectedPersonnelNames = () => {
    const allPersonnel = props.dataGroup.flatMap(group => group.personnel);
    return allPersonnel
      .filter(personnel => selectedValues.includes(personnel.id))
      .map(personnel => `${personnel.firstName} ${personnel.lastName}`);
  };

  return (
    <div className="w-full">
      {/* Selected personnel display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {getSelectedPersonnelNames().map((name, index) => (
            <Badge
              key={selectedValues[index]}
              variant="secondary"
              className="text-xs"
            >
              {name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removePersonnel(selectedValues[index])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown for selection */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length} PIC Corintek dipilih`
            : 'Pilih PIC Corintek'}
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {props.dataGroup.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="px-2 py-1 bg-gray-100 text-sm font-medium text-gray-700">
                  {group.role}
                </div>
                {group.personnel.map(personnel => {
                  const isSelected = selectedValues.includes(personnel.id);
                  return (
                    <div
                      key={personnel.id}
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => togglePersonnel(personnel.id)}
                    >
                      <span className="text-sm">
                        {personnel.firstName} {personnel.lastName}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
