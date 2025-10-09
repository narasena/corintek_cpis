import { authLoginSchema } from '@/app/login/schemas/loginSchema';
import { createErrorResponse } from '@/lib/error-handler';
import { TAuthLoginFormAttributes } from '@/types/auth.type';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextRequest, NextResponse } from 'next/server';
import { userLoginService } from './auth.service';

export const userLogin = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedResult = requestValidation<TAuthLoginFormAttributes>({
      validationSchema: authLoginSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;
    const loginToken = await userLoginService(validatedData);
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      loginToken,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
};
