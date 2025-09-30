import { TClientCreationAttributes } from "@/types/client.type";
import { useForm } from "react-hook-form";
import { clientCreationSchema } from "../schemas/clientSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import DefaultForm from "@/components/default-form";
import { useImagePreview } from "@/hooks/useImagePreview";
import { createClientFormFields } from "../data/clientFormFields";

export default function ClientForm() {
  const createClientForm = useForm<TClientCreationAttributes>({
    resolver: zodResolver(clientCreationSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phoneNumber: '',
      websiteUrl: '',
      address: '',
      avatarImg: null
    },
  })

  const { previewUrl, handleImagePreview } = useImagePreview<
      TClientCreationAttributes,
      'avatarImg'
    >();

  return(
    <DefaultForm<TClientCreationAttributes>
        form={createClientForm}
        onSubmit={() => {}}
        onInvalid={() => {}}
        avatar={
          {
            key: 'avatarImg',
            previewUrl: previewUrl || '',
            onChange: handleImagePreview
          }
        }
        formFields={createClientFormFields}
        validationSchema={clientCreationSchema as any}
        />
  )
}