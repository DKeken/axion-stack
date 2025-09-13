'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuthStore } from '~/stores/auth-store';

export const AUTH_PROFILE_QUERY_KEY = ['user-profile'];

export function useProfileRefresh(refetch?: () => Promise<unknown>) {
  const queryClient = useQueryClient();
  const updateProfile = useAuthStore((state) => state.updateProfile);

  return useCallback(async () => {
    await updateProfile();
    await queryClient.invalidateQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
    if (refetch) {
      await refetch();
    }
  }, [updateProfile, queryClient, refetch]);
}
