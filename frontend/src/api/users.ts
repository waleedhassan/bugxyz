import client from './client';
import type { User, UserWorkload } from '@/types';

export async function getUsers(): Promise<User[]> {
  const res = await client.get<User[]>('/users');
  return res.data;
}

export async function getUser(id: number): Promise<User> {
  const res = await client.get<User>(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const res = await client.put<User>(`/users/${id}`, data);
  return res.data;
}

export async function updateUserRole(id: number, role: string): Promise<User> {
  const res = await client.put<User>(`/users/${id}/role`, { role });
  return res.data;
}

export async function updateUserActive(id: number, isActive: boolean): Promise<User> {
  const res = await client.put<User>(`/users/${id}/active`, { isActive });
  return res.data;
}

export async function getUserWorkload(id: number): Promise<UserWorkload> {
  const res = await client.get<UserWorkload>(`/users/${id}/workload`);
  return res.data;
}
