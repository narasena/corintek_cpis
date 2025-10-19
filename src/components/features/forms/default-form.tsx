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
  accordions: IAccordionDataFormatted[];
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
  type?: 'single' | 'multiple';
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
            {formField.type !== EFieldType.BOOLEAN && (
              <FormLabel>
                {formField.label}{' '}
                <Tooltip delayDuration={800}>
                  <TooltipTrigger>
                    <IconInfoSquareFilled className="size-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="!max-w-[160px] flex flex-wrap">
                    <p>{formField.description}</p>
                  </TooltipContent>
                </Tooltip>
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
    accordions,
  }: {
    accordions: IAccordionDataFormatted[];
  }) {
    return accordions.map((accordion, accordionIndex) => {
      const { children } = accordion;
      return (
        <Accordion type={accordion.type || 'single'} collapsible>
          <AccordionItem key={accordionIndex} value={accordion.value}>
            <AccordionTrigger
              className={cn(
                'mb-3 bg-primary hover:bg-blue-800 text-white hover:no-underline px-6',
                accordion.className?.title || ''
              )}
            >
              {accordion.title}
            </AccordionTrigger>
            <AccordionContent className={cn('', accordion.className?.content)}>
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
              {children && <AccordionForm accordions={children} />}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    });
  }

  function FormSelector() {
    if (formFieldSelector.type === 'accordion') {
      return <AccordionForm accordions={formFieldSelector.accordions} />;
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
        className="space-y-8"
      >
        {props.avatar && (
          <ImageFormField form={props.form} avatar={props.avatar} />
        )}
        <FormSelector />
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
