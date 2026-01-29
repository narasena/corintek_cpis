import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IClientPersonnel } from '@/types/client.type';

interface ISelectClientPersonnelProps<TFormAttributes extends FieldValues> {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  data: IClientPersonnel[];
}

function SelectClientPersonnelContent({
  data,
  selectedValues,
  togglePersonnel,
}: {
  data: IClientPersonnel[];
  selectedValues: string[];
  togglePersonnel: (id: string) => void;
}) {
  // Add error handling for empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-background border border-border rounded-md shadow-xl ring-1 ring-ring/10 p-4 text-center text-sm text-muted-foreground">
        No client personnel available
      </div>
    );
  }

  return (
    <div className="w-full bg-background border border-border rounded-md shadow-xl ring-1 ring-ring/10 max-h-60 overflow-y-auto">
      {data.map(clientPersonnel => {
        const isSelected = selectedValues.includes(clientPersonnel.personnelId);
        return (
          <div
            key={clientPersonnel.id}
            className={`flex items-center justify-between p-2 cursor-pointer hover:bg-accent ${
              isSelected ? 'bg-accent' : ''
            }`}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              togglePersonnel(clientPersonnel.personnelId);
            }}
          >
            <span className="text-sm">
              {clientPersonnel.personnel.firstName}{' '}
              {clientPersonnel.personnel.lastName}
            </span>
            {isSelected && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-background rounded-full"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SelectClientPersonnel<TFormAttributes extends FieldValues>(
  props: ISelectClientPersonnelProps<TFormAttributes>
) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedValues = (props.field.value as string[]) || [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Add error handling for data
  if (!props.data || props.data.length === 0) {
    return (
      <div className="w-full">
        <Button
          ref={buttonRef}
          type="button"
          variant="outline"
          className="w-full justify-between"
          disabled
        >
          No client personnel available
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full relative">
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
                onClick={e => {
                  e.stopPropagation();
                  removePersonnel(selectedValues[index]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Button */}
      <div className="relative">
        <Button
          ref={buttonRef}
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={handleToggle}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length} PIC Klien dipilih`
            : 'Pilih PIC Klien'}
        </Button>

        {/* Inline Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="bg-background border border-border rounded-md shadow-xl ring-1 ring-ring/10 max-h-60 overflow-y-auto mt-1"
            onClick={e => e.stopPropagation()}
          >
            <SelectClientPersonnelContent
              data={props.data}
              selectedValues={selectedValues}
              togglePersonnel={togglePersonnel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
