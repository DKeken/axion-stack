import { useQueryClient } from '@tanstack/react-query';

import type { UserListQueryDto } from '@repo/backend/src/contracts';

import { apiClient } from '~/lib/api-client';

// Hook for fetching users list with advanced query options
export function useUsers(query?: UserListQueryDto) {
  return apiClient.users.list.useQuery(
    ['users', query], // Query key
    { query: query ?? {} } // Query data
  );
}

// Hook for fetching a single user by ID
export function useUser(id: string) {
  return apiClient.users.getById.useQuery(['users', id], { params: { id } });
}

// Hook for creating a new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return apiClient.users.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return apiClient.users.update.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return apiClient.users.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
