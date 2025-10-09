import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IClientPersonnel } from '@/types/client.type';

interface ISelectClientPersonnelsProps<TFormAttributes extends FieldValues> {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  data: IClientPersonnel[];
}

export function SelectClientPersonnels<TFormAttributes extends FieldValues>(
  props: ISelectClientPersonnelsProps<TFormAttributes>
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
    return props.data
      .filter(personnel => selectedValues.includes(personnel.personnelId))
      .map(
        personnel =>
          `${personnel.personnel.firstName} ${personnel.personnel.lastName}`
      );
  };

  return (
    <div className="w-full">
      {/* Selected personnels display */}
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
            ? `${selectedValues.length} PIC Klien dipilih`
            : 'Pilih PIC Klien'}
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {props.data.map(clientPersonnel => {
              const isSelected = selectedValues.includes(
                clientPersonnel.personnelId
              );
              return (
                <div
                  key={clientPersonnel.id}
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => togglePersonnel(clientPersonnel.personnelId)}
                >
                  <span className="text-sm">
                    {clientPersonnel.personnel.firstName}{' '}
                    {clientPersonnel.personnel.lastName}
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
        )}
      </div>
    </div>
  );
}
