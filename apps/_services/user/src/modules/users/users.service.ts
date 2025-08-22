import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  parseFilters,
  buildSearchWhere,
  buildPrismaOrderBy,
  parseSortFields,
  buildPrismaWhere,
  combineWhereConditions,
} from '@repo/common';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserListQueryDto,
  UserListResponse,
  UserResponse,
} from '@repo/contracts';
import type { Prisma, User } from '@repo/database';
import { PrismaService, withTransaction, ApiCacheService } from '@repo/infrastructure';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    readonly _apiCacheService: ApiCacheService
  ) {}

  async list(query: UserListQueryDto): Promise<UserListResponse> {
    const { limit, cursor, offset, sort, filter, q } = query;

    // Parse filters
    const filterConditions = filter ? parseFilters(filter) : [];
    const filterWhere = buildPrismaWhere(filterConditions);

    // Build search where
    const searchWhere = buildSearchWhere(q, {
      fields: ['name', 'email'],
      mode: 'insensitive',
    });

    // Combine where conditions
    const where = combineWhereConditions(filterWhere, searchWhere);

    // Parse sort fields
    const sortFields = parseSortFields(sort);
    const orderBy = buildPrismaOrderBy(sortFields);

    // Determine pagination type
    const paginationOptions = cursor ? { limit, cursor } : { limit, offset: offset || 0 };

    const result = await this.usersRepository.findManyWithCache({
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      ...paginationOptions,
    });

    // Transform to response format
    return {
      items: result.items.map(this.transformToUserResponse),
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasMore,
      total: result.total,
    };
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findUniqueWithCache(
      { id },
      {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transformToUserResponse(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, password, name } = createUserDto;

    // Check if user already exists (use non-cached method for consistency checks)
    const existingUser = await this.usersRepository.findByEmailNonCached(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await Bun.password.hash(password);

    const user = await this.usersRepository.createWithCacheInvalidation(
      {
        email,
        passwordHash,
        name,
      },
      {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }
    );

    return this.transformToUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const { email, name, password } = updateUserDto;

    // Check if user exists (use non-cached method for consistency checks)
    const existingUser = await this.usersRepository.findUnique({ id });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingUser.email) {
      const emailExists = await this.usersRepository.existsByEmail(email, id);
      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {};

    if (email) {
      updateData.email = email;
    }

    if (name !== undefined) {
      updateData.name = name;
    }

    if (password) {
      updateData.passwordHash = await Bun.password.hash(password);
    }

    const user = await this.usersRepository.updateWithCacheInvalidation({ id }, updateData, {
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Publish user updated event
    const changes: { email?: string; name?: string | null; status?: string } = {};
    if (email) changes.email = email;
    if (name !== undefined) changes.name = name;

    return this.transformToUserResponse(user);
  }

  async delete(id: string): Promise<void> {
    // Check if user exists (use non-cached method for consistency checks)
    const existingUser = await this.usersRepository.findUnique({ id });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Delete user and related refresh tokens in transaction
    await withTransaction(this.prisma, async (tx) => {
      // Delete all refresh tokens first
      await tx.refreshToken.deleteMany({
        where: { userId: id },
      });

      // Delete user with cache invalidation
      await this.usersRepository.deleteWithCacheInvalidation({ id }, tx);
    });

    // Invalidate cache manually since we used transaction
    await this.usersRepository.clearCache();
  }

  private transformToUserResponse(user: User): UserResponse {
    return {
      status: user.status,
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      timezone: user.timezone,
      language: user.language,
      theme: user.theme,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      lastLoginIp: user.lastLoginIp,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    } as UserResponse;
  }
}
