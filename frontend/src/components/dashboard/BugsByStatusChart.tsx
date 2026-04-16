import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BugsByStatusChartProps {
  data?: Record<string, number>;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#eab308',
  IN_REVIEW: '#a855f7',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
  REOPENED: '#ef4444',
};

export default function BugsByStatusChart({ data, isLoading }: BugsByStatusChartProps) {
  const chartData = data
    ? Object.entries(data).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
        color: STATUS_COLORS[name] || '#6b7280',
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bugs by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
