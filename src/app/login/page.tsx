import { LoginForm } from './components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-blue-100 px-4 md:px-6">
      <div className="flex flex-col gap-6 w-full sm:max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="Corintek Logo"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
