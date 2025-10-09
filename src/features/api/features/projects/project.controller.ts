import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchInternalPersonnelsService,
  createProjectService,
  fetchAllProjectsService,
} from './project.service';
import { projectCreationSchema } from '@/app/(main)/projects/schemas/projectSchema';
import requestValidation from '@/utils/api/validation/requestValidation';
import { TProjectCreationAttributes } from '@/types/project.type';
import { prisma } from '../../connection/prisma';
import { Prisma } from '../../generated/prisma';

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

export async function createProject(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Body:', body);

    const validatedResult = requestValidation<TProjectCreationAttributes>({
      validationSchema: projectCreationSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;

    let newProject;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newProject = await createProjectService(
        validatedData as TProjectCreationAttributes,
        tx
      );
    });

    const newProjectMessage = 'Proyek baru berhasil ditambahkan';
    console.log(`${newProjectMessage}:`, newProject);
    return NextResponse.json({
      success: true,
      status: 201,
      message: newProjectMessage,
      newProject,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchAllProjects(req: NextRequest) {
  try {
    const projects = await fetchAllProjectsService(req);
    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
