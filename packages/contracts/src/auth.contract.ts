import { UserSchema } from '@repo/database/generated/zod';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

// Import generated Zod schemas

const c = initContract();

// Create user response schema from UserSchema, excluding sensitive fields
const userResponseSchema = UserSchema.omit({
  passwordHash: true,
  resetToken: true,
  resetTokenExpiry: true,
  verificationToken: true,
}).extend({
  // Convert dates to strings for JSON serialization
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  emailVerifiedAt: z.string().datetime().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
});

// Auth input schemas (derive email/name from Prisma Zod)
const loginSchema = UserSchema.pick({ email: true }).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fingerprint: z.string().optional(),
});

const registerSchema = UserSchema.pick({ email: true })
  .merge(UserSchema.pick({ name: true }))
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
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

const authResponseSchema = z.object({
  user: userResponseSchema,
  tokens: tokensResponseSchema,
});

const logoutResponseSchema = z.object({
  message: z.string(),
});

// Auth error schema based on AuthErrorResponse
const authErrorSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  method: z.string(),
  message: z.string(),
  error: z.string(),
});

// Extended error schema for validation errors
const validationErrorSchema = z.object({
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
      400: validationErrorSchema,
      409: authErrorSchema,
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
      400: validationErrorSchema,
      401: authErrorSchema,
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
      401: authErrorSchema,
      403: authErrorSchema,
    },
    summary: 'Refresh access token',
    description: 'Generate new access/refresh token pair using refresh token',
  },

  logout: {
    method: 'POST',
    path: '/api/v1/auth/logout',
    body: c.noBody(),
    responses: {
      200: logoutResponseSchema,
      401: authErrorSchema,
    },
    summary: 'Logout user',
    description: 'Revoke refresh token and logout user',
  },

  profile: {
    method: 'GET',
    path: '/api/v1/auth/profile',
    responses: {
      200: userResponseSchema,
      401: authErrorSchema,
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
export type AuthUserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Error type exports
export type AuthError = z.infer<typeof authErrorSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
