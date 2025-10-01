import apiInstance from "@/utils/apiInstance";
import errorMessageResponse from "@/utils/errorMessageResponse";
import {
  FieldErrors,
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";

interface IUseFormHandleSubmit<T extends FieldValues> {
  data: T;
  form: UseFormReturn<T>;
  key: Path<T> | keyof T;
}

function isFile(value: unknown): value is File {
  return value instanceof File;
}

export default function useFormHandleSubmit<
  TFormAttributes extends FieldValues,
>(params: IUseFormHandleSubmit<TFormAttributes>) {
  async function onSubmitWithImage() {
    try {
      const dataField = params.form.getValues();
      const fieldKey = String(params.key);
      const fieldValue = params
        .data[params.key as keyof TFormAttributes]?.[0] as unknown;

      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        console.log("onSubmit called");
        console.log("Valid form:", params.form.formState.isValid);

        const logValue = (() => {
          if (fieldValue === undefined || fieldValue === null) {
            return "Null/No file";
          }

          if (isFile(fieldValue)) {
            return `File object: ${
              fieldValue.name || "[unnamed file]"
            } (${fieldValue.size} bytes)`;
          }

          if (fieldValue && fieldValue instanceof Blob) {
            return `Blob object: ${fieldValue.size} bytes`;
          }

          return fieldValue;
        })();
        console.log(`${fieldKey} in data:`, logValue);
      }

      const formData = new FormData();

      Object.entries(dataField).forEach(([key, value]) => {
        if (key !== fieldKey && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const avatarFile = fieldValue;
      if (avatarFile) {
        if (avatarFile instanceof File) {
          formData.append("avatarImg", avatarFile);
          console.log("Appended file to FormData:", avatarFile.name);
        }
      }

      console.log("FormData has avatarImg:", formData.has("avatarImg")); // Log for validation
      console.log(
        "All FormData entries:",
        Array.from(formData.entries()).map(
          ([k, v]) => `${k}: ${v instanceof File ? "File" : v}`,
        ),
      );

      const response = await apiInstance.postForm("users/create", formData);
      if (response.data.status !== 201) {
        throw new Error("Submission failed");
      }
      const result = response.data as {
        message?: string;
        data?: unknown;
      };

      console.log("Backend success response:", result);
      toast.success(result.message || "User created successfully");
      params.form.reset();
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error("Submit error:", error);
    }
  }

  const onInvalid = (errors: FieldErrors<TFormAttributes>) => {
    console.log("Form validation failed");
    console.log("isValid:", params.form.formState.isValid);
    console.log("Full errors:", JSON.stringify(errors, null, 2));
  };

  return {
    onSubmitWithImage,
    onInvalid
  };
}
