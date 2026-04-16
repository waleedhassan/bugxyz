import { Badge } from '@/components/ui/badge';
import type { BugStatus } from '@/types';

const statusConfig: Record<BugStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' },
  IN_REVIEW: { label: 'In Review', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800' },
  CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' },
  REOPENED: { label: 'Reopened', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800' },
};

export default function BugStatusBadge({ status }: { status: BugStatus }) {
  const config = statusConfig[status] || { label: status, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
