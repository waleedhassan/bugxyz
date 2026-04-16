import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBugs } from '@/hooks/useBugs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const STATUS_VARIANT: Record<string, any> = { OPEN: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', RESOLVED: 'green', CLOSED: 'gray', REOPENED: 'red' };
const SEVERITY_VARIANT: Record<string, any> = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue', TRIVIAL: 'gray' };

export default function BugsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [severity, setSeverity] = useState(searchParams.get('severity') || '');
  const [page, setPage] = useState(0);

  const params: Record<string, any> = { page, size: 20 };
  if (search) params.search = search;
  if (status) params.status = status;
  if (severity) params.severity = severity;
  const projectId = searchParams.get('projectId');
  if (projectId) params.projectId = projectId;

  const { data, isLoading } = useBugs(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (status) p.set('status', status);
    if (severity) p.set('severity', severity);
    setSearchParams(p);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bugs..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </form>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          {['OPEN','IN_PROGRESS','IN_REVIEW','RESOLVED','CLOSED','REOPENED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(0); }}>
          <option value="">All Severity</option>
          {['CRITICAL','HIGH','MEDIUM','LOW','TRIVIAL'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Link to="/bugs/new"><Button><Plus className="h-4 w-4 mr-2" />New Bug</Button></Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 space-y-3">{Array(5).fill(0).map((_,i) => <Skeleton key={i} className="h-12" />)}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.content || []).map((bug: any) => (
                  <TableRow key={bug.id}>
                    <TableCell className="font-mono text-xs">{bug.projectKey}-{bug.id}</TableCell>
                    <TableCell><Link to={`/bugs/${bug.id}`} className="text-primary hover:underline font-medium">{bug.title}</Link></TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[bug.status]}>{bug.status.replace('_',' ')}</Badge></TableCell>
                    <TableCell><Badge variant={SEVERITY_VARIANT[bug.severity]}>{bug.severity}</Badge></TableCell>
                    <TableCell className="text-sm">{bug.priority}</TableCell>
                    <TableCell className="text-sm">{bug.projectName}</TableCell>
                    <TableCell className="text-sm">{bug.assigneeName || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{timeAgo(bug.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.content || data.content.length === 0) && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No bugs found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground">Page {page + 1} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
