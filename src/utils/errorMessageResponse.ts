import { AxiosError } from 'axios';

export default function errorMessageResponse(error: unknown) {
  const axiosError = error as AxiosError<{ message: string }>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An error occurred';
}
