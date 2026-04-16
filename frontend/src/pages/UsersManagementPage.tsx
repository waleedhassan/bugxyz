import { useUsers, useChangeUserRole, useToggleUserActive } from '@/hooks/useUsers';
import { useAuth } from '@/store/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, UserCheck, UserX, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ROLE_VARIANT: Record<string, any> = { ADMIN: 'red', DEVELOPER: 'blue', TESTER: 'green' };

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading } = useUsers();
  const changeRole = useChangeUserRole();
  const toggleActive = useToggleUserActive();

  const users = (usersData as any)?.content || usersData || [];
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" />User Management</h1>
          <p className="text-muted-foreground text-sm">{Array.isArray(users) ? users.length : 0} registered users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Shield className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-sm text-muted-foreground">Admins</p><p className="text-xl font-bold">{(Array.isArray(users) ? users : []).filter((u: any) => u.role === 'ADMIN').length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><UserCheck className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-muted-foreground">Developers</p><p className="text-xl font-bold">{(Array.isArray(users) ? users : []).filter((u: any) => u.role === 'DEVELOPER').length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><UserCheck className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Testers</p><p className="text-xl font-bold">{(Array.isArray(users) ? users : []).filter((u: any) => u.role === 'TESTER').length}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(users) ? users : []).map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {u.fullName?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{u.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {isAdmin && u.id !== currentUser?.id ? (
                        <select
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                          value={u.role}
                          onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value })}
                        >
                          {['ADMIN', 'DEVELOPER', 'TESTER'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'green' : 'gray'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {u.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                          >
                            {u.isActive ? <><UserX className="h-3 w-3 mr-1" />Deactivate</> : <><UserCheck className="h-3 w-3 mr-1" />Activate</>}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
