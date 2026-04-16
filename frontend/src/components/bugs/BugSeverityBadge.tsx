import { Badge } from '@/components/ui/badge';
import type { BugSeverity } from '@/types';

const severityConfig: Record<BugSeverity, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' },
  LOW: { label: 'Low', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800' },
  TRIVIAL: { label: 'Trivial', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' },
};

export default function BugSeverityBadge({ severity }: { severity: BugSeverity }) {
  const config = severityConfig[severity] || { label: severity, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
