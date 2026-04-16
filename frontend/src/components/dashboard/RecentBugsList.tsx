import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BugStatusBadge from '@/components/bugs/BugStatusBadge';
import BugSeverityBadge from '@/components/bugs/BugSeverityBadge';
import { timeAgo } from '@/lib/utils';
import type { Bug } from '@/types';

interface RecentBugsListProps {
  bugs?: Bug[];
  isLoading: boolean;
}

export default function RecentBugsList({ bugs, isLoading }: RecentBugsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Bugs</CardTitle>
        <Link to="/bugs" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : bugs && bugs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Severity</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugs.slice(0, 5).map((bug) => (
                <TableRow key={bug.id}>
                  <TableCell>
                    <Link
                      to={`/bugs/${bug.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {bug.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <BugStatusBadge status={bug.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <BugSeverityBadge severity={bug.severity} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {timeAgo(bug.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent bugs</p>
        )}
      </CardContent>
    </Card>
  );
}
