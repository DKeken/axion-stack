import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Auth session creation DTO
 */
export class CreateSessionDto {
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

  constructor(data: CreateSessionDto) {
    this.userId = data.userId;
    this.fingerprint = data.fingerprint;
    this.deviceInfo = data.deviceInfo;
    this.userAgent = data.userAgent;
    this.ipAddress = data.ipAddress;
  }
}

/**
 * Session update DTO
 */
export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  refreshTokenId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  constructor(data: Partial<UpdateSessionDto> = {}) {
    this.refreshTokenId = data.refreshTokenId;
    this.isActive = data.isActive;
    this.deviceInfo = data.deviceInfo;
    this.userAgent = data.userAgent;
    this.ipAddress = data.ipAddress;
  }
}

/**
 * Session invalidation DTO
 */
export class InvalidateSessionDto {
  @IsString()
  @IsUUID()
  sessionId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  constructor(data: InvalidateSessionDto) {
    this.sessionId = data.sessionId;
    this.reason = data.reason;
  }
}

/**
 * Device sessions invalidation DTO
 */
export class InvalidateDeviceSessionsDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  fingerprint: string;

  constructor(data: InvalidateDeviceSessionsDto) {
    this.userId = data.userId;
    this.fingerprint = data.fingerprint;
  }
}
