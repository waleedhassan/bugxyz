import { useDashboard, useMttf, useThroughput, useBugAging, useDeveloperStats, useStaleBugs, useTechDebt } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, AlertTriangle, Users, Layers } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#f97316'];
const SEV_COLORS: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#3b82f6', TRIVIAL: '#6b7280' };
const SEVERITY_VARIANT: Record<string, any> = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue', TRIVIAL: 'gray' };

export default function AnalyticsPage() {
  const { data: mttf, isLoading: mttfLoading } = useMttf();
  const { data: throughput, isLoading: tpLoading } = useThroughput();
  const { data: aging, isLoading: agingLoading } = useBugAging();
  const { data: devStats, isLoading: devLoading } = useDeveloperStats();
  const { data: staleBugs } = useStaleBugs();
  const { data: techDebt } = useTechDebt();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Insights and metrics across all projects</p>
      </div>

      <Tabs defaultValue="mttf">
        <TabsList className="flex-wrap">
          <TabsTrigger value="mttf"><Clock className="h-4 w-4 mr-1" />Mean Time to Fix</TabsTrigger>
          <TabsTrigger value="throughput"><TrendingUp className="h-4 w-4 mr-1" />Throughput</TabsTrigger>
          <TabsTrigger value="aging"><AlertTriangle className="h-4 w-4 mr-1" />Bug Aging</TabsTrigger>
          <TabsTrigger value="developers"><Users className="h-4 w-4 mr-1" />Developers</TabsTrigger>
          <TabsTrigger value="stale">Stale Bugs</TabsTrigger>
          <TabsTrigger value="techdebt"><Layers className="h-4 w-4 mr-1" />Tech Debt</TabsTrigger>
        </TabsList>

        {/* MTTF */}
        <TabsContent value="mttf">
          <Card>
            <CardHeader><CardTitle>Mean Time to Fix by Severity</CardTitle></CardHeader>
            <CardContent>
              {mttfLoading ? <Skeleton className="h-64" /> : mttf && mttf.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mttf}>
                    <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)} hours`} />
                    <Bar dataKey="avgHours" name="Avg Hours">
                      {mttf.map((entry: any) => <Cell key={entry.severity} fill={SEV_COLORS[entry.severity] || '#888'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-8 text-muted-foreground">No data available</p>}
              {mttf && mttf.length > 0 && (
                <div className="grid gap-3 md:grid-cols-5 mt-4">
                  {mttf.map((m: any) => (
                    <div key={m.severity} className="text-center p-3 rounded-lg bg-muted/50">
                      <Badge variant={SEVERITY_VARIANT[m.severity]}>{m.severity}</Badge>
                      <p className="text-lg font-bold mt-1">{m.avgHours?.toFixed(1) || 0}h</p>
                      <p className="text-xs text-muted-foreground">{m.count} bugs</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Throughput */}
        <TabsContent value="throughput">
          <Card>
            <CardHeader><CardTitle>Weekly Throughput</CardTitle></CardHeader>
            <CardContent>
              {tpLoading ? <Skeleton className="h-64" /> : throughput && throughput.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={throughput}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="opened" stroke="#ef4444" strokeWidth={2} name="Opened" />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-8 text-muted-foreground">No data available</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging */}
        <TabsContent value="aging">
          <Card>
            <CardHeader><CardTitle>Bug Aging Distribution</CardTitle></CardHeader>
            <CardContent>
              {agingLoading ? <Skeleton className="h-64" /> : aging && aging.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aging}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Bugs" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-8 text-muted-foreground">No data available</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Developers */}
        <TabsContent value="developers">
          <Card>
            <CardHeader><CardTitle>Developer Productivity</CardTitle></CardHeader>
            <CardContent className="p-0">
              {devLoading ? <div className="p-6"><Skeleton className="h-48" /></div> : devStats && devStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Developer</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                      <TableHead className="text-right">Resolved</TableHead>
                      <TableHead className="text-right">Avg Fix (h)</TableHead>
                      <TableHead className="text-right">Reopen Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devStats.map((d: any) => (
                      <TableRow key={d.userId}>
                        <TableCell className="font-medium">{d.userName}</TableCell>
                        <TableCell className="text-right"><Badge variant="blue">{d.openBugs}</Badge></TableCell>
                        <TableCell className="text-right"><Badge variant="green">{d.resolvedBugs}</Badge></TableCell>
                        <TableCell className="text-right">{d.avgFixTimeHours?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={d.reopenRate > 20 ? 'red' : d.reopenRate > 10 ? 'yellow' : 'green'}>
                            {d.reopenRate?.toFixed(1) || 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center py-8 text-muted-foreground p-6">No developer data</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stale Bugs */}
        <TabsContent value="stale">
          <Card>
            <CardHeader><CardTitle>Stale Bugs (No activity &gt; 14 days)</CardTitle></CardHeader>
            <CardContent className="p-0">
              {staleBugs && staleBugs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bug</TableHead><TableHead>Status</TableHead><TableHead>Severity</TableHead><TableHead>Assignee</TableHead><TableHead>Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staleBugs.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell><Link to={`/bugs/${b.id}`} className="text-primary hover:underline">{b.title}</Link></TableCell>
                        <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                        <TableCell><Badge variant={SEVERITY_VARIANT[b.severity]}>{b.severity}</Badge></TableCell>
                        <TableCell className="text-sm">{b.assigneeName || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{timeAgo(b.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center py-8 text-muted-foreground">No stale bugs found</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tech Debt */}
        <TabsContent value="techdebt">
          <Card>
            <CardHeader><CardTitle>Technical Debt Overview</CardTitle></CardHeader>
            <CardContent>
              {techDebt && techDebt.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={techDebt} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, count }) => `${category}: ${count}`}>
                        {techDebt.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {techDebt.map((t: any, i: number) => (
                      <div key={t.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium">{t.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{t.count}</span>
                          <Badge variant={t.trend === 'up' ? 'red' : t.trend === 'down' ? 'green' : 'gray'} className="text-xs">
                            {t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-center py-8 text-muted-foreground">No tech debt data</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
