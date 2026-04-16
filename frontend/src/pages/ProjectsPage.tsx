import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Folder, Users, Bug, X } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function ProjectsPage() {
  const { data: projectsData, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', key: '', description: '' });

  const projects = (projectsData as any)?.content || projectsData || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(form, {
      onSuccess: () => { setShowCreate(false); setForm({ name: '', key: '', description: '' }); },
    });
  };

  const autoKey = (name: string) => {
    const key = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    setForm(f => ({ ...f, name, key }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">{Array.isArray(projects) ? projects.length : 0} projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />New Project</Button>
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Create Project</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => autoKey(e.target.value)} placeholder="My Project" required />
                </div>
                <div className="space-y-1">
                  <Label>Key * (max 10 chars)</Label>
                  <Input value={form.key} onChange={(e) => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))} placeholder="PRJ" maxLength={10} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createProject.isPending}>{createProject.isPending ? 'Creating...' : 'Create'}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(projects) ? projects : []).map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <Badge variant="outline" className="text-xs font-mono">{p.key}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {p.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bug className="h-3 w-3" />{p.bugCount ?? 0} bugs</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.memberCount ?? 0} members</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Created {timeAgo(p.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {Array.isArray(projects) && projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No projects yet. Create your first project to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
