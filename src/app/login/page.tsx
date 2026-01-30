import { LoginForm } from './components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logo.png"
            alt="Corintek Logo"
            width={200}
            height={100}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">CORINTEK CPIS</h1>
            <p className="text-sm text-gray-600">Project Information System</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
