import client from './client';
import type { Comment, CreateCommentRequest } from '@/types';

export async function getComments(bugId: number): Promise<Comment[]> {
  const res = await client.get<Comment[]>(`/bugs/${bugId}/comments`);
  return res.data;
}

export async function createComment(bugId: number, data: CreateCommentRequest): Promise<Comment> {
  const res = await client.post<Comment>(`/bugs/${bugId}/comments`, data);
  return res.data;
}
