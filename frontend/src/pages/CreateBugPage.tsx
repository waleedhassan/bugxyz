import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBug } from '@/hooks/useBugs';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { detectDuplicates, predictSeverity, parseNaturalLanguage } from '@/api/ai';
import { toast } from '@/components/ui/use-toast';

export default function CreateBugPage() {
  const navigate = useNavigate();
  const createBug = useCreateBug();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [aiSeverity, setAiSeverity] = useState<any>(null);
  const [nlText, setNlText] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', projectId: '', severity: 'MEDIUM', priority: 'MEDIUM',
    bugType: 'BUG', assigneeId: '', tags: '', stepsToReproduce: '', expectedBehavior: '', actualBehavior: '', affectedVersion: '',
  });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const checkDuplicates = async () => {
    if (!form.title) return;
    try {
      const res = await detectDuplicates({ title: form.title, description: form.description, ...(form.projectId ? { projectId: Number(form.projectId) } : {}) });
      setDuplicates(res || []);
    } catch { /* ignore */ }
  };

  const predictSev = async () => {
    try {
      const res = await predictSeverity({ title: form.title, description: form.description });
      setAiSeverity(res);
      if (res.predictedSeverity) update('severity', res.predictedSeverity);
      if (res.predictedPriority) update('priority', res.predictedPriority);
      toast({ title: 'AI Prediction', description: `Severity: ${res.predictedSeverity} (${Math.round(res.confidence ?? 0)}% confidence)` });
    } catch { /* ignore */ }
  };

  const parseNL = async () => {
    if (!nlText) return;
    try {
      const res = await parseNaturalLanguage({ text: nlText });
      if (res.title) update('title', res.title);
      if (res.description) update('description', res.description || nlText);
      if (res.severity) update('severity', res.severity);
      if (res.priority) update('priority', res.priority);
      if (res.bugType) update('bugType', res.bugType);
      if (res.stepsToReproduce) update('stepsToReproduce', res.stepsToReproduce);
      if (res.tags) update('tags', res.tags.join(', '));
      toast({ title: 'Bug parsed', description: 'Form fields auto-filled from your description' });
    } catch { toast({ title: 'Parse failed', variant: 'destructive' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form, projectId: Number(form.projectId), tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    if (form.assigneeId) data.assigneeId = Number(form.assigneeId);
    else delete data.assigneeId;
    createBug.mutate(data, { onSuccess: (bug: any) => navigate(`/bugs/${bug.id}`) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" />Conversational Bug Creator</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder='Describe your bug naturally... e.g. "Login crashes on iPhone after entering wrong password"' value={nlText} onChange={(e) => setNlText(e.target.value)} rows={3} />
          <Button onClick={parseNL} variant="secondary" className="mt-2" disabled={!nlText}>Parse & Fill Form</Button>
        </CardContent>
      </Card>

      {duplicates.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-yellow-600" /><span className="font-medium text-yellow-800 dark:text-yellow-200">Possible Duplicates Found</span></div>
            {duplicates.map((d: any) => (
              <div key={d.bugId} className="flex items-center justify-between py-1 text-sm">
                <a href={`/bugs/${d.bugId}`} className="text-primary hover:underline">{d.bugTitle}</a>
                <Badge variant="outline">{Math.round(d.similarityScore * 100)}% match</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Create Bug</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} onBlur={checkDuplicates} placeholder="Brief bug summary" required />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} placeholder="Detailed description..." />
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.projectId} onChange={(e) => update('projectId', e.target.value)} required>
                  <option value="">Select project</option>
                  {((projects as any)?.content || projects || []).map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.key})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.assigneeId} onChange={(e) => update('assigneeId', e.target.value)}>
                  <option value="">Unassigned</option>
                  {((users as any)?.content || users || []).map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Severity</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={predictSev} className="text-xs h-6"><Sparkles className="h-3 w-3 mr-1" />AI Predict</Button>
                </div>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.severity} onChange={(e) => update('severity', e.target.value)}>
                  {['CRITICAL','HIGH','MEDIUM','LOW','TRIVIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {aiSeverity && <p className="text-xs text-muted-foreground">AI: {aiSeverity.predictedSeverity} ({Math.round(aiSeverity.confidence)}%)</p>}
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
              <div className="md:col-span-2 space-y-2">
                <Label>Steps to Reproduce</Label>
                <Textarea value={form.stepsToReproduce} onChange={(e) => update('stepsToReproduce', e.target.value)} rows={3} placeholder="1. Go to...\n2. Click on..." />
              </div>
              <div className="space-y-2">
                <Label>Expected Behavior</Label>
                <Textarea value={form.expectedBehavior} onChange={(e) => update('expectedBehavior', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Actual Behavior</Label>
                <Textarea value={form.actualBehavior} onChange={(e) => update('actualBehavior', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Affected Version</Label>
                <Input value={form.affectedVersion} onChange={(e) => update('affectedVersion', e.target.value)} placeholder="1.0.0" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createBug.isPending}>{createBug.isPending ? 'Creating...' : 'Create Bug'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/bugs')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
