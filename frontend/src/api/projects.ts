import client from './client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  ProjectStats,
} from '@/types';

export async function getProjects(): Promise<Project[]> {
  const res = await client.get<Project[]>('/projects');
  return res.data;
}

export async function getProject(id: number): Promise<Project> {
  const res = await client.get<Project>(`/projects/${id}`);
  return res.data;
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const res = await client.post<Project>('/projects', data);
  return res.data;
}

export async function updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
  const res = await client.put<Project>(`/projects/${id}`, data);
  return res.data;
}

export async function getProjectMembers(projectId: number): Promise<ProjectMember[]> {
  const res = await client.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return res.data;
}

export async function addProjectMember(
  projectId: number,
  data: { userId: number; role: string }
): Promise<ProjectMember> {
  const res = await client.post<ProjectMember>(`/projects/${projectId}/members`, data);
  return res.data;
}

export async function getProjectStats(projectId: number): Promise<ProjectStats> {
  const res = await client.get<ProjectStats>(`/projects/${projectId}/stats`);
  return res.data;
}
