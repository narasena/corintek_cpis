import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import { fetchInternalPersonnelsService } from './project.service';

export async function fetchInternalPersonnels(req: NextRequest) {
  try {
    const personnels = await fetchInternalPersonnelsService(req);
    return NextResponse.json({
      success: true,
      personnels,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
