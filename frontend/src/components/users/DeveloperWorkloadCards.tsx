import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import type { UserWorkload } from '@/types';

interface DeveloperWorkloadCardsProps {
  data?: UserWorkload[];
  isLoading: boolean;
}

export default function DeveloperWorkloadCards({ data, isLoading }: DeveloperWorkloadCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No workload data available
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((dev) => {
        const totalBugs = dev.openBugs + dev.inProgressBugs;
        const isOverloaded = totalBugs > 10;

        return (
          <Card key={dev.userId} className={isOverloaded ? 'border-red-300 dark:border-red-800' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar alt={dev.userName} size="sm" />
                <div>
                  <p className="font-medium text-sm">{dev.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg fix: {dev.avgFixTime.toFixed(1)}h
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold">{dev.openBugs}</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </div>
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold">{dev.inProgressBugs}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
              {isOverloaded && (
                <p className="text-xs text-red-500 mt-2 font-medium">High workload</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
