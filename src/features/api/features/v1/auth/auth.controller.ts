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
    const secureToken = loginToken?.token;

    const res = NextResponse.json({
      success: true,
      status: 200,
      message: 'Login berhasil',
      loginToken: {
        id: loginToken?.id,
        role: loginToken?.role,
      },
    });

    res.cookies.set('auth_token', secureToken!, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    return createErrorResponse(error);
  }
};
