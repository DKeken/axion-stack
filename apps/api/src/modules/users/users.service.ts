import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersRepository } from './users.repository';

import type {
  CreateUserDto,
  UpdateUserDto,
  UserListQueryDto,
  UserResponse,
  UserListResponse,
} from '@/contracts/users.contract';
import type { Prisma, User } from '@repo/database';

import { parseFilters } from '@/common/dto/filtering.dto';
import { buildSearchWhere } from '@/common/dto/search.dto';
import { buildPrismaOrderBy, parseSortFields } from '@/common/dto/sorting.dto';
import { buildPrismaWhere, combineWhereConditions } from '@/common/utils/prisma-where-builder';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { withTransaction } from '@/infrastructure/database/transaction';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository
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
    const where = combineWhereConditions(
      filterWhere as Record<string, unknown>,
      searchWhere as Record<string, unknown>
    );

    // Parse sort fields
    const sortFields = parseSortFields(sort);
    const orderBy = buildPrismaOrderBy(sortFields);

    // Determine pagination type
    const paginationOptions = cursor ? { limit, cursor } : { limit, offset: offset || 0 };

    const result = await this.usersRepository.findMany({
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
    const user = await this.usersRepository.findUnique(
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

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    const user = await this.usersRepository.create(
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

    // Check if user exists
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
      updateData.passwordHash = await argon2.hash(password);
    }

    const user = await this.usersRepository.update({ id }, updateData, {
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.transformToUserResponse(user);
  }

  async delete(id: string): Promise<void> {
    // Check if user exists
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

      // Delete user
      await tx.user.delete({
        where: { id },
      });
    });
  }

  private transformToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
