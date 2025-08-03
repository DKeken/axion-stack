import { apiContract } from '@repo/backend/src/contracts';
import { initQueryClient } from '@ts-rest/react-query';

// Initialize the API client with ts-rest
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const apiClient = initQueryClient(apiContract, {
  baseUrl: apiBaseUrl,
  baseHeaders: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
  api: async ({
    path,
    method,
    headers,
    body,
  }: {
    path: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }) => {
    try {
      const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      let responseBody;

      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      return {
        status: response.status,
        body: responseBody,
        headers: response.headers,
      };
    } catch (error) {
      // Handle network errors
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
