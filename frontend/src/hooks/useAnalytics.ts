import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '@/api/analytics';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: analyticsApi.getDashboard });
}

export function useMttf() {
  return useQuery({ queryKey: ['mttf'], queryFn: analyticsApi.getMttf });
}

export function useThroughput() {
  return useQuery({ queryKey: ['throughput'], queryFn: analyticsApi.getThroughput });
}

export function useBugAging() {
  return useQuery({ queryKey: ['bugAging'], queryFn: analyticsApi.getAging });
}

export function useDeveloperStats() {
  return useQuery({ queryKey: ['developerStats'], queryFn: analyticsApi.getDeveloperStatsData });
}

export function useStaleBugs() {
  return useQuery({ queryKey: ['staleBugs'], queryFn: analyticsApi.getStaleBugs });
}

export function useTechDebt() {
  return useQuery({ queryKey: ['techDebt'], queryFn: analyticsApi.getTechDebt });
}
