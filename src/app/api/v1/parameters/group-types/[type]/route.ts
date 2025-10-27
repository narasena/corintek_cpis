import { fetchParameterGroupsByType } from '@/features/api/features/v1/parameters/groups/parameterGroups.controller';
import { ParameterGroupType } from '@/features/api/generated/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ type: string }>;
  }
) {
  const { type } = await params;
  console.log(type);
  return await fetchParameterGroupsByType(type as ParameterGroupType);
}
