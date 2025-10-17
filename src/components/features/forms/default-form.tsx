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
  formFields?: IFormFields[];
}

interface IFormFieldTypeAccordion {
  type: 'accordion';
  accordion?: {
    type: 'single' | 'multiple';
    data: IAccordionDataFormatted[];
  };
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
  className?: string;
  fields: IFormFields[];
  children?: IAccordionDataFormatted[];
}

export default function DefaultForm<TFormAttributes extends FieldValues>(
  props: IDefaultFormProps<TFormAttributes>
) {
  const { formFieldSelector } = props;
  const renderFormField = (formField: IFormFields) => (
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
  function FormSelector() {
    if (formFieldSelector.type === 'accordion') {
      <Accordion
        type={formFieldSelector.accordion?.type || 'single'}
        collapsible
      >
        {formFieldSelector.accordion?.data.map((accordionData, index) => (
          <AccordionItem key={index} value={accordionData.value}>
            <AccordionTrigger
              className={cn(
                'mb-3 bg-primary hover:bg-blue-800 text-white hover:no-underline px-6',
                accordionData.className || ''
              )}
            >
              {accordionData.title}
            </AccordionTrigger>
            <AccordionContent className="px-2">
              {accordionData.description &&
              typeof accordionData.description === 'string' ? (
                <p>{accordionData.description}</p>
              ) : (
                (accordionData.description as React.ReactNode)
              )}
              {accordionData.fields.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {accordionData.fields.map(formField =>
                    renderFormField(formField)
                  )}
                </div>
              )}
              {accordionData.children && accordionData.children.length > 0 && (
                <div className="mt-4">
                  <Accordion type="multiple" className="w-full">
                    {accordionData.children.map(
                      (childAccordion, childIndex) => (
                        <AccordionItem
                          key={childIndex}
                          value={childAccordion.value}
                        >
                          <AccordionTrigger
                            className={cn('mb-4', childAccordion.className)}
                          >
                            {childAccordion.title}
                          </AccordionTrigger>
                          <AccordionContent className="px-2">
                            <div className="grid grid-cols-2 gap-4">
                              {childAccordion.fields.map(formField =>
                                renderFormField(formField)
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>;
    } else if (formFieldSelector.type === 'default') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {formFieldSelector.formFields?.map(formField =>
            renderFormField(formField)
          )}
        </div>
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
