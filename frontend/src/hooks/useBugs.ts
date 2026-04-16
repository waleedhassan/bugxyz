import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bugsApi from '@/api/bugs';
import { toast } from '@/components/ui/use-toast';
import type { BugFilter, CreateBugRequest, UpdateBugRequest, CreateCommentRequest } from '@/types';

export function useBugs(filters?: BugFilter) {
  return useQuery({ queryKey: ['bugs', filters], queryFn: () => bugsApi.getBugs(filters) });
}

export function useBug(id: number | string) {
  return useQuery({ queryKey: ['bug', id], queryFn: () => bugsApi.getBug(Number(id)), enabled: !!id });
}

export function useCreateBug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBugRequest) => bugsApi.createBug(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bugs'] }); toast({ title: 'Bug created' }); },
    onError: () => toast({ title: 'Failed to create bug', variant: 'destructive' }),
  });
}

export function useUpdateBug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBugRequest }) => bugsApi.updateBug(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bugs'] });
      qc.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug updated' });
    },
  });
}

export function useUpdateBugStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => bugsApi.updateBugStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bugs'] });
      qc.invalidateQueries({ queryKey: ['bug', id] });
    },
  });
}

export function useAssignBug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: number; assigneeId: number }) => bugsApi.assignBug(id, assigneeId),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ['bug', id] }); },
  });
}

export function useDeleteBug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bugsApi.deleteBug(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bugs'] }); toast({ title: 'Bug deleted' }); },
  });
}

export function useBugComments(bugId: number | string) {
  return useQuery({
    queryKey: ['bugComments', bugId],
    queryFn: () => bugsApi.getBugComments(Number(bugId)),
    enabled: !!bugId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bugId, data }: { bugId: number; data: CreateCommentRequest }) =>
      bugsApi.createBugComment(bugId, data),
    onSuccess: (_, { bugId }) => { qc.invalidateQueries({ queryKey: ['bugComments', bugId] }); },
  });
}

export function useBugHistory(bugId: number | string) {
  return useQuery({
    queryKey: ['bugHistory', bugId],
    queryFn: () => bugsApi.getBugHistory(Number(bugId)),
    enabled: !!bugId,
  });
}

export function useBugRelations(bugId: number | string) {
  return useQuery({
    queryKey: ['bugRelations', bugId],
    queryFn: () => bugsApi.getBugRelations(Number(bugId)),
    enabled: !!bugId,
  });
}

export function useCreateBugRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bugId, data }: { bugId: number; data: { targetBugId: number; relationType: string } }) =>
      bugsApi.createBugRelation(bugId, data),
    onSuccess: (_, { bugId }) => { qc.invalidateQueries({ queryKey: ['bugRelations', bugId] }); },
  });
}

export function useBugConfirmations(bugId: number | string) {
  return useQuery({
    queryKey: ['bugConfirmations', bugId],
    queryFn: () => bugsApi.getBugConfirmations(Number(bugId)),
    enabled: !!bugId,
  });
}

export function useBugAttachments(bugId: number | string) {
  return useQuery({
    queryKey: ['bugAttachments', bugId],
    queryFn: () => bugsApi.getBugAttachments(Number(bugId)),
    enabled: !!bugId,
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bugId, file }: { bugId: number; file: File }) =>
      bugsApi.uploadAttachment(bugId, file),
    onSuccess: (_, { bugId }) => { qc.invalidateQueries({ queryKey: ['bugAttachments', bugId] }); },
  });
}
