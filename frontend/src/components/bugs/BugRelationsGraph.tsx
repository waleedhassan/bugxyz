import { Link } from 'react-router-dom';
import { useBugRelations } from '@/hooks/useBugs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Link2 } from 'lucide-react';
import type { BugRelation } from '@/types';

interface BugRelationsGraphProps {
  bugId: number;
}

const relationLabels: Record<string, string> = {
  DUPLICATE_OF: 'Duplicate of',
  BLOCKED_BY: 'Blocked by',
  BLOCKS: 'Blocks',
  RELATED_TO: 'Related to',
  PARENT_OF: 'Parent of',
  CHILD_OF: 'Child of',
};

export default function BugRelationsGraph({ bugId }: BugRelationsGraphProps) {
  const { data: relations, isLoading } = useBugRelations(bugId);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        No related bugs
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {relations.map((rel: BugRelation) => {
        const isSource = rel.sourceBugId === bugId;
        const linkedId = isSource ? rel.targetBugId : rel.sourceBugId;
        const linkedTitle = isSource ? rel.targetBugTitle : rel.sourceBugTitle;

        return (
          <div
            key={rel.id}
            className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted/50 transition-colors"
          >
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">
              {relationLabels[rel.relationType] || rel.relationType}
            </span>
            <Link
              to={`/bugs/${linkedId}`}
              className="font-medium hover:underline text-primary truncate"
            >
              #{linkedId}: {linkedTitle}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
