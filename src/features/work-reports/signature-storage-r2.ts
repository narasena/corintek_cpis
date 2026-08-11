import type { ISignatureStorage, TWorkReportSignatureRole } from './signature';

const dataUrlPattern = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/;

function parseDataUrl(dataUrl: string): {
  mimeType: string;
  base64: string;
} {
  const matches = dataUrl.match(dataUrlPattern);

  if (!matches) {
    throw new Error('Format tanda tangan tidak valid');
  }

  return {
    mimeType: matches[1],
    base64: matches[3],
  };
}

function buildSignatureKey(
  projectId: string,
  workReportId: string,
  role: TWorkReportSignatureRole
): string {
  const roleKey = role.toLowerCase();
  const timestamp = Date.now();
  return `projects/${projectId}/work-reports/${workReportId}/signatures/${roleKey}-${timestamp}.webp`;
}

export function createR2WorkReportSignatureStorage(): ISignatureStorage {
  return {
    async storeSignature(projectId, workReportId, role, dataUrl) {
      const { mimeType, base64 } = parseDataUrl(dataUrl);
      const buffer = Buffer.from(base64, 'base64');

      const workerUrl = process.env.R2_WORKER_URL;
      const authSecret = process.env.R2_AUTH_SECRET;

      if (!workerUrl || !authSecret) {
        throw new Error('Server configuration error: Missing R2 credentials');
      }

      const key = buildSignatureKey(projectId, workReportId, role);

      const response = await fetch(`${workerUrl}/${key}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authSecret}`,
          'Content-Type': mimeType,
          'X-R2-Bucket': process.env.R2_BUCKET ?? 'dev',
        },
        body: buffer,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return `${workerUrl}/${key}`;
    },
  };
}
