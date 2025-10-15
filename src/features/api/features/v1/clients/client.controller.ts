import { clientCreationSchema } from '@/app/(main)/clients/schemas/clientSchema';
import { createErrorResponse } from '@/lib/error-handler';
import {
  TClientCreationAttributes,
  TClientPICCreationAttributes,
} from '@/types/client.type';
import formDataToObject from '@/utils/api/v1/form-data/formDataToObject';
import formDataLogs from '@/utils/api/v1/logs/formDataLogs';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextRequest, NextResponse } from 'next/server';
import uploadFormDataFormatter from '@/utils/api/v1/form-data/uploadFormDataFormatter';
import {
  createClientPersonnelWithoutAvatar,
  createClientWithoutAvatar,
  fetchAllClientsService,
  fetchClientByIdService,
  fetchClientPersonnelService,
  fetchProjectsByClientService,
  updateClientAvatar,
} from './client.service';
import { EFileFolders } from '@/utils/api/v1/form-data/formDataNameFormatter';
import { imageUpload } from '../upload/upload.service';
import { clientPersonnelCreateSchema } from '@/app/(main)/clients/schemas/clientPICSchema';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';

export async function createClient(req: NextRequest) {
  try {
    const formData = await formDataLogs(req);

    if (formData instanceof NextResponse) {
      return formData;
    }

    const { data, image: avatarImg } =
      formDataToObject<TClientCreationAttributes>(formData, 'avatarImg');

    const validatedResult = requestValidation<TClientCreationAttributes>({
      validationSchema: clientCreationSchema,
      data,
      imageField: 'avatarImg',
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;
    let newClient;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newClient = await createClientWithoutAvatar(
        validatedData as TClientCreationAttributes,
        tx
      );

      if (avatarImg && avatarImg.size > 0) {
        const uploadFormData = uploadFormDataFormatter({
          file: avatarImg,
          fileType: 'image',
          fileFolder: EFileFolders.CLIENTS,
          fileNamePrefix: 'logo',
          relativeId: newClient.id,
        });
        // Fetch to your upload route (adjust baseURL if needed; assumes same origin)
        const { url: avatarUrl, publicId: avatarPublicId } = (await imageUpload(
          uploadFormData
        )) as {
          url: string;
          publicId: string;
        };

        // Update user with avatar in the same transaction
        newClient = await updateClientAvatar(
          newClient.id,
          avatarUrl!,
          avatarPublicId!,
          tx
        );
      }
    });
    const newClientMessage = 'Klien baru berhasil ditambahkan';
    console.log(`${newClientMessage}:`, newClient);
    return NextResponse.json({
      success: true,
      status: 201,
      message: newClientMessage,
      newClient,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchAllClients() {
  try {
    const clients = await fetchAllClientsService();
    return NextResponse.json({
      success: true,
      clients,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchClientById(req: NextRequest, clientId: string) {
  try {
    const client = await fetchClientByIdService(req, clientId);
    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createClientPersonnel(
  req: NextRequest,
  clientId: string
) {
  try {
    const formData = await formDataLogs(req);

    if (formData instanceof NextResponse) {
      return formData;
    }

    const { data, image: avatarImg } =
      formDataToObject<TClientPICCreationAttributes>(formData, 'avatarImg');

    const validatedResult = requestValidation<TClientPICCreationAttributes>({
      validationSchema: clientPersonnelCreateSchema,
      data,
      imageField: 'avatarImg',
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;
    let newClientPersonnel;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newClientPersonnel = await createClientPersonnelWithoutAvatar(
        validatedData as TClientPICCreationAttributes,
        tx,
        clientId
      );

      if (avatarImg && avatarImg.size > 0) {
        const uploadFormData = uploadFormDataFormatter({
          file: avatarImg,
          fileType: 'image',
          fileFolder: EFileFolders.CLIENTS,
          fileNamePrefix: 'avatar',
          relativeId: newClientPersonnel.id,
        });
        // Fetch to your upload route (adjust baseURL if needed; assumes same origin)
        const { url: avatarUrl, publicId: avatarPublicId } = (await imageUpload(
          uploadFormData
        )) as {
          url: string;
          publicId: string;
        };

        // Update user with avatar in the same transaction
        newClientPersonnel = await updateClientAvatar(
          newClientPersonnel.id,
          avatarUrl!,
          avatarPublicId!,
          tx
        );
      }
    });
    const newClientPersnonnelMessage = 'PIC klien baru berhasil ditambahkan';
    console.log(`${newClientPersnonnelMessage}:`, newClientPersonnel);
    return NextResponse.json({
      success: true,
      status: 201,
      message: newClientPersnonnelMessage,
      newClientPersonnel,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchClientPersonnel(req: NextRequest, clientId: string) {
  try {
    return NextResponse.json({
      success: true,
      clientPersonnel: await fetchClientPersonnelService(req, clientId),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchProjectsByClient(clientId: string) {
  try {
    const clientProjects = await fetchProjectsByClientService(clientId);
    return NextResponse.json({
      success: true,
      clientProjects,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
