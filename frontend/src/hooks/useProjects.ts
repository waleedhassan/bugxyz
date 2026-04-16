import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import { toast } from '@/components/ui/use-toast';
import type { CreateProjectRequest } from '@/types';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.getProjects() });
}

export function useProject(id: number | string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(Number(id)),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project created' });
    },
    onError: () => toast({ title: 'Failed to create project', variant: 'destructive' }),
  });
}

export function useProjectMembers(projectId: number | string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectsApi.getProjectMembers(Number(projectId)),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: { userId: number; role: string } }) =>
      projectsApi.addProjectMember(projectId, data),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['projectMembers', projectId] });
    },
  });
}

export function useProjectStats(projectId: number | string) {
  return useQuery({
    queryKey: ['projectStats', projectId],
    queryFn: () => projectsApi.getProjectStats(Number(projectId)),
    enabled: !!projectId,
  });
}
