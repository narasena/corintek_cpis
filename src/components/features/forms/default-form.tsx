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
import FormSelector from './form-selector';
import ImageFormField from './image-form-field';
import { Spinner } from '@/components/ui/spinner';

interface IDefaultFormProps<TFormAttributes extends FieldValues> {
  form: UseFormReturn<TFormAttributes>;
  onSubmit: (data: TFormAttributes) => void;
  onInvalid: (errors: Record<string, unknown>) => void;
  avatar?: {
    key: Path<TFormAttributes>;
    previewUrl: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  formFields: IFormFields[];
  validationSchema: z.ZodObject<{
    [K in keyof TFormAttributes]: z.ZodType<TFormAttributes[K]>;
  }>;
  isLoading?: boolean;
}

export default function DefaultForm<TFormAttributes extends FieldValues>(
  props: IDefaultFormProps<TFormAttributes>
) {
  return (
    <Form {...props.form}>
      <form
        onSubmit={props.form.handleSubmit(props.onSubmit, props.onInvalid)}
        className="space-y-8"
      >
        {props.avatar && (
          <ImageFormField form={props.form} avatar={props.avatar} />
        )}
        <div className="grid grid-cols-2 gap-4">
          {props.formFields.map(formField => (
            <FormField
              key={formField.name}
              control={props.form.control}
              name={
                formField.name as keyof TFormAttributes as Path<TFormAttributes>
              }
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
                    <FormSelector<TFormAttributes>
                      formField={formField}
                      renderProps={{ field, formState }}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
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
