import { LoginForm } from '@/app/login/components/login-form';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="flex flex-col min-h-svh w-full bg-blue-100 items-center justify-center px-3 sm:p-6 md:p-10 gap-y-6">
      <Image
        src={'/logo.png'}
        alt="Logo"
        width={300}
        height={150}
        className="object-contain"
      />
      <div className="w-full sm:max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
