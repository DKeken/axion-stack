'use client';

import {
  type UploadFileResponse,
  type UploadAvatarResponse,
  type FileError,
  type AuthUserResponse,
} from '@repo/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Note: apiClient and filesClient imports removed as ts-rest multipart support is not ready yet
import { useAuthStore } from '~/stores/auth-store';

// Type guards
function isValidUploadResponse(
  value: unknown
): value is AuthAvatarUploadResponse | UploadFileResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check for auth avatar upload response format: { user, upload }
  if ('user' in value && 'upload' in value) {
    const { upload } = value;
    return (
      typeof upload === 'object' &&
      upload !== null &&
      'id' in upload &&
      'fileName' in upload &&
      typeof upload.id === 'string'
    );
  }

  // Check for direct upload response format: { id, fileName, ... }
  return (
    'id' in value &&
    'fileName' in value &&
    typeof value.id === 'string' &&
    typeof value.fileName === 'string'
  );
}

function isFileError(value: unknown): value is FileError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  // FileError from contracts has fileError.code field, not message
  return (
    'fileError' in value &&
    typeof value.fileError === 'object' &&
    value.fileError !== null &&
    'code' in value.fileError
  );
}

// Response interface for avatar upload from auth service
interface AuthAvatarUploadResponse {
  user: AuthUserResponse;
  upload: UploadAvatarResponse;
}

// Upload options interface for flexibility
interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (response: AuthAvatarUploadResponse | UploadFileResponse) => void;
  onError?: (error: Error) => void;
}

// File validation configuration
interface FileValidationConfig {
  maxSize: number;
  allowedMimetypes: string[];
  allowedExtensions: string[];
}

// Default validation configs from contracts
const DEFAULT_FILE_CONFIG: FileValidationConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimetypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

const AVATAR_CONFIG: FileValidationConfig = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedMimetypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

// File validation utility
export function validateFile(file: File, config: FileValidationConfig): void {
  // Check file size
  if (file.size > config.maxSize) {
    throw new Error(`File size must be less than ${Math.round(config.maxSize / (1024 * 1024))}MB`);
  }

  // Check MIME type
  if (!config.allowedMimetypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${config.allowedMimetypes.join(', ')}`);
  }

  // Check file extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!config.allowedExtensions.includes(extension)) {
    throw new Error(
      `Invalid file extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    );
  }
}

// Generic upload function using XMLHttpRequest for progress tracking
// We keep this for progress tracking since ts-rest doesn't support upload progress yet
export async function uploadFileWithProgress(
  file: File,
  endpoint: string,
  options: UploadOptions = {}
): Promise<AuthAvatarUploadResponse | UploadFileResponse> {
  const { onProgress, onSuccess, onError } = options;
  const state = useAuthStore.getState();
  const token = state.hasValidToken() ? state.accessToken : null;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progressPercentage = Math.round((event.loaded / event.total) * 100);
          onProgress(progressPercentage);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: unknown = JSON.parse(xhr.responseText);
          if (isValidUploadResponse(response)) {
            onSuccess?.(response);
            resolve(response);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (_parseError) {
          const error = new Error('Invalid response format');
          onError?.(error);
          reject(error);
        }
      } else {
        try {
          const errorResponse: unknown = JSON.parse(xhr.responseText);
          const errorMessage = isFileError(errorResponse)
            ? `Upload failed: ${errorResponse.fileError.code}`
            : `Upload failed: ${xhr.status}`;
          const error = new Error(errorMessage);
          onError?.(error);
          reject(error);
        } catch (_parseError) {
          const error = new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          onError?.(error);
          reject(error);
        }
      }
    });

    xhr.addEventListener('error', () => {
      const error = new Error('Network error occurred');
      onError?.(error);
      reject(error);
    });

    xhr.addEventListener('abort', () => {
      const error = new Error('Upload cancelled');
      onError?.(error);
      reject(error);
    });

    // Set headers and send
    xhr.open('POST', endpoint);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

