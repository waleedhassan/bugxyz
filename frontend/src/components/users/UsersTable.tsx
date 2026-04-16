import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useChangeUserRole, useToggleUserActive } from '@/hooks/useUsers';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

interface UsersTableProps {
  users?: User[];
  isLoading: boolean;
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DEVELOPER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TESTER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function UsersTable({ users, isLoading }: UsersTableProps) {
  const changeRole = useChangeUserRole();
  const toggleActive = useToggleUserActive();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No users found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="hidden md:table-cell">Joined</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar alt={user.fullName} src={user.avatarUrl} size="sm" />
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={user.role}
                onChange={(e) => changeRole.mutate({ id: user.id, role: e.target.value })}
                className="w-32"
              >
                <option value="ADMIN">Admin</option>
                <option value="DEVELOPER">Developer</option>
                <option value="TESTER">Tester</option>
              </Select>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                variant="outline"
                className={
                  user.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant={user.isActive ? 'outline' : 'default'}
                size="sm"
                onClick={() => toggleActive.mutate({ id: user.id, isActive: !user.isActive })}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
