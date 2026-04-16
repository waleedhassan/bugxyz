import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Clock, User, Zap } from 'lucide-react';
import * as aiApi from '@/api/ai';
import type { AIPrediction } from '@/types';

interface AISuggestionsPanelProps {
  bugId: number;
}

export default function AISuggestionsPanel({ bugId }: AISuggestionsPanelProps) {
  const [fixTime, setFixTime] = useState<AIPrediction | null>(null);
  const [assignee, setAssignee] = useState<AIPrediction | null>(null);
  const [impact, setImpact] = useState<{
    impactScore: number;
    affectedAreas: string[];
    riskLevel: string;
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const predictFixTime = async () => {
    setLoading('fix-time');
    try {
      const data = await aiApi.predictFixTime(bugId);
      setFixTime(data);
    } catch { /* silently fail */ }
    setLoading(null);
  };

  const suggestAssignee = async () => {
    setLoading('assignee');
    try {
      const data = await aiApi.suggestAssignee(bugId);
      setAssignee(data);
    } catch { /* silently fail */ }
    setLoading(null);
  };

  const getImpact = async () => {
    setLoading('impact');
    try {
      const data = await aiApi.getFixImpact(bugId);
      setImpact(data);
    } catch { /* silently fail */ }
    setLoading(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={predictFixTime}
            disabled={loading === 'fix-time'}
          >
            <Clock className="h-4 w-4 mr-2" />
            Predict Fix Time
          </Button>
          {loading === 'fix-time' && <Skeleton className="h-8 w-full" />}
          {fixTime?.predictedFixHours != null && (
            <div className="rounded-md bg-muted p-2 text-sm">
              Estimated: <span className="font-semibold">{fixTime.predictedFixHours}h</span>
              {fixTime.confidence != null && (
                <span className="text-muted-foreground ml-2">
                  ({Math.round(fixTime.confidence * 100)}% confidence)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={suggestAssignee}
            disabled={loading === 'assignee'}
          >
            <User className="h-4 w-4 mr-2" />
            Suggest Assignee
          </Button>
          {loading === 'assignee' && <Skeleton className="h-8 w-full" />}
          {assignee?.suggestedAssigneeName && (
            <div className="rounded-md bg-muted p-2 text-sm">
              Suggested: <span className="font-semibold">{assignee.suggestedAssigneeName}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={getImpact}
            disabled={loading === 'impact'}
          >
            <Zap className="h-4 w-4 mr-2" />
            Analyze Fix Impact
          </Button>
          {loading === 'impact' && <Skeleton className="h-12 w-full" />}
          {impact && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Impact Score</span>
                <span className="font-semibold">{impact.impactScore}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Risk Level</span>
                <span className={`font-semibold ${
                  impact.riskLevel === 'HIGH' ? 'text-red-500' :
                  impact.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {impact.riskLevel}
                </span>
              </div>
              {impact.affectedAreas.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Affected Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {impact.affectedAreas.map((area) => (
                      <span key={area} className="px-1.5 py-0.5 rounded bg-background text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
