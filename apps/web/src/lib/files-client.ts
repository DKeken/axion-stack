'use client';

import { filesContract } from '@repo/contracts';
import { initQueryClient } from '@ts-rest/react-query';

import { useAuthStore } from '~/stores/auth-store';

// Initialize the files API client with ts-rest
// Use Gateway instead of direct files service access
const filesBaseUrl = String(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');
// MinIO endpoint for direct file access (like avatars)
const minioBaseUrl = String(process.env.NEXT_PUBLIC_MINIO_URL ?? 'http://localhost:9000');

export const filesClient = initQueryClient(filesContract, {
  baseUrl: `${filesBaseUrl}/api/v1`,
  baseHeaders: {
    Authorization: () => {
      const state = useAuthStore.getState();
      const token = state.hasValidToken() ? state.accessToken : null;
      return token ? `Bearer ${token}` : '';
    },
  },
  credentials: 'include',
  jsonQuery: true,
  // Remove queryClient from here - let ts-rest use the QueryClient from context
});

// Helper function to get file URLs from MinIO (EXACTLY like avatars)
export function getFileUrl(bucket: 'avatars' | 'files', fileName: string): string {
  return `${minioBaseUrl}/${bucket}/${fileName}`;
}

// Helper function to get avatar URL
export function getAvatarUrl(fileName: string): string {
  return getFileUrl('avatars', fileName);
}
