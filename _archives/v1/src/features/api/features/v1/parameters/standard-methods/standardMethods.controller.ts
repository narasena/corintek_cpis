import { createErrorResponse } from '@/lib/error-handler';
import { NextResponse } from 'next/server';
import { fetchStandardMethodsService } from './standardMethods.service';

export async function fetchAllStandardMethods() {
  try {
    const standardMethods = await fetchStandardMethodsService();
    return NextResponse.json({
      success: true,
      standardMethods,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
