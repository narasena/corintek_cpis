import { AxiosError } from "axios"

export default function errorMessageResponse(error: unknown) {
  const axiosError = error as AxiosError<{message: string}>
  return axiosError.response?.data.message
}