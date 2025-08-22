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
  logout: () => Promise<void>;
  clearSession: () => void;
  hasValidToken: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

let refreshTimeoutId: number | null = null;

function scheduleRefresh(expiresInSeconds: number, refresh: () => Promise<void>) {
  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  // Refresh a bit before expiry to avoid race conditions
  const safetyWindowSeconds = Math.min(15, Math.floor(expiresInSeconds / 3));
  const delayMs = Math.max(0, (expiresInSeconds - safetyWindowSeconds) * 1000);

  refreshTimeoutId = window.setTimeout(() => {
    void refresh();
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
      if (refreshTimeoutId !== null) {
        clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
      }
    },

    async initSession() {
      try {
        // If we already have a valid token, try to load profile directly
        if (!get().hasValidToken()) {
          await get().refreshTokens();
        }
        // Fetch profile if not loaded yet
        if (get().user === null && get().hasValidToken()) {
          const result = await apiClient.auth.profile.query();
          if (result.status === 200) {
            set({ user: result.body });
          }
        }
      } finally {
        set({ initializing: false });
      }
    },

    async login({ email, password }) {
      const fingerprint = generateFingerprint();
      const result = await apiClient.auth.login.mutation({
        body: { email, password, fingerprint },
      });
      if (result.status !== 200) {
        throw new Error('Invalid credentials');
      }
      applyAuthResult(result.body, set, get);
    },

    async register({ email, password, name }) {
      const fingerprint = generateFingerprint();
      const result = await apiClient.auth.register.mutation({
        body: { email, password, name, fingerprint },
      });
      if (result.status !== 201) {
        throw new Error('Registration failed');
      }
      applyAuthResult(result.body, set, get);
    },

    async refreshTokens() {
      const fingerprint = generateFingerprint();
      const result = await apiClient.auth.refresh.mutation({ body: { fingerprint } });
      if (result.status !== 200) {
        // On failure, clear session
        get().clearSession();
        return;
      }
      const tokens = result.body;
      const accessTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;
      set({ accessToken: tokens.accessToken, accessTokenExpiresAt });
      scheduleRefresh(tokens.expiresIn, get().refreshTokens);

      // Ensure profile exists
      if (get().user === null) {
        const profile = await apiClient.auth.profile.query();
        if (profile.status === 200) {
          set({ user: profile.body });
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
  set({
    user: auth.user,
    accessToken: tokens.accessToken,
    accessTokenExpiresAt,
  });
  scheduleRefresh(tokens.expiresIn, get().refreshTokens);
}

// Selector to compute authentication status derived from current state.
export const selectIsAuthenticated = (state: AuthStore): boolean => {
  return state.user !== null && state.hasValidToken();
};
