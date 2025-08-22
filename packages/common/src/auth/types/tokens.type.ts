export interface JwtPayload {
  sub: string; // user ID
  email: string;
  iat: number;
  exp: number;
  jti?: string; // JWT ID for refresh tokens
}

export interface RefreshTokenPayload extends JwtPayload {
  jti: string; // Required for refresh tokens
  familyId: string; // Family ID for reuse detection
}

export interface AccessTokenPayload extends JwtPayload {
  // Access token specific fields can be added here
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  jti: string;
  familyId: string;
  fingerprintHash?: string | null;
  expiresAt: Date;
  revokedAt?: Date | null;
  usedAt?: Date | null;
  createdAt: Date;
}
