import { z } from 'zod';
import { WorkReportPhotoType } from '@/generated/prisma/enums';

export const WorkReportStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']);
export type TWorkReportStatus = z.infer<typeof WorkReportStatusEnum>;

export const WorkReportSchema = z.object({
  projectId: z.string().uuid(),
  date: z.date(),
  situation: z.string().min(1, 'Situasi harus diisi'),
  workDone: z.string().min(1, 'Pekerjaan harus diisi'),
  workResult: z.string().min(1, 'Hasil pekerjaan harus diisi'),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  zone: z.string().optional(),
  machineIds: z.array(z.string()),
  status: WorkReportStatusEnum.optional(),
  createdByAdmin: z.boolean().optional(),
});

export const UpdateWorkReportSchema = WorkReportSchema.extend({
  id: z.string().uuid(),
});

export const WorkReportSignatureSchema = z.object({
  workReportId: z.string().uuid('Work report ID tidak valid'),
  role: z.enum(['TECHNICIAN', 'CLIENT_PIC']),
  dataUrl: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      'Format tanda tangan tidak valid'
    ),
});

export type CreateWorkReportInput = z.infer<typeof WorkReportSchema>;
export type UpdateWorkReportInput = z.infer<typeof UpdateWorkReportSchema>;

export type WorkReportRow = {
  id: string;
  projectId: string;
  date: Date;
  status: TWorkReportStatus;
  approvedAt: Date | null;
  timeStart: string | null;
  timeEnd: string | null;
  zone: string | null;
  situation: string;
  workDone: string;
  workResult: string;
  createdAt: Date;
  updatedAt: Date;
  machines: {
    id: string;
    // name: string; // Machine does not have name, use type/unitNumber
    type: string;
    unitNumber: number;
    brand: string | null;
  }[];
  photos: {
    id: string;
    url: string;
    caption: string | null;
    type: WorkReportPhotoType;
  }[];
  technicianSignatureUrl: string | null;
  technicianSignedAt: Date | null;
  technicianSignedByUserId: string | null;
  clientPicSignatureUrl: string | null;
  clientPicSignedAt: Date | null;
  clientPicSignedByUserId: string | null;
};