// Hook for avatar upload via auth service
export function useAuthAvatarUpload(options: UploadOptions = {}) {
  const queryClient = useQueryClient();
  const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

  return useMutation({
    mutationFn: async (file: File): Promise<AuthAvatarUploadResponse> => {
      // Validate file before upload
      validateFile(file, AVATAR_CONFIG);

      // For progress tracking, use XMLHttpRequest
      if (options.onProgress) {
        const response = await uploadFileWithProgress(
          file,
          `${apiBaseUrl}/api/v1/auth/upload-avatar`,
          options
        );

        // Type guard to ensure it's an avatar response
        if ('user' in response && 'upload' in response) {
          return response;
        }

        throw new Error('Invalid avatar upload response format');
      }

      // For regular upload without progress, fallback to XMLHttpRequest
      // TODO: Implement ts-rest multipart support when available
      const response = await uploadFileWithProgress(
        file,
        `${apiBaseUrl}/api/v1/auth/upload-avatar`,
        options
      );

      // Type guard to ensure it's an avatar response
      if ('user' in response && 'upload' in response) {
        return response;
      }

      throw new Error('Invalid avatar upload response format');
    },
    onSuccess: (_data) => {
      // Invalidate profile query to refetch fresh data
      void queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      // Auth store will be updated via profile query invalidation
    },
    onError: (error) => {
      console.error('Avatar upload failed:', error);
    },
  });
}

// Hook for general file upload via files service
export function useFilesUpload(
  uploadContext?: {
    context: 'shop-logo' | 'shop-banner' | 'product-image' | 'general';
    shopId?: string;
    productId?: string;
  },
  options: UploadOptions = {}
) {
  const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

  return useMutation({
    mutationFn: async (file: File): Promise<UploadFileResponse> => {
      // Validate file before upload
      validateFile(file, DEFAULT_FILE_CONFIG);

      // Build upload URL with context parameters
      const baseUrl = `${apiBaseUrl}/api/v1/files/upload`;
      const params = new URLSearchParams();

      if (uploadContext?.context) {
        params.append('context', uploadContext.context);
      } else {
        params.append('context', 'general');
      }

      if (uploadContext?.shopId) {
        params.append('shopId', uploadContext.shopId);
      }

      if (uploadContext?.productId) {
        params.append('productId', uploadContext.productId);
      }

      const uploadUrl = `${baseUrl}?${params.toString()}`;

      // For progress tracking, use XMLHttpRequest
      if (options.onProgress) {
        const response = await uploadFileWithProgress(file, uploadUrl, options);

        // Type guard to ensure it's a file response
        if ('id' in response && 'fileName' in response && !('user' in response)) {
          return response;
        }

        throw new Error('Invalid file upload response format');
      }

      // For regular upload without progress, fallback to XMLHttpRequest
      // TODO: Implement ts-rest multipart support when available
      const response = await uploadFileWithProgress(file, uploadUrl, options);

      // Type guard to ensure it's a file response
      if ('id' in response && 'fileName' in response && !('user' in response)) {
        return response;
      }

      throw new Error('Invalid file upload response format');
    },
    onError: (error) => {
      console.error('File upload failed:', error);
    },
  });
}

// Hook for avatar upload via gateway (deprecated - use useAuthAvatarUpload instead)
export function useFilesAvatarUpload(options: UploadOptions = {}) {
  const queryClient = useQueryClient();
  const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

  return useMutation({
    mutationFn: async (file: File): Promise<UploadAvatarResponse> => {
      // Validate file before upload
      validateFile(file, AVATAR_CONFIG);

      // For progress tracking, use XMLHttpRequest
      if (options.onProgress) {
        const response = await uploadFileWithProgress(
          file,
          `${apiBaseUrl}/api/v1/auth/upload-avatar`,
          options
        );

        // Type guard to ensure it's an avatar response
        if ('user' in response && 'upload' in response) {
          return response.upload;
        }

        throw new Error('Invalid avatar upload response format');
      }

      // For regular upload without progress, fallback to XMLHttpRequest
      // TODO: Implement ts-rest multipart support when available
      const response = await uploadFileWithProgress(
        file,
        `${apiBaseUrl}/api/v1/auth/upload-avatar`,
        options
      );

      // Type guard to ensure it's an avatar response
      if ('user' in response && 'upload' in response) {
        return response.upload;
      }

      throw new Error('Invalid avatar upload response format');
    },
    onSuccess: () => {
      // Invalidate user files queries
      void queryClient.invalidateQueries({ queryKey: ['user-files'] });
      void queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      console.error('Avatar upload via files service failed:', error);
    },
  });
}

// Export validation configs for external use
export { DEFAULT_FILE_CONFIG, AVATAR_CONFIG };
