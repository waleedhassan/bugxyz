import client from './client';
import type { DuplicateCandidate, AIPrediction, NLParseResult } from '@/types';

export async function detectDuplicates(data: {
  title: string;
  description?: string;
  projectId?: number;
}): Promise<DuplicateCandidate[]> {
  const res = await client.post<DuplicateCandidate[]>('/ai/detect-duplicates', data);
  return res.data;
}

export async function predictSeverity(data: {
  title: string;
  description?: string;
}): Promise<AIPrediction> {
  const res = await client.post<AIPrediction>('/ai/predict-severity', data);
  return res.data;
}

export async function parseNaturalLanguage(data: { text: string }): Promise<NLParseResult> {
  const res = await client.post<NLParseResult>('/ai/parse-natural-language', data);
  return res.data;
}

export async function predictFixTime(bugId: number): Promise<AIPrediction> {
  const res = await client.get<AIPrediction>(`/ai/predict-fix-time/${bugId}`);
  return res.data;
}

export async function suggestAssignee(bugId: number): Promise<AIPrediction> {
  const res = await client.get<AIPrediction>(`/ai/suggest-assignee/${bugId}`);
  return res.data;
}

export async function generateReleaseNotes(
  projectId: number,
  version: string
): Promise<string> {
  const res = await client.get<string>(`/ai/release-notes/${projectId}`, {
    params: { version },
  });
  return res.data;
}

export async function getFixImpact(bugId: number): Promise<{
  impactScore: number;
  affectedAreas: string[];
  riskLevel: string;
  recommendations: string[];
}> {
  const res = await client.get(`/ai/fix-impact/${bugId}`);
  return res.data;
}
