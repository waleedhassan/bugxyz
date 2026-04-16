import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBug, useBugComments, useAddComment, useBugHistory, useBugRelations, useBugAttachments, useUploadAttachment, useUpdateBugStatus, useAssignBug, useDeleteBug, useBugConfirmations } from '@/hooks/useBugs';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/store/auth-context';
import { predictFixTime, suggestAssignee, getFixImpact } from '@/api/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { formatDateTime, timeAgo } from '@/lib/utils';
import {
  Edit, Trash2, Clock, User, Tag, AlertTriangle, Sparkles,
  MessageSquare, Paperclip, GitBranch, Activity, ChevronRight, Shield, Upload
} from 'lucide-react';

const STATUS_VARIANT: Record<string, any> = { OPEN: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', RESOLVED: 'green', CLOSED: 'gray', REOPENED: 'red' };
const SEVERITY_VARIANT: Record<string, any> = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue', TRIVIAL: 'gray' };
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['IN_REVIEW', 'OPEN', 'CLOSED'],
  IN_REVIEW: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'CLOSED'],
};

export default function BugDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: bug, isLoading } = useBug(id!);
  const { data: comments } = useBugComments(id!);
  const { data: history } = useBugHistory(id!);
  const { data: relations } = useBugRelations(id!);
  const { data: attachments } = useBugAttachments(id!);
  const { data: confirmations } = useBugConfirmations(id!);
  const { data: usersData } = useUsers();
  const addComment = useAddComment();
  const uploadAttachment = useUploadAttachment();
  const updateStatus = useUpdateBugStatus();
  const assignBug = useAssignBug();
  const deleteBug = useDeleteBug();

  const [commentText, setCommentText] = useState('');
  const [aiFixTime, setAiFixTime] = useState<any>(null);
  const [aiAssignee, setAiAssignee] = useState<any>(null);
  const [aiImpact, setAiImpact] = useState<any>(null);

  if (isLoading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!bug) return <div className="text-center py-12 text-muted-foreground">Bug not found</div>;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: bug.id, status: newStatus }, {
      onSuccess: () => toast({ title: `Status changed to ${newStatus.replace('_', ' ')}` }),
    });
  };

  const handleAssign = (assigneeId: string) => {
    if (assigneeId) assignBug.mutate({ id: bug.id, assigneeId: Number(assigneeId) });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this bug?')) {
      deleteBug.mutate(bug.id, { onSuccess: () => navigate('/bugs') });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ bugId: bug.id, data: { content: commentText } }, {
      onSuccess: () => { setCommentText(''); toast({ title: 'Comment added' }); },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAttachment.mutate({ bugId: bug.id, file }, {
      onSuccess: () => toast({ title: 'File uploaded' }),
    });
  };

  const handlePredictFixTime = async () => {
    try { const res = await predictFixTime(bug.id); setAiFixTime(res); } catch { /* ignore */ }
  };
  const handleSuggestAssignee = async () => {
    try { const res = await suggestAssignee(bug.id); setAiAssignee(res); } catch { /* ignore */ }
  };
  const handleFixImpact = async () => {
    try { const res = await getFixImpact(bug.id); setAiImpact(res); } catch { /* ignore */ }
  };

  const nextStatuses = VALID_TRANSITIONS[bug.status] || [];
  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.content || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/bugs" className="hover:text-primary">Bugs</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono">{bug.projectKey}-{bug.id}</span>
          </div>
          <h1 className="text-2xl font-bold">{bug.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={STATUS_VARIANT[bug.status]}>{bug.status.replace('_', ' ')}</Badge>
            <Badge variant={SEVERITY_VARIANT[bug.severity]}>{bug.severity}</Badge>
            <Badge variant="outline">{bug.priority}</Badge>
            <Badge variant="outline">{bug.bugType}</Badge>
            {bug.isStale && <Badge variant="orange">Stale</Badge>}
            {bug.technicalDebt && <Badge variant="red">Tech Debt</Badge>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/bugs/${bug.id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button></Link>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {bug.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm">{bug.description}</p></CardContent>
            </Card>
          )}

          {/* Steps to Reproduce */}
          {bug.stepsToReproduce && (
            <Card>
              <CardHeader><CardTitle className="text-base">Steps to Reproduce</CardTitle></CardHeader>
              <CardContent><pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-3 rounded-md">{bug.stepsToReproduce}</pre></CardContent>
            </Card>
          )}

          {/* Expected vs Actual */}
          {(bug.expectedBehavior || bug.actualBehavior) && (
            <div className="grid gap-4 md:grid-cols-2">
              {bug.expectedBehavior && (
                <Card>
                  <CardHeader><CardTitle className="text-base text-green-600">Expected Behavior</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{bug.expectedBehavior}</p></CardContent>
                </Card>
              )}
              {bug.actualBehavior && (
                <Card>
                  <CardHeader><CardTitle className="text-base text-red-600">Actual Behavior</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{bug.actualBehavior}</p></CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tabs: Comments, History, Relations, Attachments */}
          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments"><MessageSquare className="h-4 w-4 mr-1" />Comments ({comments?.length || 0})</TabsTrigger>
              <TabsTrigger value="history"><Activity className="h-4 w-4 mr-1" />History ({history?.length || 0})</TabsTrigger>
              <TabsTrigger value="relations"><GitBranch className="h-4 w-4 mr-1" />Relations ({relations?.length || 0})</TabsTrigger>
              <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1" />Files ({attachments?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="comments">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {(comments || []).map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                        {c.userName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{c.userName}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>}
                  <Separator />
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <Textarea placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} />
                    <Button type="submit" size="sm" disabled={!commentText.trim() || addComment.isPending}>Add Comment</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {(history || []).map((h: any) => (
                      <div key={h.id} className="flex items-start gap-3 text-sm">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <Activity className="h-3 w-3" />
                        </div>
                        <div>
                          <span className="font-medium">{h.userName}</span> changed <span className="font-mono text-xs bg-muted px-1 rounded">{h.field}</span>
                          {h.oldValue && <> from <Badge variant="outline" className="text-xs">{h.oldValue}</Badge></>}
                          {h.newValue && <> to <Badge variant="outline" className="text-xs">{h.newValue}</Badge></>}
                          <span className="text-muted-foreground ml-2">{timeAgo(h.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    {(!history || history.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No history</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relations">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {(relations || []).map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{r.relationType.replace('_', ' ')}</Badge>
                          <Link to={`/bugs/${r.targetBugId}`} className="text-primary hover:underline">{r.targetBugTitle}</Link>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">#{r.targetBugId}</span>
                      </div>
                    ))}
                    {(!relations || relations.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No relations</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {(attachments || []).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-2 text-sm border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{a.fileName}</a>
                        <span className="text-xs text-muted-foreground">({(a.fileSize / 1024).toFixed(1)} KB)</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.uploadedByName} &middot; {timeAgo(a.createdAt)}</span>
                    </div>
                  ))}
                  {(!attachments || attachments.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>}
                  <div className="pt-2">
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Upload File</span></Button>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Actions */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Transition to:</p>
                <div className="flex flex-wrap gap-1">
                  {nextStatuses.map(s => (
                    <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => handleStatusChange(s)}>
                      {s.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assign to:</p>
                <select className="w-full h-8 rounded-md border bg-background px-2 text-sm" value={bug.assigneeId || ''} onChange={(e) => handleAssign(e.target.value)}>
                  <option value="">Unassigned</option>
                  {(Array.isArray(users) ? users : []).map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Project</span><Link to={`/projects/${bug.projectId}`} className="text-primary hover:underline">{bug.projectName}</Link></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reporter</span><span>{bug.reporterName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Assignee</span><span>{bug.assigneeName || 'Unassigned'}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDateTime(bug.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span>{formatDateTime(bug.updatedAt)}</span></div>
              {bug.closedAt && <div className="flex justify-between"><span className="text-muted-foreground">Closed</span><span>{formatDateTime(bug.closedAt)}</span></div>}
              {bug.affectedVersion && <div className="flex justify-between"><span className="text-muted-foreground">Affected</span><span className="font-mono text-xs">{bug.affectedVersion}</span></div>}
              {bug.fixedVersion && <div className="flex justify-between"><span className="text-muted-foreground">Fixed in</span><span className="font-mono text-xs">{bug.fixedVersion}</span></div>}
              {bug.tags && bug.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">{bug.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reproducibility */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Shield className="h-4 w-4" />Reproducibility</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-primary" strokeWidth="3"
                      strokeDasharray={`${(bug.reproducibilityScore || 0)} ${100 - (bug.reproducibilityScore || 0)}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(bug.reproducibilityScore || 0)}%</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{confirmations?.filter((c: any) => c.confirmed).length || 0} confirmed</p>
                  <p>{confirmations?.filter((c: any) => !c.confirmed).length || 0} could not reproduce</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Sparkles className="h-4 w-4" />AI Insights</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={handlePredictFixTime}>
                <Clock className="h-3 w-3 mr-2" />Predict Fix Time
              </Button>
              {aiFixTime && <p className="text-xs text-muted-foreground pl-5">Est. {aiFixTime.predictedFixHours?.toFixed(1) || '?'} hours</p>}

              <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={handleSuggestAssignee}>
                <User className="h-3 w-3 mr-2" />Suggest Assignee
              </Button>
              {aiAssignee && <p className="text-xs text-muted-foreground pl-5">Suggested: {aiAssignee.suggestedAssigneeName || 'N/A'}</p>}

              <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={handleFixImpact}>
                <AlertTriangle className="h-3 w-3 mr-2" />Fix Impact Analysis
              </Button>
              {aiImpact && (
                <div className="text-xs text-muted-foreground pl-5 space-y-1">
                  <p>Risk: <Badge variant={aiImpact.riskLevel === 'HIGH' ? 'red' : aiImpact.riskLevel === 'MEDIUM' ? 'yellow' : 'green'} className="text-xs">{aiImpact.riskLevel}</Badge></p>
                  <p>Impact score: {aiImpact.impactScore}</p>
                  {aiImpact.affectedAreas?.length > 0 && <p>Areas: {aiImpact.affectedAreas.join(', ')}</p>}
                </div>
              )}

              {bug.predictedSeverity && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>AI Severity: <Badge variant="outline" className="text-xs">{bug.predictedSeverity}</Badge></p>
                </div>
              )}
              {bug.predictedFixHours && (
                <div className="text-xs text-muted-foreground">
                  <p>Predicted fix: {bug.predictedFixHours.toFixed(1)}h</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
