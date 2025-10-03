import { AppError } from './app-error';
import { NextResponse } from 'next/server';

export function getErrorResponse(error: unknown): {
  status: number;
  message: string;
} {
  console.log('Error in getErrorResponse:', {
    name: error?.constructor?.name,
    message: (error as Error)?.message,
    isAppError: error instanceof AppError,
    stack: (error as Error)?.stack?.split('\n').slice(0, 3),
  });

  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.isExpose ? error.message : 'Internal Server Error',
    };
  }

  // Handle other error types if needed
  if (error instanceof Error) {
    console.error('Unexpected error:', error);
  }

  return {
    status: 500,
    message: 'Internal Server Error',
  };
}

export function createErrorResponse(error: unknown) {
  const { status, message } = getErrorResponse(error);
  return NextResponse.json({ message }, { status });
}
