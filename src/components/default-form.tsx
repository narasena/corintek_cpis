import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IconInfoSquareFilled, IconUserCircle } from "@tabler/icons-react";
import { Input } from "./ui/input";
import { IFormFields } from "@/app/(main)/users/data/userFormFields";
import z, { ZodObject, ZodTypeAny } from "zod";
import { JSX } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";

interface IDefaultFormProps <TFormAttributes extends FieldValues> {
  form: UseFormReturn<TFormAttributes>
  onSubmit: (data: TFormAttributes) => void
  onInvalid: (errors: Record<string, unknown>) => void
  avatar: {
    key: Path<TFormAttributes>
    previewUrl: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
  formFields: IFormFields[]
  validationSchema: z.ZodObject<any>
}

export default function DefaultForm<TFormAttributes extends FieldValues> (props: IDefaultFormProps<TFormAttributes>) {
  return(
    <Form {...props.form}>
      <form
        onSubmit={props.form.handleSubmit(props.onSubmit, props.onInvalid)}
        className="space-y-8"
      >
        <div className="flex flex-col gap-3">
          <Label className="w-40">Upload Foto</Label>
          <FormField
            control={props.form.control}
            name={props.avatar.key}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-6">
                    <Avatar className="size-25 rounded-full">
                      <AvatarImage
                        src={props.avatar.previewUrl || undefined}
                      />
                      <AvatarFallback className="bg-gray-400 p-3">
                        <IconUserCircle className='size-full text-slate-700'/>
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      className="w-full !h-10 !p-0 rounded-md border-none bg-[#4B5563] text-sm text-white file:!cursor-pointer file:h-full file:border-0 file:bg-blue-500 file:px-4 file:text-white hover:file:bg-blue-600"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        if (typeof props.avatar.onChange === 'function') {
                          props.avatar.onChange(e);
                        }
                        field.onChange(selectedFile);
                        console.log(
                          'Selected file in onChange:',
                          selectedFile
                            ? `${selectedFile.name} (${selectedFile.size} bytes)`
                            : 'No file'
                        );
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {props.formFields.map(formField => (
            <FormField
              key={formField.name}
              control={props.form.control}
              name={(formField.name as keyof TFormAttributes) as Path<TFormAttributes>}
              render={({ field }) => {
                const fieldSchema: ZodTypeAny = props.validationSchema.shape[
                  formField.name as keyof TFormAttributes
                ];
                const Icon = formField.icon as JSX.ElementType;

                return (
                  <FormItem
                    className={formField.type === 'boolean' ? 'col-span-2' : formField.className? formField.className : ''}
                  >
                    {formField.type !== 'boolean' && (
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
                      {formField.type === 'selectEnum' &&
                      fieldSchema instanceof z.ZodEnum ? (
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
                            {(fieldSchema.options as string[]).map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : formField.type === 'boolean' ? (
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
                                {Icon && (
                                  <Icon className="size-4 text-gray-500" />
                                )}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {formField.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ) : (
                        <Input
                          type={formField.type}
                          placeholder={formField.placeHolder}
                          {...field}
                          value={(field.value as string) || ''}
                        />
                      )}
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}