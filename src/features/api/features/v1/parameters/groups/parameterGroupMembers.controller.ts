import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import {
  fetchParameterGroupMembersService,
  addParameterGroupMembersService,
  removeParameterGroupMembersService,
} from './parameterGroupMembers.service';

export async function fetchParameterGroupMembers(
  req: NextRequest,
  groupId: string
) {
  try {
    const members = await fetchParameterGroupMembersService(groupId);
    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function addParameterGroupMembers(
  req: NextRequest,
  groupId: string
) {
  try {
    const body = await req.json();
    const { parameterIds } = body;

    if (!Array.isArray(parameterIds) || parameterIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Parameter IDs are required' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await addParameterGroupMembersService(groupId, parameterIds, tx);
    });

    return NextResponse.json({
      success: true,
      message: 'Parameter berhasil ditambahkan ke grup',
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function removeParameterGroupMembers(
  req: NextRequest,
  groupId: string
) {
  try {
    const body = await req.json();
    const { parameterIds } = body;

    if (!Array.isArray(parameterIds) || parameterIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Parameter IDs are required' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await removeParameterGroupMembersService(groupId, parameterIds, tx);
    });

    return NextResponse.json({
      success: true,
      message: 'Parameter berhasil dihapus dari grup',
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
