import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/**
 * Internal DTO for token generation
 */
export class GenerateTokenPairDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  sessionId: string;

  @IsString()
  fingerprint: string;

  @IsOptional()
  @IsString()
  email?: string;

  constructor(data: GenerateTokenPairDto) {
    this.userId = data.userId;
    this.sessionId = data.sessionId;
    this.fingerprint = data.fingerprint;
    this.email = data.email;
  }
}

/**
 * Internal DTO for token validation
 */
export class ValidateTokenDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  fingerprint?: string;

  constructor(data: ValidateTokenDto) {
    this.token = data.token;
    this.fingerprint = data.fingerprint;
  }
}

/**
 * Internal DTO for session creation with token generation
 */
export class CreateUserSessionDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  fingerprint: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  ttl?: number;

  constructor(data: CreateUserSessionDto) {
    this.userId = data.userId;
    this.fingerprint = data.fingerprint;
    this.deviceInfo = data.deviceInfo;
    this.userAgent = data.userAgent;
    this.ipAddress = data.ipAddress;
    this.ttl = data.ttl;
  }
}

/**
 * Internal DTO for token refresh operations
 */
export class RefreshTokenOperationDto {
  @IsString()
  refreshToken: string;

  @IsString()
  fingerprint: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  sessionId?: string;

  constructor(data: RefreshTokenOperationDto) {
    this.refreshToken = data.refreshToken;
    this.fingerprint = data.fingerprint;
    this.sessionId = data.sessionId;
  }
}

/**
 * Internal DTO for logout operations
 */
export class LogoutOperationDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId?: string;

  constructor(data: LogoutOperationDto = {}) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.sessionId = data.sessionId;
    this.userId = data.userId;
  }
}
