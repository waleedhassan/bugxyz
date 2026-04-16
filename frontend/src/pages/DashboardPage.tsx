import { useDashboard } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, CheckCircle, User, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = { OPEN: '#3b82f6', IN_PROGRESS: '#eab308', IN_REVIEW: '#a855f7', RESOLVED: '#22c55e', CLOSED: '#6b7280', REOPENED: '#ef4444' };
const SEVERITY_COLORS: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#3b82f6', TRIVIAL: '#6b7280' };

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (!data) return null;

  const dashData = data as any;
  const statusData = Object.entries(dashData.bugsByStatus || {}).map(([name, value]) => ({ name, value: value as number }));
  const severityData = Object.entries(dashData.bugsBySeverity || {}).map(([name, value]) => ({ name, value: value as number }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900"><Bug className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div><div><p className="text-sm text-muted-foreground">Open Bugs</p><p className="text-2xl font-bold">{dashData.totalOpenBugs ?? dashData.openBugs ?? 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-green-100 dark:bg-green-900"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /></div><div><p className="text-sm text-muted-foreground">Resolved Today</p><p className="text-2xl font-bold">{dashData.resolvedToday ?? 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900"><User className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div><div><p className="text-sm text-muted-foreground">My Assigned</p><p className="text-2xl font-bold">{dashData.myAssigned ?? dashData.myAssignedBugs ?? 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-red-100 dark:bg-red-900"><AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /></div><div><p className="text-sm text-muted-foreground">Critical Bugs</p><p className="text-2xl font-bold">{dashData.criticalBugs ?? dashData.totalBugs ?? 0}</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Bugs by Status</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
              {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />)}
            </Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Bugs by Severity</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="value">{severityData.map((entry) => <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#888'} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Recent Bugs</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{(data.recentBugs || []).slice(0, 8).map((bug: any) => (
            <Link to={`/bugs/${bug.id}`} key={bug.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant={(bug.severity === 'CRITICAL' ? 'red' : bug.severity === 'HIGH' ? 'orange' : 'yellow') as any} className="text-[10px] shrink-0">{bug.severity}</Badge>
                <span className="text-sm truncate">{bug.title}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo(bug.createdAt)}</span>
            </Link>
          ))}</div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{(dashData.recentActivities || dashData.recentActivity || []).slice(0, 8).map((act: any) => (
            <div key={act.id} className="flex items-start gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div><span className="font-medium">{act.userName}</span>{' '}<span className="text-muted-foreground">{act.action.toLowerCase().replace('_', ' ')}</span>
                {act.bugId && <Link to={`/bugs/${act.bugId}`} className="text-primary hover:underline ml-1">#{act.bugId}</Link>}
                <span className="text-xs text-muted-foreground ml-2">{timeAgo(act.createdAt)}</span>
              </div>
            </div>
          ))}</div>
        </CardContent></Card>
      </div>
    </div>
  );
}
