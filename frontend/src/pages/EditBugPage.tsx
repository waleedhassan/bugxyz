import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBug, useUpdateBug } from '@/hooks/useBugs';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBugPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bug, isLoading } = useBug(id!);
  const { data: projects } = useProjects();
  const { data: usersData } = useUsers();
  const updateBug = useUpdateBug();

  const [form, setForm] = useState({
    title: '', description: '', severity: 'MEDIUM', priority: 'MEDIUM',
    bugType: 'BUG', assigneeId: '', tags: '', stepsToReproduce: '',
    expectedBehavior: '', actualBehavior: '', affectedVersion: '', fixedVersion: '',
  });

  useEffect(() => {
    if (bug) {
      setForm({
        title: bug.title || '',
        description: bug.description || '',
        severity: bug.severity || 'MEDIUM',
        priority: bug.priority || 'MEDIUM',
        bugType: bug.bugType || 'BUG',
        assigneeId: bug.assigneeId ? String(bug.assigneeId) : '',
        tags: bug.tags ? bug.tags.join(', ') : '',
        stepsToReproduce: bug.stepsToReproduce || '',
        expectedBehavior: bug.expectedBehavior || '',
        actualBehavior: bug.actualBehavior || '',
        affectedVersion: bug.affectedVersion || '',
        fixedVersion: bug.fixedVersion || '',
      });
    }
  }, [bug]);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      title: form.title,
      description: form.description,
      severity: form.severity,
      priority: form.priority,
      bugType: form.bugType,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      stepsToReproduce: form.stepsToReproduce,
      expectedBehavior: form.expectedBehavior,
      actualBehavior: form.actualBehavior,
      affectedVersion: form.affectedVersion,
      fixedVersion: form.fixedVersion,
    };
    if (form.assigneeId) data.assigneeId = Number(form.assigneeId);
    updateBug.mutate({ id: Number(id), data }, {
      onSuccess: () => navigate(`/bugs/${id}`),
    });
  };

  const users = (usersData as any)?.content || usersData || [];

  if (isLoading) return <div className="max-w-3xl mx-auto space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  if (!bug) return <div className="text-center py-12 text-muted-foreground">Bug not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Bug: {bug.projectKey}-{bug.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} required />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.assigneeId} onChange={(e) => update('assigneeId', e.target.value)}>
                  <option value="">Unassigned</option>
                  {(Array.isArray(users) ? users : []).map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.severity} onChange={(e) => update('severity', e.target.value)}>
                  {['CRITICAL','HIGH','MEDIUM','LOW','TRIVIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                  {['URGENT','HIGH','MEDIUM','LOW'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.bugType} onChange={(e) => update('bugType', e.target.value)}>
                  {['BUG','FEATURE','IMPROVEMENT','TASK'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="frontend, auth, crash" />
              </div>
              <div className="space-y-2">
                <Label>Affected Version</Label>
                <Input value={form.affectedVersion} onChange={(e) => update('affectedVersion', e.target.value)} placeholder="1.0.0" />
              </div>
              <div className="space-y-2">
                <Label>Fixed Version</Label>
                <Input value={form.fixedVersion} onChange={(e) => update('fixedVersion', e.target.value)} placeholder="1.0.1" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Steps to Reproduce</Label>
                <Textarea value={form.stepsToReproduce} onChange={(e) => update('stepsToReproduce', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Expected Behavior</Label>
                <Textarea value={form.expectedBehavior} onChange={(e) => update('expectedBehavior', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Actual Behavior</Label>
                <Textarea value={form.actualBehavior} onChange={(e) => update('actualBehavior', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={updateBug.isPending}>{updateBug.isPending ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/bugs/${id}`)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
