import client from './client';
import type {
  DashboardData,
  MttfData,
  ThroughputData,
  BugAgingData,
  DeveloperStats,
  TechDebtItem,
} from '@/types';
import type { Bug } from '@/types';

export async function getDashboard(): Promise<DashboardData> {
  const res = await client.get<DashboardData>('/analytics/dashboard');
  return res.data;
}

export async function getMttf(): Promise<MttfData[]> {
  const res = await client.get<MttfData[]>('/analytics/mttf');
  return res.data;
}

export async function getThroughput(): Promise<ThroughputData[]> {
  const res = await client.get<ThroughputData[]>('/analytics/throughput');
  return res.data;
}

export async function getAging(): Promise<BugAgingData[]> {
  const res = await client.get<BugAgingData[]>('/analytics/aging');
  return res.data;
}

export async function getDeveloperStatsData(): Promise<DeveloperStats[]> {
  const res = await client.get<DeveloperStats[]>('/analytics/developer-stats');
  return res.data;
}

export async function getStaleBugs(): Promise<Bug[]> {
  const res = await client.get<Bug[]>('/analytics/stale-bugs');
  return res.data;
}

export async function getTechDebt(): Promise<TechDebtItem[]> {
  const res = await client.get<TechDebtItem[]>('/analytics/tech-debt');
  return res.data;
}
