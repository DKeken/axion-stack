import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// Auth schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fingerprint: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  fingerprint: z.string().optional(),
});

const refreshTokenSchema = z.object({
  fingerprint: z.string().optional(),
});

const tokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const authResponseSchema = z.object({
  user: userResponseSchema,
  tokens: tokensResponseSchema,
});

const logoutResponseSchema = z.object({
  message: z.string(),
});

const errorSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  method: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  details: z
    .object({
      field: z.string().optional(),
      constraint: z.string().optional(),
      table: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),
});

export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/api/v1/auth/register',
    body: registerSchema,
    responses: {
      201: authResponseSchema,
      400: errorSchema,
      409: errorSchema,
    },
    summary: 'Register a new user',
    description: 'Create a new user account and return authentication tokens',
  },

  login: {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: loginSchema,
    responses: {
      200: authResponseSchema,
      400: errorSchema,
      401: errorSchema,
    },
    summary: 'Login user',
    description: 'Authenticate user and return access/refresh tokens',
  },

  refresh: {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    body: refreshTokenSchema,
    responses: {
      200: tokensResponseSchema,
      401: errorSchema,
      403: errorSchema,
    },
    summary: 'Refresh access token',
    description: 'Generate new access/refresh token pair using refresh token',
  },

  logout: {
    method: 'POST',
    path: '/api/v1/auth/logout',
    body: z.object({}),
    responses: {
      200: logoutResponseSchema,
      401: errorSchema,
    },
    summary: 'Logout user',
    description: 'Revoke refresh token and logout user',
  },

  profile: {
    method: 'GET',
    path: '/api/v1/auth/profile',
    responses: {
      200: userResponseSchema,
      401: errorSchema,
    },
    summary: 'Get current user profile',
    description: 'Get authenticated user information',
  },
});

export type AuthContract = typeof authContract;

// Type exports for use in services
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type TokensResponse = z.infer<typeof tokensResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
