import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '@/api/users';
import { toast } from '@/components/ui/use-toast';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => usersApi.getUsers() });
}

export function useUser(id: number | string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(Number(id)),
    enabled: !!id,
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => usersApi.updateUserRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Role updated' });
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      usersApi.updateUserActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User status updated' });
    },
  });
}

export function useUserWorkload(id: number | string) {
  return useQuery({
    queryKey: ['userWorkload', id],
    queryFn: () => usersApi.getUserWorkload(Number(id)),
    enabled: !!id,
  });
}
