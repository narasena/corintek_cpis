import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { getProjectById } from '@/features/projects/service';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function MyProjectPage({ params }: PageProps) {
  const user = await getCurrentUserDetails();
  if (!user) return null;

  const { projectId } = await params;
  const project = await getProjectById(
    { id: user.id, email: user.email, role: user.role },
    projectId
  );

  if (!project) return notFound();

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {project.client?.name ?? 'No Client'} • {project.status}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Proyek</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Klien</span>
            <span className="font-medium">{project.client?.name ?? '-'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{project.status}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tugas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild className="justify-start" variant="outline">
            <Link href={`/log-sheets/${project.id}`}>Log Sheet</Link>
          </Button>
          <Button asChild className="justify-start" variant="outline">
            <Link href={`/work-reports/${project.id}`}>Laporan Kerja</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
