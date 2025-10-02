import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import React, { JSX } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import z from 'zod';

type RenderProps<TFormAttributes extends FieldValues> = {
  field: ControllerRenderProps<TFormAttributes, Path<TFormAttributes>>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFormAttributes>;
};

interface FormSelectorProps<TFormAttributes extends FieldValues> {
  formField: IFormFields;
  schema?: z.ZodObject<{
    [K in keyof TFormAttributes]: z.ZodType<TFormAttributes[K]>;
  }>;
  renderProps: RenderProps<TFormAttributes>;
}

export default function FormSelector<TFormAttributes extends FieldValues>(
  { formField, schema, renderProps }: FormSelectorProps<TFormAttributes>
) {
  const { field, fieldState } = renderProps;
  const isInvalid = fieldState.invalid;
  const disabled = isInvalid; // Consistent disable on error
  const Icon = formField.icon as JSX.ElementType;
  const fieldSchema = schema?.shape[formField.name as keyof TFormAttributes];

  switch (formField.type) {
    case EFieldType.SELECT:
    case EFieldType.ENUM:

      return (
        <Select
          onValueChange={value =>
            field.onChange(value === '' ? undefined : value)
          }
          value={field.value as string | undefined}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Salah Satu" />
          </SelectTrigger>
          <SelectContent>
            {((fieldSchema as z.ZodEnum<TFormAttributes>).options as string[]).map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case EFieldType.BOOLEAN:
      return (
        <div className="flex items-center space-x-2 w-full">
          <Checkbox
            id={field.name}
            checked={field.value as boolean | undefined}
            onCheckedChange={field.onChange}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <Label
            htmlFor={field.name}
            className="w-full hover:bg-primary/30 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 font-normal cursor-pointer"
          >
            <div className="grid gap-1.5">
              <p className="text-sm leading-none font-medium flex items-center gap-2">
                {formField.label}
                {Icon && <Icon className="size-4 text-gray-500" />}
              </p>
              <p className="text-muted-foreground text-sm">
                {formField.description}
              </p>
            </div>
          </Label>
        </div>
      );
    case EFieldType.FILE:
      return (
        <Input
          type="file"
          placeholder={formField.placeHolder}
          {...field}
          disabled={disabled}
        />
      );
    case EFieldType.TEXTAREA:
      return (
        <Textarea
          placeholder={formField.placeHolder}
          {...field}
          disabled={disabled}
        />
      );
    default:
      return (
        <Input
          type={formField.type as React.HTMLInputTypeAttribute}
          placeholder={formField.placeHolder}
          {...field}
          disabled={disabled}
        />
      );
  }
}
