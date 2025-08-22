import { Injectable } from '@nestjs/common';
import { buildCursorWhere, createPaginationResponse } from '@repo/common';
import {
  CachedBaseRepository,
  PrismaService,
  type CursorPaginationOptions,
  type DatabaseClient,
  type OffsetPaginationOptions,
  type PaginationResult,
  RedisService,
} from '@repo/infrastructure';

import type { Prisma, User } from '@repo/database';

@Injectable()
export class UsersRepository extends CachedBaseRepository<
  User,
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput,
  Prisma.UserSelect,
  Prisma.UserInclude,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(
    readonly prismaService: PrismaService,
    readonly redisService: RedisService
  ) {
    super(prismaService, redisService);
  }
  async findMany(
    options: {
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude;
    } & (CursorPaginationOptions | OffsetPaginationOptions),
    db?: DatabaseClient
  ): Promise<PaginationResult<User>> {
    const { where, orderBy, select, include, limit } = options;

    // Default order by createdAt desc, id desc for cursor pagination
    const defaultOrderBy: Prisma.UserOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { id: 'desc' },
    ];

    const finalOrderBy = orderBy || defaultOrderBy;

    if (this.isCursorPagination(options)) {
      // Cursor-based pagination
      const { cursor } = options;

      let cursorWhere: Prisma.UserWhereInput | undefined;
      if (cursor) {
        cursorWhere = buildCursorWhere(cursor);
      }

      const combinedWhere: Prisma.UserWhereInput = cursorWhere
        ? { AND: [where || {}, cursorWhere] }
        : where || {};

      const items = await this.getDb(db).user.findMany({
        where: combinedWhere,
        orderBy: finalOrderBy,
        take: limit,
        ...(select ? { select } : {}),
        ...(include ? { include } : {}),
      });

      return createPaginationResponse(items, limit);
    } else {
      // Offset-based pagination
      const { offset } = options;

      const [items, total] = await Promise.all([
        this.getDb(db).user.findMany({
          where,
          orderBy: finalOrderBy,
          skip: offset,
          take: limit,
          ...(select ? { select } : {}),
          ...(include ? { include } : {}),
        }),
        this.getDb(db).user.count({ where }),
      ]);

      return {
        items,
        nextCursor: null,
        hasMore: offset + limit < total,
        total,
      };
    }
  }

  async findUnique(
    where: Prisma.UserWhereUniqueInput,
    options?: {
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude;
    },
    db?: DatabaseClient
  ): Promise<User | null> {
    const client = this.getDb(db);

    return client.user.findUnique({
      where,
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
    }) as Promise<User | null>;
  }

  async findFirst(
    where?: Prisma.UserWhereInput,
    options?: {
      orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude;
    },
    db?: DatabaseClient
  ): Promise<User | null> {
    const client = this.getDb(db);

    return client.user.findFirst({
      where,
      orderBy: options?.orderBy,
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
    }) as Promise<User | null>;
  }

  async create(
    data: Prisma.UserCreateInput,
    options?: {
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude;
    },
    db?: DatabaseClient
  ): Promise<User> {
    const client = this.getDb(db);

    return client.user.create({
      data,
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
    }) as Promise<User>;
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    options?: {
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude;
    },
    db?: DatabaseClient
  ): Promise<User> {
    const client = this.getDb(db);

    return client.user.update({
      where,
      data,
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
    }) as Promise<User>;
  }

  async delete(where: Prisma.UserWhereUniqueInput, db?: DatabaseClient): Promise<User> {
    const client = this.getDb(db);

    return client.user.delete({ where }) as Promise<User>;
  }

  async count(where?: Prisma.UserWhereInput, db?: DatabaseClient): Promise<number> {
    const client = this.getDb(db);

    return client.user.count({ where });
  }

  async findByEmail(email: string, db?: DatabaseClient): Promise<User | null> {
    return this.findUniqueWithCache({ email }, undefined, db);
  }

  async findByEmailNonCached(email: string, db?: DatabaseClient): Promise<User | null> {
    return this.findUnique({ email }, undefined, db);
  }

  async existsByEmail(email: string, excludeId?: string, db?: DatabaseClient): Promise<boolean> {
    const client = this.getDb(db);

    const where: Prisma.UserWhereInput = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await client.user.count({ where });
    return count > 0;
  }

  /**
   * Warm up cache for most accessed users
   */
  async warmUpCache(): Promise<void> {
    try {
      // Cache first 50 users
      await this.findManyWithCache({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        limit: 50,
        offset: 0,
      });

      this.logger.debug('Users cache warmed up successfully');
    } catch (error) {
      this.logger.error('Failed to warm up users cache:', error);
    }
  }
}
