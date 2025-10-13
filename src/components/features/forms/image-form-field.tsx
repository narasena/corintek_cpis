import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconUserCircle } from '@tabler/icons-react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

interface IImageFormFieldProps<TFormAttributes extends FieldValues> {
  label?: string;
  form: UseFormReturn<TFormAttributes>;
  avatar: {
    key: Path<TFormAttributes>;
    previewUrl: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export default function ImageFormField<TFormAttributes extends FieldValues>(
  props: IImageFormFieldProps<TFormAttributes>
) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="w-40">{props.label || 'Upload Foto'}</Label>
      <FormField
        control={props.form.control}
        name={props.avatar.key}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex items-center gap-6">
                <Avatar className="size-25 rounded-full">
                  <AvatarImage src={props.avatar.previewUrl || undefined} />
                  <AvatarFallback className="bg-gray-400 p-3">
                    <IconUserCircle className="size-full text-slate-700" />
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  className="w-full !h-10 !p-0 rounded-md border-none bg-[#4B5563] text-sm text-white file:!cursor-pointer file:h-full file:border-0 file:bg-blue-500 file:px-4 file:text-white hover:file:bg-blue-600"
                  onChange={e => {
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
  );
}
