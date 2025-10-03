import { FieldValues } from 'react-hook-form';
import z from 'zod';
import { NextResponse } from 'next/server';

interface IRequestValidationParams<TFormAttributes extends FieldValues> {
  validationSchema: z.ZodObject<{
    [K in keyof TFormAttributes]: z.ZodType<TFormAttributes[K]>;
  }>;
  data: Partial<TFormAttributes>;
  imageField?: string;
}

export default function requestValidation<TFormAttributes extends FieldValues>(
  params: IRequestValidationParams<TFormAttributes>
):
  | z.infer<typeof params.validationSchema>
  | NextResponse<{ errors: { field: string; message: string }[] }> {
  const schemaWithoutFile = params.imageField
    ? params.validationSchema.omit({ [params.imageField]: true } as {
        [K in keyof TFormAttributes]?: true;
      })
    : params.validationSchema;
  let validatedData: z.infer<typeof schemaWithoutFile>;
  try {
    validatedData = schemaWithoutFile.parse(params.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }
    throw error;
  }
  return validatedData as z.infer<typeof params.validationSchema>;
}
