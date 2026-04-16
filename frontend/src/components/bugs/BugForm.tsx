import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import type { Bug, CreateBugRequest } from '@/types';

const bugSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'TRIVIAL']),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
  bugType: z.enum(['BUG', 'FEATURE', 'IMPROVEMENT', 'TASK']),
  projectId: z.number({ required_error: 'Project is required' }).min(1, 'Project is required'),
  assigneeId: z.number().optional(),
  tags: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  affectedVersion: z.string().optional(),
});

type BugFormData = z.infer<typeof bugSchema>;

interface BugFormProps {
  defaultValues?: Partial<Bug>;
  onSubmit: (data: CreateBugRequest) => void;
  isSubmitting?: boolean;
  onTitleBlur?: (title: string) => void;
  onSeverityPredict?: (title: string, description?: string) => void;
}

export default function BugForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onTitleBlur,
  onSeverityPredict,
}: BugFormProps) {
  const { data: projects } = useProjects();
  const { data: users } = useUsers();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BugFormData>({
    resolver: zodResolver(bugSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      severity: defaultValues?.severity || 'MEDIUM',
      priority: defaultValues?.priority || 'MEDIUM',
      bugType: defaultValues?.bugType || 'BUG',
      projectId: defaultValues?.projectId || 0,
      assigneeId: defaultValues?.assigneeId || undefined,
      tags: defaultValues?.tags?.join(', ') || '',
      stepsToReproduce: defaultValues?.stepsToReproduce || '',
      expectedBehavior: defaultValues?.expectedBehavior || '',
      actualBehavior: defaultValues?.actualBehavior || '',
      affectedVersion: defaultValues?.affectedVersion || '',
    },
  });

  const title = watch('title');
  const description = watch('description');

  const handleFormSubmit = (data: BugFormData) => {
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;
    onSubmit({
      ...data,
      tags,
      assigneeId: data.assigneeId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              onBlur={() => {
                if (title && onTitleBlur) onTitleBlur(title);
                if (title && onSeverityPredict) onSeverityPredict(title, description);
              }}
              placeholder="Brief description of the bug"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value="">Select project</option>
                    {projects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select {...register('severity')}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="TRIVIAL">Trivial</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select {...register('priority')}>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select {...register('bugType')}>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="TASK">Task</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Unassigned</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" {...register('tags')} placeholder="ui, backend, auth" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reproduction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
            <Textarea
              id="stepsToReproduce"
              {...register('stepsToReproduce')}
              rows={3}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedBehavior">Expected Behavior</Label>
              <Textarea
                id="expectedBehavior"
                {...register('expectedBehavior')}
                rows={2}
                placeholder="What should happen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualBehavior">Actual Behavior</Label>
              <Textarea
                id="actualBehavior"
                {...register('actualBehavior')}
                rows={2}
                placeholder="What actually happens"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affectedVersion">Affected Version</Label>
            <Input
              id="affectedVersion"
              {...register('affectedVersion')}
              placeholder="e.g., 2.1.0"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues?.id ? 'Update Bug' : 'Create Bug'}
        </Button>
      </div>
    </form>
  );
}
