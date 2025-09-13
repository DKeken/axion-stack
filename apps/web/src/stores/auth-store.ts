/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AuthResponse, AuthUserResponse } from '@repo/contracts';

import { apiClient } from '~/lib/api-client';
import { generateFingerprint } from '~/utils/fingerprint';

interface AuthState {
  user: AuthUserResponse | null;
  accessToken: string | null;
  accessTokenExpiresAt: number | null; // epoch ms
  initializing: boolean;
}

interface AuthActions {
  initSession: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { email: string; password: string; name?: string }) => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  hasValidToken: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

let refreshTimeoutId: number | null = null;
let refreshPromise: Promise<void> | null = null;

function scheduleRefresh(expiresInSeconds: number, refresh: () => Promise<void>) {
  // Skip scheduling on server-side
  if (typeof window === 'undefined') {
    return;
  }

  // Clear any existing timeout
  if (refreshTimeoutId !== null) {
    console.log('⏰ Clearing existing refresh timeout');
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  // For 30-day tokens, we don't need aggressive refreshing
  // Only refresh when token has less than 1 day left
  if (expiresInSeconds > 86400) {
    console.log(
      `🎯 Token is fresh (${Math.round(expiresInSeconds / 3600)}h left), not scheduling refresh`
    );
    return;
  }

  // Don't schedule if expires too soon (less than 5 minutes)
  if (expiresInSeconds < 300) {
    console.warn(`⚠️ Not scheduling refresh - token expires too soon (${expiresInSeconds}s)`);
    return;
  }

  // For tokens with less than 1 day, refresh 1 hour before expiry
  const safetyWindowSeconds = Math.min(3600, Math.floor(expiresInSeconds / 2));

  const delayMs = Math.max(0, (expiresInSeconds - safetyWindowSeconds) * 1000);
  const delayHours = Math.round((delayMs / 1000 / 3600) * 10) / 10;

  console.log(
    `⏰ Scheduling refresh in ${delayHours}h (${Math.round(delayMs / 1000)}s) - token expires in ${Math.round((expiresInSeconds / 3600) * 10) / 10}h`
  );

  refreshTimeoutId = window.setTimeout(() => {
    // Prevent multiple concurrent refresh attempts
    if (refreshPromise) {
      console.log('🚫 Skipping scheduled refresh - another refresh is already in progress');
      return;
    }

    console.log('⏰ Executing scheduled token refresh');
    void refresh().catch((error) => {
      console.warn('❌ Scheduled token refresh failed:', error);
    });
  }, delayMs);
}

export const useAuthStore = create<AuthStore>()(
  devtools((set, get) => ({
    user: null,
    accessToken: null,
    accessTokenExpiresAt: null,
    initializing: true,

    hasValidToken: () => {
      const { accessToken, accessTokenExpiresAt } = get();
      if (!accessToken || !accessTokenExpiresAt) return false;
      return Date.now() < accessTokenExpiresAt - 1000; // 1s skew
    },

    clearSession: () => {
      set({ user: null, accessToken: null, accessTokenExpiresAt: null });
      if (typeof window !== 'undefined') {
        if (refreshTimeoutId !== null) {
          clearTimeout(refreshTimeoutId);
          refreshTimeoutId = null;
        }
        // Clear any pending refresh promise
        refreshPromise = null;
      }
    },

    async initSession() {
      // Skip initialization on server-side
      if (typeof window === 'undefined') {
        set({ initializing: false });
        return;
      }

      console.log('🚀 Initializing auth session...');

      try {
        // If we don't have a valid token, try to refresh ONCE
        if (!get().hasValidToken()) {
          console.log('📝 No valid token found, attempting refresh...');
          try {
            await get().refreshTokens();
            console.log('✅ Token refresh successful during init');
          } catch (refreshError) {
            console.warn('❌ Initial token refresh failed:', refreshError);
            // If refresh fails, clear session and continue
            get().clearSession();
            return; // Exit early if refresh fails
          }
        } else {
          console.log('✅ Valid token found, skipping refresh');
        }

        // Fetch profile if we have valid token but no user
        if (get().user === null && get().hasValidToken()) {
          console.log('👤 Fetching user profile...');
          try {
            const result = await apiClient.auth.profile.query();
            if (result.status === 200) {
              set({ user: result.body });
              console.log('✅ Profile loaded successfully');
            } else {
              console.warn('⚠️ Profile fetch failed with status:', result.status);
            }
          } catch (profileError) {
            console.warn('❌ Profile fetch failed:', profileError);
            // Don't clear session for profile errors - token might still be valid
          }
        }
      } catch (error) {
        console.error('💥 Session initialization failed:', error);
        // Clear session on critical initialization errors
        get().clearSession();
      } finally {
        set({ initializing: false });
        console.log('🏁 Session initialization completed');
      }
    },

    async login({ email, password }) {
      const fingerprint = generateFingerprint();
      const result = await apiClient.auth.login.mutation({
        body: { email, password, fingerprint },
      });
      if (result.status !== 200) {
        // Extract error message from response - handle unknown response structure safely
        let errorMessage = 'Invalid credentials';

        try {
          const { body } = result;
          if (body && typeof body === 'object') {
            const errorFromBody =
              (body as Record<string, unknown>).error ||
              ((body as Record<string, unknown>).data as Record<string, unknown> | undefined)
                ?.message ||
              (body as Record<string, unknown>).message;

            if (typeof errorFromBody === 'string') {
              errorMessage = errorFromBody;
            }
          }
        } catch {
          // Fallback to default error message
        }

        throw new Error(errorMessage);
      }
      applyAuthResult(result.body, set, get);
    },

    async register({ email, password, name }) {
      const fingerprint = generateFingerprint();
      const result = await apiClient.auth.register.mutation({
        body: { email, password, name, fingerprint },
      });
      if (result.status !== 201) {
        // Extract error message from response - handle unknown response structure safely
        let errorMessage = 'Registration failed';

        try {
          const { body } = result;
          if (body && typeof body === 'object') {
            const errorFromBody =
              (body as Record<string, unknown>).error ||
              ((body as Record<string, unknown>).data as Record<string, unknown> | undefined)
                ?.message ||
              (body as Record<string, unknown>).message;

            if (typeof errorFromBody === 'string') {
              errorMessage = errorFromBody;
            }
          }
        } catch {
          // Fallback to default error message
        }

        throw new Error(errorMessage);
      }
      applyAuthResult(result.body, set, get);
    },

    async refreshTokens() {
      // Prevent concurrent refresh attempts - return existing promise if one is running
      if (refreshPromise) {
        console.log('🔄 Waiting for existing refresh to complete...');
        return refreshPromise;
      }

      console.log('🔄 Starting token refresh...');

      // Create and store the refresh promise
      refreshPromise = (async () => {
        try {
          const fingerprint = generateFingerprint();
          console.log('📡 Sending refresh request to server...');
          const result = await apiClient.auth.refresh.mutation({ body: { fingerprint } });

          if (result.status !== 200) {
            console.warn('❌ Refresh failed with status:', result.status);
            // On failure, clear session
            get().clearSession();
            return;
          }

          const tokens = result.body;
          const accessTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;

          console.log(`✅ Refresh successful, scheduling next refresh in ${tokens.expiresIn}s`);

          // Update tokens in state
          set({ accessToken: tokens.accessToken, accessTokenExpiresAt });

          // Schedule next refresh
          scheduleRefresh(tokens.expiresIn, get().refreshTokens);

          // Ensure profile exists
          if (get().user === null) {
            console.log('👤 Loading missing profile after refresh...');
            try {
              const profile = await apiClient.auth.profile.query();
              if (profile.status === 200) {
                set({ user: profile.body });
                console.log('✅ Profile loaded after refresh');
              }
            } catch (profileError) {
              console.warn('❌ Failed to fetch profile after token refresh:', profileError);
              // Don't fail the refresh for profile errors
            }
          }
        } catch (error) {
          console.error('💥 Token refresh failed:', error);
          // Clear session on any error
          get().clearSession();
          throw error;
        } finally {
          // Always clear the promise when done
          refreshPromise = null;
          console.log('🏁 Refresh promise cleared');
        }
      })();

      return refreshPromise;
    },

    async updateProfile() {
      if (get().hasValidToken()) {
        const result = await apiClient.auth.profile.query();
        if (result.status === 200) {
          set({ user: result.body });
        }
      }
    },

    async logout() {
      try {
        await apiClient.auth.logout.mutation({});
      } catch {
        // ignore
      } finally {
        get().clearSession();
      }
    },
  }))
);

function applyAuthResult(
  auth: AuthResponse,
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthStore
) {
  const { tokens } = auth;
  const accessTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;

  console.log(`🔐 Applying auth result - scheduling refresh in ${tokens.expiresIn}s`);

  set({
    user: auth.user,
    accessToken: tokens.accessToken,
    accessTokenExpiresAt,
  });
  scheduleRefresh(tokens.expiresIn, get().refreshTokens);
}

// Selector to compute authentication status derived from current state.
// Returns null if still initializing, boolean otherwise
export const selectIsAuthenticated = (state: AuthStore): boolean | null => {
  if (state.initializing) {
    return null; // Still initializing, don't make auth decisions yet
  }
  return state.user !== null && state.hasValidToken();
};

// Helper selector that returns boolean (for compatibility)
export const selectIsAuthenticatedComplete = (state: AuthStore): boolean => {
  const authStatus = selectIsAuthenticated(state);
  return authStatus === true;
};
