import client from './client';
import type {
  Bug,
  CreateBugRequest,
  UpdateBugRequest,
  BugFilter,
  BugRelation,
  BugConfirmation,
  BugEnvironment,
  BugHistory,
  Attachment,
  Comment,
  CreateCommentRequest,
  Page,
} from '@/types';

export async function getBugs(filters?: BugFilter): Promise<Page<Bug>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }
    });
  }
  const res = await client.get<Page<Bug>>('/bugs', { params });
  return res.data;
}

export async function getBug(id: number): Promise<Bug> {
  const res = await client.get<Bug>(`/bugs/${id}`);
  return res.data;
}

export async function createBug(data: CreateBugRequest): Promise<Bug> {
  const res = await client.post<Bug>('/bugs', data);
  return res.data;
}

export async function updateBug(id: number, data: UpdateBugRequest): Promise<Bug> {
  const res = await client.put<Bug>(`/bugs/${id}`, data);
  return res.data;
}

export async function deleteBug(id: number): Promise<void> {
  await client.delete(`/bugs/${id}`);
}

export async function updateBugStatus(id: number, status: string): Promise<Bug> {
  const res = await client.patch<Bug>(`/bugs/${id}/status`, { status });
  return res.data;
}

export async function assignBug(id: number, assigneeId: number): Promise<Bug> {
  const res = await client.patch<Bug>(`/bugs/${id}/assign`, { assigneeId });
  return res.data;
}

export async function getBugComments(bugId: number): Promise<Comment[]> {
  const res = await client.get<Comment[]>(`/bugs/${bugId}/comments`);
  return res.data;
}

export async function createBugComment(bugId: number, data: CreateCommentRequest): Promise<Comment> {
  const res = await client.post<Comment>(`/bugs/${bugId}/comments`, data);
  return res.data;
}

export async function getBugAttachments(bugId: number): Promise<Attachment[]> {
  const res = await client.get<Attachment[]>(`/bugs/${bugId}/attachments`);
  return res.data;
}

export async function uploadAttachment(bugId: number, file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<Attachment>(`/bugs/${bugId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getBugHistory(bugId: number): Promise<BugHistory[]> {
  const res = await client.get<BugHistory[]>(`/bugs/${bugId}/history`);
  return res.data;
}

export async function getBugRelations(bugId: number): Promise<BugRelation[]> {
  const res = await client.get<BugRelation[]>(`/bugs/${bugId}/relations`);
  return res.data;
}

export async function createBugRelation(
  bugId: number,
  data: { targetBugId: number; relationType: string }
): Promise<BugRelation> {
  const res = await client.post<BugRelation>(`/bugs/${bugId}/relations`, data);
  return res.data;
}

export async function getBugConfirmations(bugId: number): Promise<BugConfirmation[]> {
  const res = await client.get<BugConfirmation[]>(`/bugs/${bugId}/confirmations`);
  return res.data;
}

export async function confirmBug(
  bugId: number,
  data: { confirmed: boolean; comment?: string }
): Promise<BugConfirmation> {
  const res = await client.post<BugConfirmation>(`/bugs/${bugId}/confirmations`, data);
  return res.data;
}

export async function getBugEnvironment(bugId: number): Promise<BugEnvironment[]> {
  const res = await client.get<BugEnvironment[]>(`/bugs/${bugId}/environment`);
  return res.data;
}

export async function addBugEnvironment(
  bugId: number,
  data: Omit<BugEnvironment, 'id' | 'bugId' | 'createdAt'>
): Promise<BugEnvironment> {
  const res = await client.post<BugEnvironment>(`/bugs/${bugId}/environment`, data);
  return res.data;
}
