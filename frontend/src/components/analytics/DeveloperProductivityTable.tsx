import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeveloperStats } from '@/types';

interface DeveloperProductivityTableProps {
  data?: DeveloperStats[];
  isLoading: boolean;
}

export default function DeveloperProductivityTable({
  data,
  isLoading,
}: DeveloperProductivityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Developer Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Developer</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">Resolved</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Avg Fix (h)</TableHead>
                <TableHead className="text-right hidden md:table-cell">Reopen Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((dev) => (
                <TableRow key={dev.userId}>
                  <TableCell className="font-medium">{dev.userName}</TableCell>
                  <TableCell className="text-right">{dev.openBugs}</TableCell>
                  <TableCell className="text-right">{dev.resolvedBugs}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {dev.avgFixTimeHours.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <span
                      className={
                        dev.reopenRate > 20
                          ? 'text-red-500'
                          : dev.reopenRate > 10
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }
                    >
                      {dev.reopenRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No developer stats available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
