type UploadWorkReportFileArgs = {
  file: File;
  projectId: string | null;
  workReportId: string;
};

export async function uploadWorkReportFile(
  args: UploadWorkReportFileArgs
): Promise<string> {
  const { file, projectId, workReportId } = args;

  const buffer = Buffer.from(await file.arrayBuffer());
  const workerUrl = process.env.R2_WORKER_URL;
  const authSecret = process.env.R2_AUTH_SECRET;

  if (!workerUrl || !authSecret) {
    throw new Error('Server configuration error: Missing R2 credentials');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = projectId
    ? `projects/${projectId}/work-reports/${workReportId}/${Date.now()}_${sanitizedName}`
    : `work-reports/${workReportId}/${Date.now()}_${sanitizedName}`;

  const response = await fetch(`${workerUrl}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authSecret}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload failed: ${response.statusText} (${response.status}): ${errorText}`
    );
  }

  return `${workerUrl}/${key}`;
}
