import { TClientCreationAttributes } from "@/types/client.type";
import { useForm } from "react-hook-form";
import { clientCreationSchema } from "../schemas/clientSchema";
import { zodResolver } from "@hookform/resolvers/zod";

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
}