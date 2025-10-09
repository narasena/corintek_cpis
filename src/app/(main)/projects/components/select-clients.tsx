import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IClient } from '@/types/client.type';

interface ISelectClientsProps<TFormAttributes extends FieldValues> {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  data: IClient[];
}

export function SelectClients<TFormAttributes extends FieldValues>(
  props: ISelectClientsProps<TFormAttributes>
) {
  return (
    <Select
      onValueChange={value =>
        props.field.onChange(value === '' ? undefined : value)
      }
      value={props.field.value as string | undefined}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Klien" />
      </SelectTrigger>
      <SelectContent>
        {props.data.map(client => (
          <SelectItem key={client.id} value={String(client.id)}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
