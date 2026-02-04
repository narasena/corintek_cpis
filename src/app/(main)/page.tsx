import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground">Total Projects</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground">Active Clients</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground">Pending Reports</span>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Welcome to Corintek CPIS</h1>
          <p className="text-muted-foreground mb-6">
            Manage your projects, clients, and reports from this dashboard.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/projects">View Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/clients">Manage Clients</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
