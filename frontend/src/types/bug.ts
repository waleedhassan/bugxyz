export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'TRIVIAL';
export type BugPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugType = 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'TASK';
export type RelationType = 'DUPLICATE_OF' | 'BLOCKED_BY' | 'BLOCKS' | 'RELATED_TO' | 'PARENT_OF' | 'CHILD_OF';

export interface Bug {
  id: number;
  projectId: number;
  projectName: string;
  projectKey: string;
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  title: string;
  description?: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: BugPriority;
  bugType: BugType;
  tags: string[];
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  affectedVersion?: string;
  fixedVersion?: string;
  reproducibilityScore: number;
  predictedSeverity?: string;
  predictedFixHours?: number;
  isStale: boolean;
  staleSince?: string;
  technicalDebt: boolean;
  debtCategory?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface CreateBugRequest {
  projectId: number;
  title: string;
  description?: string;
  severity: BugSeverity;
  priority: BugPriority;
  bugType: BugType;
  assigneeId?: number;
  tags?: string[];
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  affectedVersion?: string;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string;
  severity?: BugSeverity;
  priority?: BugPriority;
  bugType?: BugType;
  assigneeId?: number;
  tags?: string[];
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  affectedVersion?: string;
  fixedVersion?: string;
}

export interface BugFilter {
  page?: number;
  size?: number;
  search?: string;
  status?: BugStatus[];
  severity?: BugSeverity[];
  priority?: BugPriority;
  bugType?: BugType;
  projectId?: number;
  assigneeId?: number;
  reporterId?: number;
  isStale?: boolean;
  technicalDebt?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BugRelation {
  id: number;
  sourceBugId: number;
  sourceBugTitle: string;
  targetBugId: number;
  targetBugTitle: string;
  relationType: RelationType;
  createdAt: string;
}

export interface BugConfirmation {
  id: number;
  bugId: number;
  userId: number;
  userName: string;
  confirmed: boolean;
  comment?: string;
  createdAt: string;
}

export interface BugEnvironment {
  id: number;
  bugId: number;
  os: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  deviceType: string;
  screenResolution?: string;
  appVersion?: string;
  additionalInfo?: string;
  createdAt: string;
}

export interface BugHistory {
  id: number;
  bugId: number;
  userId: number;
  userName: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  bugId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  uploadedById: number;
  uploadedByName: string;
  createdAt: string;
}
