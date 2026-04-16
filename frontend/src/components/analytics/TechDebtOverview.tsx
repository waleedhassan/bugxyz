import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TechDebtItem } from '@/types';

interface TechDebtOverviewProps {
  data?: TechDebtItem[];
  isLoading: boolean;
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors = {
  up: 'text-red-500',
  down: 'text-green-500',
  stable: 'text-muted-foreground',
};

export default function TechDebtOverview({ data, isLoading }: TechDebtOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Technical Debt Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.map((item) => {
              const TrendIcon = trendIcons[item.trend];
              return (
                <div
                  key={item.category}
                  className="rounded-lg border p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-2xl font-bold mt-1">{item.count}</p>
                  </div>
                  <TrendIcon className={`h-5 w-5 ${trendColors[item.trend]}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No technical debt data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
