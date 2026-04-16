import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { generateReleaseNotes } from '@/api/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ReleaseNotesPage() {
  const { data: projectsData } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const projects = (projectsData as any)?.content || projectsData || [];

  const handleGenerate = async () => {
    if (!projectId || !version) {
      toast({ title: 'Please select a project and enter a version', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await generateReleaseNotes(Number(projectId), version);
      setNotes(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      toast({ title: 'Failed to generate release notes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" />Release Notes Generator</h1>
        <p className="text-muted-foreground text-sm">Auto-generate release notes from resolved bugs</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-5 w-5" />Generate Notes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label>Project *</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select project</option>
                {(Array.isArray(projects) ? projects : []).map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.key})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Version *</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.2.0" />
            </div>
            <Button onClick={handleGenerate} disabled={loading || !projectId || !version}>
              {loading ? 'Generating...' : <><Sparkles className="h-4 w-4 mr-2" />Generate</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Generated Release Notes</CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <><Check className="h-4 w-4 mr-1" />Copied</> : <><Copy className="h-4 w-4 mr-1" />Copy</>}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {notes}
            </div>
          </CardContent>
        </Card>
      )}

      {!notes && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a project and version to generate release notes</p>
            <p className="text-xs text-muted-foreground mt-1">Notes are generated from resolved bugs matching the specified version</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
