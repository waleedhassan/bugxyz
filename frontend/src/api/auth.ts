import client from './client';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/refresh', { refreshToken: token });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get<User>('/auth/me');
  return res.data;
}

export async function updateMe(data: Partial<User>): Promise<User> {
  const res = await client.put<User>('/auth/me', data);
  return res.data;
}
