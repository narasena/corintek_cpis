'use server';

import { revalidatePath } from 'next/cache';
import { attendanceListFiltersSchema } from './types';
import * as service from './service';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';
import { uploadToR2 } from '@/lib/r2-upload';

function getJakartaDateLocal(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Server Action: Get today's attendance status
 */
export const getTodayAttendanceAction = actionFactory.protected(
  async ({ actor }) => {
    const dateLocal = getJakartaDateLocal(new Date());
    return service.getTodayAttendance(actor.id, dateLocal);
  },
  {
    metadata: {
      rbac: { resource: RbacResource.ATTENDANCE, capability: 'read' },
    },
  }
);

/**
 * Server Action: Clock in with photo
 */
export const clockInAction = actionFactory.protected(
  async ({ input, actor }) => {
    const photo = input.get('photo') as File | null;
    if (!photo || !photo.size) throw new Error('Foto wajib diisi');

    const now = new Date();
    const dateLocal = getJakartaDateLocal(now);
    
    const buffer = Buffer.from(await photo.arrayBuffer());
    const sanitizedName = (photo.name || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `attendance/${actor.id}/${dateLocal}/clock-in_${Date.now()}_${sanitizedName}`;

    const photoUrl = await uploadToR2({
      key,
      body: buffer,
      contentType: photo.type,
    });

    const data = await service.createClockIn({
      userId: actor.id,
      dateLocal,
      clockInAt: now,
      clockInPhotoUrl: photoUrl,
    });

    revalidatePath('/attendance');
    revalidatePath('/attendance/admin');
    revalidatePath('/');

    return data;
  },
  {
    metadata: {
      rbac: { resource: RbacResource.ATTENDANCE, capability: 'create' },
    },
  }
);

/**
 * Server Action: Clock out with photo
 */
export const clockOutAction = actionFactory.protected(
  async ({ input, actor }) => {
    const photo = input.get('photo') as File | null;
    if (!photo || !photo.size) throw new Error('Foto wajib diisi');

    const now = new Date();
    const dateLocal = getJakartaDateLocal(now);
    
    const buffer = Buffer.from(await photo.arrayBuffer());
    const sanitizedName = (photo.name || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `attendance/${actor.id}/${dateLocal}/clock-out_${Date.now()}_${sanitizedName}`;

    const photoUrl = await uploadToR2({
      key,
      body: buffer,
      contentType: photo.type,
    });

    const data = await service.createClockOut({
      userId: actor.id,
      dateLocal,
      clockOutAt: now,
      clockOutPhotoUrl: photoUrl,
    });

    revalidatePath('/attendance');
    revalidatePath('/attendance/admin');
    revalidatePath('/');

    return data;
  },
  {
    metadata: {
      rbac: { resource: RbacResource.ATTENDANCE, capability: 'update' },
    },
  }
);

/**
 * Server Action: List attendance with filters
 */
export const getAttendanceListAction = actionFactory.protected(
  async ({ input, actor }) => {
    return service.listAttendance(actor, input);
  },
  {
    schema: attendanceListFiltersSchema,
    metadata: {
      rbac: { resource: RbacResource.ATTENDANCE, capability: 'read' },
    },
  }
);

/**
 * Server Action: Export attendance to CSV
 */
export const exportAttendanceCsvAction = actionFactory.protected(
  async ({ input, actor }) => {
    const csv = await service.exportAttendanceCsv(actor, input);
    return { csv };
  },
  {
    schema: attendanceListFiltersSchema,
    metadata: {
      rbac: { resource: RbacResource.ATTENDANCE, capability: 'read' },
    },
  }
);
