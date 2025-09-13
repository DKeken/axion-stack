import { apiClient } from '~/lib/api-client';
import { useAuthStore } from '~/stores/auth-store';

// Query key для профиля пользователя
export const AUTH_PROFILE_QUERY_KEY = ['auth', 'profile'] as const;

// Hook для получения профиля пользователя
export function useUserProfile() {
  const { hasValidToken } = useAuthStore();

  return apiClient.auth.profile.useQuery(AUTH_PROFILE_QUERY_KEY, undefined, {
    queryKey: AUTH_PROFILE_QUERY_KEY,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: hasValidToken(), // Загружать только если пользователь аутентифицирован
  });
}
