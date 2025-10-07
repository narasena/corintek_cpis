import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IPersonnelGroup } from '@/types/project.type';

interface ISelectPersonnelsProps<TFormAttributes extends FieldValues> {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  dataGroup: IPersonnelGroup[];
}
export function SelectPersonnels<TFormAttributes extends FieldValues>(
  props: ISelectPersonnelsProps<TFormAttributes>
) {
  // Handle both single values and arrays
  const fieldValue = props.field.value;
  const selectValue = Array.isArray(fieldValue)
    ? fieldValue.length > 0
      ? fieldValue[0]
      : undefined
    : fieldValue;

  return (
    <Select
      onValueChange={value =>
        props.field.onChange(value === '' ? undefined : value)
      }
      value={selectValue as string | undefined}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih PIC Klien" />
      </SelectTrigger>
      <SelectContent>
        {props.dataGroup.map((group, index) => (
          <SelectGroup key={index}>
            <SelectLabel>{group.role}</SelectLabel>
            {group.personnels.map(personnel => (
              <SelectItem key={personnel.id} value={personnel.id}>
                {personnel.firstName + ' ' + personnel.lastName}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
