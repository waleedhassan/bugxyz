import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { BugFilter, BugStatus, BugSeverity } from '@/types';
import type { Project } from '@/types';

interface BugFiltersProps {
  filters: BugFilter;
  onFiltersChange: (filters: BugFilter) => void;
  projects?: Project[];
}

const statuses: BugStatus[] = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'REOPENED'];
const severities: BugSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'TRIVIAL'];

export default function BugFilters({ filters, onFiltersChange, projects }: BugFiltersProps) {
  const updateFilter = (key: string, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value || undefined, page: 0 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 0, size: filters.size });
  };

  const hasActiveFilters = filters.status?.length || filters.severity?.length || filters.projectId || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bugs..."
          className="pl-8"
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>
      <Select
        value={filters.status?.[0] || ''}
        onChange={(e) => updateFilter('status', e.target.value ? [e.target.value] : undefined)}
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </Select>
      <Select
        value={filters.severity?.[0] || ''}
        onChange={(e) => updateFilter('severity', e.target.value ? [e.target.value] : undefined)}
      >
        <option value="">All Severities</option>
        {severities.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      {projects && (
        <Select
          value={filters.projectId?.toString() || ''}
          onChange={(e) => updateFilter('projectId', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      )}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
