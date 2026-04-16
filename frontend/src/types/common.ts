export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface DashboardData {
  totalOpenBugs: number;
  resolvedToday: number;
  myAssigned: number;
  criticalBugs: number;
  bugsByStatus: Record<string, number>;
  bugsBySeverity: Record<string, number>;
  recentBugs: import('./bug').Bug[];
  recentActivities: Activity[];
}

export interface Activity {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  entityTitle: string;
  details?: string;
  createdAt: string;
}

export interface MttfData {
  severity: string;
  avgHours: number;
  count: number;
}

export interface ThroughputData {
  week: string;
  opened: number;
  resolved: number;
}

export interface BugAgingData {
  bucket: string;
  count: number;
  severity: string;
}

export interface DeveloperStats {
  userId: number;
  userName: string;
  openBugs: number;
  resolvedBugs: number;
  avgFixTimeHours: number;
  reopenRate: number;
}

export interface ReopenRateData {
  project: string;
  rate: number;
}

export interface TechDebtItem {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UserWorkload {
  userId: number;
  userName: string;
  openBugs: number;
  inProgressBugs: number;
  avgFixTime: number;
}

export interface DuplicateCandidate {
  bugId: number;
  bugTitle: string;
  title?: string;
  status: string;
  similarityScore: number;
  similarity?: number;
}

export interface AIPrediction {
  predictedSeverity?: string;
  predictedPriority?: string;
  confidence?: number;
  predictedFixHours?: number;
  suggestedAssigneeId?: number;
  suggestedAssigneeName?: string;
  duplicates?: DuplicateCandidate[];
}

export interface NLParseResult {
  title: string;
  description?: string;
  severity?: string;
  priority?: string;
  bugType?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  tags?: string[];
}
