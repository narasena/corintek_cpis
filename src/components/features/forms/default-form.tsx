import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { IconInfoSquareFilled } from '@tabler/icons-react';
import z from 'zod';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Button } from '../../ui/button';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import ImageFormField from './image-form-field';
import { Spinner } from '@/components/ui/spinner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import FieldSelector from './field-selector';

interface IFormFieldTypeDefault {
  type: 'default';
  className?: string;
  formFields: IFormFields[];
}

interface IFormFieldTypeAccordion {
  type: 'accordion';
  accordionType?: 'single' | 'multiple';
  accordions: IAccordionDataFormatted[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

type TFormFieldTypeSelector = IFormFieldTypeDefault | IFormFieldTypeAccordion;

interface IDefaultFormProps<TFormAttributes extends FieldValues> {
  form: UseFormReturn<TFormAttributes>;
  onSubmit: (data: TFormAttributes) => void;
  onInvalid: (errors: Record<string, unknown>) => void;
  avatar?: {
    key: Path<TFormAttributes>;
    previewUrl: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  validationSchema: z.ZodObject<{
    [K in keyof TFormAttributes]: z.ZodType<TFormAttributes[K]>;
  }>;
  isLoading?: boolean;
  formFieldSelector: TFormFieldTypeSelector;
}

export interface IAccordionDataFormatted {
  title: string | React.ReactNode;
  value: string;
  description?: string | React.ReactNode;
  className?: {
    title?: string;
    content?: string;
    formFields?: string;
  };
  fields: IFormFields[];
  children?: IAccordionDataFormatted[];
}

export default function DefaultForm<TFormAttributes extends FieldValues>(
  props: IDefaultFormProps<TFormAttributes>
) {
  const { formFieldSelector } = props;
  function RenderFormField({ formField }: { formField: IFormFields }) {
    return (
      <FormField
        key={formField.name}
        control={props.form.control}
        name={formField.name as keyof TFormAttributes as Path<TFormAttributes>}
        render={({ field, formState }) => (
          <FormItem
            className={
              formField.type === EFieldType.BOOLEAN
                ? 'col-span-2'
                : (formField.className ?? '')
            }
          >
            {![EFieldType.BOOLEAN, EFieldType.SEPARATOR].includes(
              formField.type
            ) && (
              <FormLabel>
                <span className="pl-2 font-semibold">{formField.label}</span>{' '}
                {formField.description && (
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger>
                      <IconInfoSquareFilled className="size-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="!max-w-[160px] flex flex-wrap">
                      <p>{formField.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {formField.required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <FieldSelector<TFormAttributes>
                formField={formField}
                renderProps={{ field, formState }}
              />
            </FormControl>
            <FormDescription></FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  function FormFieldsGenerator({
    formFields,
    className,
  }: {
    formFields: IFormFields[];
    className?: string;
  }) {
    return (
      <div className={cn('grid grid-cols-2 gap-4 mb-4', className)}>
        {formFields.map((formField, index) => (
          <RenderFormField key={index} formField={formField} />
        ))}
      </div>
    );
  }

  function AccordionForm({
    accordionType,
    accordions,
    value,
    onValueChange,
  }: {
    accordionType?: 'single' | 'multiple';
    accordions: IAccordionDataFormatted[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
  }) {
    const type = accordionType || 'multiple';

    const accordionProps =
      type === 'single'
        ? {
            type: 'single' as const,
            collapsible: true,
            value: value as string,
            onValueChange: onValueChange as (value: string) => void,
          }
        : {
            type: 'multiple' as const,
            value: value as string[],
            onValueChange: onValueChange as (value: string[]) => void,
          };

    return (
      <Accordion {...accordionProps}>
        {accordions.map(accordion => {
          const { children } = accordion;
          return (
            <AccordionItem key={accordion.value} value={accordion.value}>
              <AccordionTrigger
                className={cn(
                  'mb-3 bg-primary hover:bg-blue-800 text-white hover:no-underline px-6',
                  accordion.className?.title || ''
                )}
              >
                {accordion.title}
              </AccordionTrigger>
              <AccordionContent
                className={cn('', accordion.className?.content)}
              >
                {accordion.description &&
                typeof accordion.description === 'string' ? (
                  <p>{accordion.description}</p>
                ) : (
                  (accordion.description as React.ReactNode)
                )}
                {accordion.fields.length > 0 && (
                  <FormFieldsGenerator
                    formFields={accordion.fields}
                    className={accordion.className?.formFields}
                  />
                )}
                {children &&
                  children.map(child => (
                    <AccordionItem key={child.value} value={child.value}>
                      <AccordionTrigger
                        className={cn(
                          'mb-3 bg-primary hover:bg-blue-800 text-white hover:no-underline px-6',
                          child.className?.title || ''
                        )}
                      >
                        {child.title}
                      </AccordionTrigger>
                      <AccordionContent
                        className={cn('', child.className?.content)}
                      >
                        {child.description &&
                        typeof child.description === 'string' ? (
                          <p>{child.description}</p>
                        ) : (
                          (child.description as React.ReactNode)
                        )}
                        {child.fields.length > 0 && (
                          <FormFieldsGenerator
                            formFields={child.fields}
                            className={child.className?.formFields}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }

  function FormSelector() {
    if (formFieldSelector.type === 'accordion') {
      return (
        <AccordionForm
          accordionType={formFieldSelector.accordionType}
          accordions={formFieldSelector.accordions}
          value={formFieldSelector.value}
          onValueChange={formFieldSelector.onValueChange}
        />
      );
    } else if (formFieldSelector.type === 'default') {
      return (
        <FormFieldsGenerator
          formFields={formFieldSelector.formFields}
          className={formFieldSelector.className}
        />
      );
    }
  }

  return (
    <Form {...props.form}>
      <form
        onSubmit={props.form.handleSubmit(props.onSubmit, props.onInvalid)}
        className="space-y-2"
      >
        {props.avatar && (
          <ImageFormField form={props.form} avatar={props.avatar} />
        )}
        <FormSelector />
        <span className="text-xs font-medium !mb-5">
          {`(`}
          <span className="text-red-500">*</span>
          {`) Wajib diisi`}
        </span>
        <Button
          className={`w-full ${props.isLoading ? 'cursor-not-allowed bg-gray-700' : ''}`}
          type="submit"
          disabled={props.isLoading}
        >
          {props.isLoading ? <Spinner /> : ''} Submit
        </Button>
      </form>
    </Form>
  );
}
