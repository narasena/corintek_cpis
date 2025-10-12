import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchInternalPersonnelsService,
  createProjectService,
  fetchAllProjectsService,
  fetchAssignedProjectsService,
} from './project.service';
import { projectCreationSchema } from '@/app/(main)/projects/schemas/projectSchema';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { TProjectCreationAttributes } from '@/types/project.type';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import jwt from 'jsonwebtoken';

interface ITokenPayload {
  id: string;
  role: string;
}

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

export async function fetchAssignedProjects(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;

    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const projects = await fetchAssignedProjectsService(decoded.id);
    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
