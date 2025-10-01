import { useImagePreview } from "@/hooks/useImagePreview";
import useImageUpload from "@/hooks/useImageUpload";
import useAllUsers from "@/hooks/users/useAllUsers";
import { TUserCreationAttributes } from "@/types/user.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userCreationSchema } from "../schemas/userSchema";
import useFormHandleSubmit from "@/hooks/useFormHandleSubmit";

export default function useUsers() {
  const {allUsers} = useAllUsers()

  const { previewUrl, handleImagePreview } = useImagePreview<
      TUserCreationAttributes,
      'avatarImg'
    >();
    const { file, handleUpload, result, setFile, uploading } = useImageUpload();

    const createUserForm = useForm<TUserCreationAttributes>({
        resolver: zodResolver(userCreationSchema),
        defaultValues: {
          firstName: '',
          lastName: '',
          idNumber: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          role: undefined,
          employmentStatus: undefined,
          avatarImg: null,
        },
      });

  const {onSubmitWithImage, onInvalid} = useFormHandleSubmit({
    data: createUserForm,
    form: createUserForm,
    key: 'avatarImg'
  })

  return {
    allUsers,
    previewUrl,
    handleImagePreview,
    file,
    handleUpload,
    result,
    setFile,
    uploading,
    createUserForm,
    onSubmitWithImage,
    onInvalid
  }
}