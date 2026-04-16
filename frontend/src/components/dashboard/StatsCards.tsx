import { Card, CardContent } from '@/components/ui/card';
import { Bug, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
  totalOpen?: number;
  resolvedToday?: number;
  myAssigned?: number;
  criticalBugs?: number;
  isLoading: boolean;
}

export default function StatsCards({
  totalOpen,
  resolvedToday,
  myAssigned,
  criticalBugs,
  isLoading,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Open Bugs',
      value: totalOpen,
      icon: Bug,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Resolved Today',
      value: resolvedToday,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'My Assigned',
      value: myAssigned,
      icon: UserCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Critical Bugs',
      value: criticalBugs,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stat.value ?? 0}</p>
                )}
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
