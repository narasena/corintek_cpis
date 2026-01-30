'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/features/auth/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(null, formData);

      if (result.success) {
        // Redirect on success
        router.push('/users');
        // router.refresh();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login to CPIS Corintek</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isPending}
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
