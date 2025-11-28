import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  onClose,
}: {
  data: IClientPersonnel[];
  selectedValues: string[];
  togglePersonnel: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="w-full bg-background border border-border rounded-md shadow-xl ring-1 ring-ring/10 max-h-60 overflow-y-auto">
      {data.map(clientPersonnel => {
        const isSelected = selectedValues.includes(clientPersonnel.personnelId);
        return (
          <div
            key={clientPersonnel.id}
            className={`flex items-center justify-between p-2 cursor-pointer hover:bg-accent ${
              isSelected ? 'bg-accent/50' : ''
            }`}
            onClick={() => {
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

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
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Position dropdown
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.bottom + 4}px`,
        width: `${rect.width}px`,
        zIndex: 999999,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isOpen, updatePosition]);

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

  const handleClose = () => {
    setIsOpen(false);
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

      {/* Button */}
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

      {/* Portalled Dropdown */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            onClick={handleClose}
            className="outline-none"
          >
            <SelectClientPersonnelContent
              data={props.data}
              selectedValues={selectedValues}
              togglePersonnel={togglePersonnel}
              onClose={handleClose}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
