'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import useAuthDetail from '@/hooks/auth/useAuthDetail';
import useAssignedProjects from '@/hooks/projects/useAssignedProjects';
import { useRouter } from 'next/navigation';

export default function LogSheetsPage() {
  const router = useRouter();
  const { assignedProjects, isLoading } = useAssignedProjects();
  const { isStaff } = useAuthDetail();
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (isStaff) {
    if (assignedProjects.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">
              No Projects Assigned
            </h3>
            <p className="text-sm text-muted-foreground">
              You currently have no projects assigned to you.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 lg:grid-cols-3">
        {assignedProjects.map(project => (
          <Card
            key={project.id}
            className="@container/card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {project.name}
              </CardTitle>
              <CardDescription>
                {project.client?.name || 'Unknown Client'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2">
                <Badge
                  variant={project.type === 'MAIN' ? 'default' : 'secondary'}
                >
                  {project.type}
                </Badge>
                <Badge variant="outline">{project.contractType}</Badge>
              </div>
              <div className="text-muted-foreground text-xs">
                {project.startDate && project.endDate
                  ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`
                  : 'Date range not set'}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  return null;
}
