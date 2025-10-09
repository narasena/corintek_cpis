'use client';
import DefaultForm from '@/components/features/forms/default-form';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import { TAuthLoginFormAttributes } from '@/types/auth.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { authLoginSchema } from '../schemas/loginSchema';
import { loginFormFields } from '../data/loginFormFields';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';

export function LoginForm() {
  const authLoginForm = useForm<TAuthLoginFormAttributes>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { onSubmit, onInvalid } = useFormHandleSubmit({
    form: authLoginForm,
    apiUrl: '/auth',
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-sm:bg-transparent">
        <CardHeader>
          <CardTitle>Login ke Akun CPIS Corintek</CardTitle>
          <CardDescription>
            Masukkan Email atau Nomor Telepon Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefaultForm<TAuthLoginFormAttributes>
            form={authLoginForm}
            onSubmit={onSubmit}
            onInvalid={onInvalid}
            formFields={loginFormFields}
            validationSchema={authLoginSchema}
          />
        </CardContent>
      </Card>
    </div>
  );
}
