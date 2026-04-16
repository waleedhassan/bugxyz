import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityFeedProps {
  activities?: Activity[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                  {activity.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium text-primary">{activity.entityTitle}</span>
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}
