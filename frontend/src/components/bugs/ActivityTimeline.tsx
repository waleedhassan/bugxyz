import { useBugHistory } from '@/hooks/useBugs';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ActivityTimelineProps {
  bugId: number;
}

export default function ActivityTimeline({ bugId }: ActivityTimelineProps) {
  const { data: history, isLoading } = useBugHistory(bugId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>;
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
      {history.map((item) => (
        <div key={item.id} className="relative flex items-start gap-4 py-3">
          <div className="relative z-10 mt-1 h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.userName}</span>{' '}
              changed <span className="font-medium">{item.field}</span>
            </p>
            {(item.oldValue || item.newValue) && (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {item.oldValue && (
                  <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through">
                    {item.oldValue}
                  </span>
                )}
                <ArrowRight className="h-3 w-3 shrink-0" />
                {item.newValue && (
                  <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {item.newValue}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
