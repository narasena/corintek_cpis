import { LoginForm } from './components/login-form';
import { DemoLoginCard } from './components/demo-login-card';
import Image from 'next/image';

export default function LoginPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
        {isDemoMode && <DemoLoginCard />}
      </div>
    </div>
  );
}
