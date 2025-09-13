import { apiContract } from '@repo/contracts';
import { initQueryClient } from '@ts-rest/react-query';

import { useAuthStore } from '~/stores/auth-store';

// Initialize the API client with ts-rest
const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

export const apiClient = initQueryClient(apiContract, {
  baseUrl: apiBaseUrl,
  baseHeaders: {
    'Content-Type': 'application/json',
    Authorization: () => {
      const state = useAuthStore.getState();
      const token = state.hasValidToken() ? state.accessToken : null;
      return token ? `Bearer ${token}` : '';
    },
  },
  credentials: 'include', // Include cookies for refresh token
  // Remove queryClient from here - let ts-rest use the QueryClient from context
});

// Helper function to get file URLs from files service (re-exported from files-client)
export { getFileUrl, getAvatarUrl } from './files-client';
