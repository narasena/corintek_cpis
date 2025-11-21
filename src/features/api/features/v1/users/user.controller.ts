import { fetchAllUsersService } from './user.service';
import { TUserCreationAttributes } from '@/types/user.type';
import { NextRequest, NextResponse } from 'next/server';
import { createUserWithoutAvatar, updateUserAvatar } from './user.service';
import { userCreationSchema } from '@/app/(main)/users/schemas/userSchema';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { prisma } from '@/features/api/connection/prisma';
import formDataLogs from '@/utils/api/v1/logs/formDataLogs';
import formDataToObject from '@/utils/api/v1/form-data/formDataToObject';
import uploadFormDataFormatter from '@/utils/api/v1/form-data/uploadFormDataFormatter';
import { EFileFolders } from '@/utils/api/v1/form-data/formDataNameFormatter';
import { imageUpload } from '../upload/upload.service';
import { createErrorResponse } from '@/lib/error-handler';
import { Prisma } from '@/features/api/generated/prisma/client';

export async function createUser(req: NextRequest) {
  const formData = await formDataLogs(req);

  if (formData instanceof NextResponse) {
    return formData;
  }

  const { data, image: avatarImg } = formDataToObject<TUserCreationAttributes>(
    formData,
    'avatarImg'
  );

  const validatedResult = requestValidation<TUserCreationAttributes>({
    validationSchema: userCreationSchema,
    data,
    imageField: 'avatarImg',
  });

  if (validatedResult instanceof NextResponse) {
    return validatedResult;
  }

  const validatedData = validatedResult;

  // Create user first without avatar in transaction
  let newUser;
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newUser = await createUserWithoutAvatar(
        validatedData as TUserCreationAttributes,
        tx
      );

      if (avatarImg && avatarImg.size > 0) {
        const uploadFormData = uploadFormDataFormatter({
          file: avatarImg,
          fileType: 'image',
          fileFolder: EFileFolders.USERS,
          fileNamePrefix: 'avatar',
          relativeId: newUser.id,
        });
        // Fetch to your upload route (adjust baseURL if needed; assumes same origin)
        const { url: avatarUrl, publicId: avatarPublicId } = (await imageUpload(
          uploadFormData
        )) as {
          url: string;
          publicId: string;
        };

        // Update user with avatar in the same transaction
        newUser = await updateUserAvatar(
          newUser.id,
          avatarUrl!,
          avatarPublicId!,
          tx
        );
      }
    });
    console.log('New user created:', newUser);
    return NextResponse.json({
      success: true,
      status: 201,
      message: 'User created successfully',
      newUser,
    });
  } catch (error) {
    console.error('Transaction error:', error);
    return createErrorResponse(error);
  }
}

export async function fetchAllUsers() {
  try {
    const users = await fetchAllUsersService();
    return NextResponse.json({
      success: true,
      status: 200,
      users,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
