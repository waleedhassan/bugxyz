import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject, useProjectMembers, useProjectStats, useAddProjectMember } from '@/hooks/useProjects';
import { useBugs } from '@/hooks/useBugs';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Bug, Users, BarChart3, Plus, ChevronRight } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<string, string> = { OPEN: '#3b82f6', IN_PROGRESS: '#eab308', IN_REVIEW: '#a855f7', RESOLVED: '#22c55e', CLOSED: '#6b7280', REOPENED: '#ef4444' };
const SEV_COLORS: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#3b82f6', TRIVIAL: '#6b7280' };
const STATUS_VARIANT: Record<string, any> = { OPEN: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', RESOLVED: 'green', CLOSED: 'gray', REOPENED: 'red' };
const SEVERITY_VARIANT: Record<string, any> = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue', TRIVIAL: 'gray' };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id!);
  const { data: members } = useProjectMembers(id!);
  const { data: stats } = useProjectStats(id!);
  const { data: bugsData } = useBugs({ projectId: Number(id), size: 10 });
  const { data: usersData } = useUsers();
  const addMember = useAddProjectMember();
  const [newMemberId, setNewMemberId] = useState('');

  if (isLoading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!project) return <div className="text-center py-12 text-muted-foreground">Project not found</div>;

  const bugs = bugsData?.content || [];
  const users = (usersData as any)?.content || usersData || [];
  const memberIds = new Set((members || []).map((m: any) => m.userId));

  const statusData = stats?.bugsByStatus ? Object.entries(stats.bugsByStatus).map(([name, value]) => ({ name, value })) : [];
  const sevData = stats?.bugsBySeverity ? Object.entries(stats.bugsBySeverity).map(([name, value]) => ({ name, value })) : [];

  const handleAddMember = () => {
    if (!newMemberId) return;
    addMember.mutate({ projectId: Number(id), data: { userId: Number(newMemberId), role: 'DEVELOPER' } }, {
      onSuccess: () => setNewMemberId(''),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/projects" className="hover:text-primary">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-mono">{project.key}</Badge>
            {project.description && <span className="text-sm text-muted-foreground">{project.description}</span>}
          </div>
        </div>
        <Link to={`/bugs?projectId=${project.id}`}><Button variant="outline" size="sm"><Bug className="h-4 w-4 mr-1" />View All Bugs</Button></Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Bugs</p><p className="text-2xl font-bold">{stats.totalBugs}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold text-blue-600">{stats.openBugs}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-green-600">{stats.resolvedBugs}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Avg Fix Time</p><p className="text-2xl font-bold">{stats.avgResolutionTime ? `${stats.avgResolutionTime.toFixed(1)}h` : 'N/A'}</p></CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="bugs">
        <TabsList>
          <TabsTrigger value="bugs"><Bug className="h-4 w-4 mr-1" />Bugs</TabsTrigger>
          <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" />Members ({members?.length || 0})</TabsTrigger>
          <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-1" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bugs">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Severity</TableHead><TableHead>Assignee</TableHead><TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugs.map((bug: any) => (
                    <TableRow key={bug.id}>
                      <TableCell className="font-mono text-xs">{project.key}-{bug.id}</TableCell>
                      <TableCell><Link to={`/bugs/${bug.id}`} className="text-primary hover:underline">{bug.title}</Link></TableCell>
                      <TableCell><Badge variant={STATUS_VARIANT[bug.status]}>{bug.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell><Badge variant={SEVERITY_VARIANT[bug.severity]}>{bug.severity}</Badge></TableCell>
                      <TableCell className="text-sm">{bug.assigneeName || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{timeAgo(bug.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {bugs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bugs in this project</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)}>
                    <option value="">Add member...</option>
                    {(Array.isArray(users) ? users : []).filter((u: any) => !memberIds.has(u.id)).map((u: any) => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <Button size="sm" onClick={handleAddMember} disabled={!newMemberId || addMember.isPending}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(members || []).map((m: any) => (
                    <TableRow key={m.userId}>
                      <TableCell className="font-medium">{m.userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.userEmail}</TableCell>
                      <TableCell><Badge variant="outline">{m.role}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{timeAgo(m.joinedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Bugs by Status</CardTitle></CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Bugs by Severity</CardTitle></CardHeader>
              <CardContent>
                {sevData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sevData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">{sevData.map((entry) => <Cell key={entry.name} fill={SEV_COLORS[entry.name] || '#888'} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
