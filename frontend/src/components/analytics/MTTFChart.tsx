import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MttfData } from '@/types';

interface MTTFChartProps {
  data?: MttfData[];
  isLoading: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  TRIVIAL: '#6b7280',
};

export default function MTTFChart({ data, isLoading }: MTTFChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mean Time to Fix by Severity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}h`, 'Avg Fix Time']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Bar dataKey="avgHours" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={SEVERITY_COLORS[entry.severity] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No MTTF data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
