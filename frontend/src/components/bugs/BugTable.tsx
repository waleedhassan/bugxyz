import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BugStatusBadge from './BugStatusBadge';
import BugSeverityBadge from './BugSeverityBadge';
import { timeAgo } from '@/lib/utils';
import type { Bug, Page } from '@/types';

interface BugTableProps {
  data?: Page<Bug>;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function BugTable({ data, isLoading, page, onPageChange }: BugTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No bugs found</p>
        <p className="text-sm">Try adjusting your filters or create a new bug.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="hidden md:table-cell">Project</TableHead>
            <TableHead className="hidden lg:table-cell">Assignee</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.content.map((bug) => (
            <TableRow key={bug.id}>
              <TableCell>
                <Link
                  to={`/bugs/${bug.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {bug.title}
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {bug.projectKey}-{bug.id}
                </div>
              </TableCell>
              <TableCell>
                <BugStatusBadge status={bug.status} />
              </TableCell>
              <TableCell>
                <BugSeverityBadge severity={bug.severity} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {bug.projectName}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {bug.assigneeName || 'Unassigned'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                {timeAgo(bug.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {data.number * data.size + 1}-{Math.min((data.number + 1) * data.size, data.totalElements)} of{' '}
          {data.totalElements}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {data.number + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.last}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
