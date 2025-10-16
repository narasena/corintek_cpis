'use client';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import useAssignedProjects from '@/hooks/projects/useAssignedProjects';

export function SectionCards() {
  const { user } = useAuthStore();
  const { assignedProjects, isLoading } = useAssignedProjects();

  const router = useRouter();
  const assignedCount = assignedProjects.length;

  const isManagement = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const isStaff = user?.role === 'SUPERVISOR' || user?.role === 'TECHNICIAN';

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-5">
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

  if (isManagement) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-5">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              $1,250.00
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              1,234
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown />
                -20%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Down 20% this period <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Acquisition needs attention
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Accounts</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              45,678
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong user retention <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Engagement exceed targets
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              4.5%
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +4.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Steady performance increase <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Meets growth projections
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Assigned Projects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {assignedCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {assignedCount > 0
                ? `${assignedCount} project${assignedCount === 1 ? '' : 's'} assigned`
                : 'No projects assigned'}
            </div>
            <div className="text-muted-foreground">
              {assignedCount > 0
                ? 'Active project assignments'
                : 'No project assigned to you currently'}
            </div>
          </CardFooter>
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

  // Default fallback
  return null;
}
