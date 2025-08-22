import { apiContract } from '@repo/contracts';
import { initQueryClient } from '@ts-rest/react-query';

import { useAuthStore } from '~/stores/auth-store';

// Initialize the API client with ts-rest
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

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
});
