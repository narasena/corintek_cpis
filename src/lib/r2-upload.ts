type TUploadToR2Params = {
  key: string;
  body: BodyInit;
  contentType: string;
};

export async function uploadToR2(params: TUploadToR2Params): Promise<string> {
  const { key, body, contentType } = params;

  const workerUrl = process.env.R2_WORKER_URL;
  const authSecret = process.env.R2_AUTH_SECRET;

  if (!workerUrl || !authSecret) {
    throw new Error('Server configuration error: Missing R2 credentials');
  }

  const response = await fetch(`${workerUrl}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authSecret}`,
      'Content-Type': contentType,
      'X-R2-Bucket': process.env.R2_BUCKET ?? 'dev',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return `${workerUrl}/${key}`;
}
