import { description } from "@/components/chart-area-interactive";
import { defaultSchemaMessage } from "@/features/schemas/defaultSchema";
import z from "zod";

export const clientCreationSchema = z.object({
  name: z.string(defaultSchemaMessage.only.alphabet).nonempty(
    defaultSchemaMessage.nonempty,
  ),
  email: z.email(defaultSchemaMessage.email).nullable().optional(),
  description: z.string().nullable().optional(),
  phoneNumber: z
    .string(defaultSchemaMessage.only.number)
    .regex(/^[0-9]+$/, { message: defaultSchemaMessage.only.number })
    .min(10, defaultSchemaMessage.min(10))
    .max(17, defaultSchemaMessage.max(17))
    .nullable()
    .optional(),
  address: z.string().nullable().optional(),
  avatarImg: z.file().max(1,defaultSchemaMessage.image_max_file(1)).mime(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'], defaultSchemaMessage.supported_image_format).nullable().optional(),
  websiteUrl: z.url().nullable().optional(),
});
