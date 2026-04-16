import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import type { DuplicateCandidate } from '@/types';

interface DuplicateWarningPanelProps {
  duplicates: DuplicateCandidate[];
}

export default function DuplicateWarningPanel({ duplicates }: DuplicateWarningPanelProps) {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          Potential Duplicates Found
        </h4>
      </div>
      <ul className="space-y-2">
        {duplicates.map((dup) => (
          <li
            key={dup.bugId}
            className="flex items-center justify-between text-sm"
          >
            <Link
              to={`/bugs/${dup.bugId}`}
              className="text-yellow-900 dark:text-yellow-100 hover:underline font-medium truncate flex-1 mr-2"
            >
              #{dup.bugId}: {dup.title}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{dup.status}</span>
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800 px-1.5 py-0.5 rounded">
                {Math.round((dup.similarity ?? 0) * 100)}% match
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
