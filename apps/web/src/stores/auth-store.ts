import React from 'react';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { AuthUserResponse } from '@repo/api/src/contracts';

import { apiClient } from '~/lib/api-client';
import { generateFingerprint } from '~/utils/fingerprint';

// Error types
interface AuthError {
  message: string;
  status?: number;
}

type ErrorType = AuthError | string | null;

interface AuthState {
  user: AuthUserResponse | null;
  accessToken: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isInitialized: boolean;
  error: ErrorType;
}

interface AuthActions {
  // Auth operations
  login: (email: string, password: string, fingerprint: string) => Promise<void>;
  register: (email: string, password: string, name: string, fingerprint: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;

  // Profile operations
  loadProfile: () => Promise<void>;

  // State management
  setUser: (user: AuthUserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ErrorType) => void;
  setTokens: (accessToken: string, expiresIn: number) => void;
  clearAuth: () => void;
  hasValidToken: () => boolean;

  // Error handling
  handleAuthError: (error: AuthError) => void;

  // Initialization
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      isRefreshing: false,
      isInitialized: false,
      error: null,

      // Auth operations
      login: async (email: string, password: string, fingerprint: string) => {
        try {
          set({ isLoading: true, error: null });

          const result = await apiClient.auth.login.mutation({
            body: { email, password, fingerprint },
          });

          if (result.status === 200 && result.body) {
            // Store access token and user data
            const { accessToken, expiresIn } = result.body.tokens;
            const expiresAt = Date.now() + (expiresIn - 30) * 1000; // 30s buffer

            set({
              user: result.body.user,
              accessToken,
              tokenExpiresAt: expiresAt,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Login failed');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          console.error('Login failed:', error);
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            tokenExpiresAt: null,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, fingerprint: string) => {
        try {
          set({ isLoading: true, error: null });

          const result = await apiClient.auth.register.mutation({
            body: { email, password, name, fingerprint },
          });

          if (result.status === 201 && result.body) {
            // Store access token and user data
            const { accessToken, expiresIn } = result.body.tokens;
            const expiresAt = Date.now() + (expiresIn - 30) * 1000; // 30s buffer

            set({
              user: result.body.user,
              accessToken,
              tokenExpiresAt: expiresAt,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Registration failed');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          console.error('Registration failed:', error);
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            tokenExpiresAt: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Call logout endpoint
          await apiClient.auth.logout.mutation({
            body: {},
          });

          // Clear auth state regardless of response
          get().clearAuth();
        } catch (error) {
          console.error('Logout failed:', error);
          // Clear auth state even if logout fails
          get().clearAuth();
        }
      },

      refreshToken: async (): Promise<boolean> => {
        try {
          set({ isRefreshing: true });

          const result = await apiClient.auth.refresh.mutation({
            body: {
              fingerprint: generateFingerprint(),
            },
          });

          if (result.status === 200 && result.body) {
            // Store new access token
            const expiresAt = Date.now() + (result.body.expiresIn - 30) * 1000; // 30s buffer

            set({
              accessToken: result.body.accessToken,
              tokenExpiresAt: expiresAt,
              isRefreshing: false,
            });
            return true;
          } else {
            // Refresh failed
            get().clearAuth();
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearAuth();
          return false;
        } finally {
          set({ isRefreshing: false });
        }
      },

      loadProfile: async () => {
        try {
          set({ isLoading: true, error: null });

          const result = await apiClient.auth.profile.query({});

          if (result.status === 200 && result.body) {
            set({
              user: result.body,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else if (result.status === 401 || result.status === 403) {
            // Try to refresh token
            const refreshed = await get().refreshToken();
            if (refreshed) {
              // Retry loading profile after successful refresh
              await get().loadProfile();
            } else {
              get().clearAuth();
            }
          } else {
            throw new Error('Failed to load profile');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
          const errorStatus = (error as AuthError)?.status;

          console.error('Profile loading failed:', error);
          set({
            isLoading: false,
            error: errorMessage,
          });

          // If it's an auth error, try to refresh token
          if (errorStatus === 401 || errorStatus === 403) {
            const refreshed = await get().refreshToken();
            if (!refreshed) {
              get().clearAuth();
            }
          } else {
            // For non-auth errors, clear authentication state
            set({ isAuthenticated: false, user: null });
          }
        }
      },

      // State management
      setUser: (user: AuthUserResponse | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: ErrorType) => {
        set({ error });
      },

      setTokens: (accessToken: string, expiresIn: number) => {
        const expiresAt = Date.now() + (expiresIn - 30) * 1000; // 30s buffer
        set({ accessToken, tokenExpiresAt: expiresAt });
      },

      hasValidToken: () => {
        const state = get();
        if (!state.accessToken || !state.tokenExpiresAt) return false;
        return Date.now() < state.tokenExpiresAt;
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          tokenExpiresAt: null,
          isAuthenticated: false,
          isLoading: false,
          isRefreshing: false,
          error: null,
          // Keep isInitialized as true since app is already initialized
        });

        // Redirect to login in production
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      handleAuthError: (error: AuthError) => {
        if (error.status === 401 || error.status === 403) {
          get().clearAuth();
        }
      },

      initialize: async () => {
        try {
          // Always try to load profile on app initialization
          // This ensures user data is fresh from server
          await get().loadProfile();
        } finally {
          // Mark as initialized regardless of success/failure
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        tokenExpiresAt: state.tokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook for using auth in components
export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isRefreshing: state.isRefreshing,
      isInitialized: state.isInitialized,
      error: state.error,
      login: state.login,
      register: state.register,
      logout: state.logout,
      refreshToken: state.refreshToken,
      loadProfile: state.loadProfile,
      clearAuth: state.clearAuth,
      initialize: state.initialize,
    }))
  );
};

// Hook for auth operations (login, register, logout)
export const useAuthOperations = () => {
  return useAuthStore(
    useShallow((state) => ({
      login: state.login,
      register: state.register,
      logout: state.logout,
      refreshToken: state.refreshToken,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );
};

// Hook for auth guard functionality
export const useAuthGuard = (
  options: {
    requireAuth?: boolean;
    onAuthRequired?: () => void;
    onAuthSuccess?: () => void;
  } = {}
) => {
  const { requireAuth = false, onAuthRequired, onAuthSuccess } = options;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasTriggeredRef = React.useRef({ auth: false, unauth: false });

  React.useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated && !hasTriggeredRef.current.unauth) {
      hasTriggeredRef.current.unauth = true;
      hasTriggeredRef.current.auth = false;
      onAuthRequired?.();
    } else if (isAuthenticated && !hasTriggeredRef.current.auth) {
      hasTriggeredRef.current.auth = true;
      hasTriggeredRef.current.unauth = false;
      onAuthSuccess?.();
    }
  }, [isAuthenticated, isLoading, onAuthRequired, onAuthSuccess, requireAuth]);

  return React.useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      shouldRender: !requireAuth || isAuthenticated,
    }),
    [isAuthenticated, isLoading, requireAuth]
  );
};
