export interface Project {
  id: number;
  name: string;
  key: string;
  description?: string;
  ownerId: number;
  ownerName: string;
  bugCount: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

export interface ProjectStats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  closedBugs: number;
  bugsByStatus: Record<string, number>;
  bugsBySeverity: Record<string, number>;
  avgResolutionTime: number;
}
