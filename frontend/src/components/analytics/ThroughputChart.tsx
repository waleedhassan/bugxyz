import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ThroughputData } from '@/types';

interface ThroughputChartProps {
  data?: ThroughputData[];
  isLoading: boolean;
}

export default function ThroughputChart({ data, isLoading }: ThroughputChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bug Throughput (Opened vs Resolved)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorOpened)"
                name="Opened"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No throughput data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
