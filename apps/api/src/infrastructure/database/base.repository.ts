import type {
  DatabaseClient,
  CursorPaginationOptions,
  OffsetPaginationOptions,
  PaginationResult,
} from './transaction';

/**
 * Base repository interface with strong typing
 */
export interface IBaseRepository<
  TModel,
  TWhereInput,
  TOrderByInput,
  TSelectInput,
  TIncludeInput,
  TCreateInput,
  TUpdateInput,
> {
  findMany(
    options: {
      where?: TWhereInput;
      orderBy?: TOrderByInput | TOrderByInput[];
      select?: TSelectInput;
      include?: TIncludeInput;
    } & (CursorPaginationOptions | OffsetPaginationOptions),
    db?: DatabaseClient
  ): Promise<PaginationResult<TModel>>;

  findUnique(
    where: TWhereInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel | null>;

  findFirst(
    where?: TWhereInput,
    options?: {
      orderBy?: TOrderByInput | TOrderByInput[];
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel | null>;

  create(
    data: TCreateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel>;

  update(
    where: TWhereInput,
    data: TUpdateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel>;

  delete(where: TWhereInput, db?: DatabaseClient): Promise<TModel>;

  count(where?: TWhereInput, db?: DatabaseClient): Promise<number>;
}

/**
 * Abstract base repository implementation
 */
export abstract class BaseRepository<
  TModel,
  TWhereInput,
  TOrderByInput,
  TSelectInput,
  TIncludeInput,
  TCreateInput,
  TUpdateInput,
> implements
    IBaseRepository<
      TModel,
      TWhereInput,
      TOrderByInput,
      TSelectInput,
      TIncludeInput,
      TCreateInput,
      TUpdateInput
    >
{
  constructor(protected readonly defaultDb: DatabaseClient) {}

  protected getDb(db?: DatabaseClient): DatabaseClient {
    return db ?? this.defaultDb;
  }

  /**
   * Generate cursor from item (by default uses createdAt + id)
   */
  protected generateCursor(item: { createdAt: Date | string; id: string }): string {
    // Default cursor generation using createdAt and id
    const createdAt =
      item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt;
    return Buffer.from(`${createdAt}:${item.id}`).toString('base64');
  }

  /**
   * Parse cursor to get createdAt and id
   */
  protected parseCursor(cursor: string): { createdAt: string; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const [createdAt, id] = decoded.split(':');
      return { createdAt, id };
    } catch {
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Build cursor where condition for pagination
   */
  protected buildCursorWhere(cursor: string): {
    OR: ({ createdAt: { lt: Date } } | { AND: { createdAt: Date; id: { lt: string } }[] })[];
  } {
    const { createdAt, id } = this.parseCursor(cursor);
    return {
      OR: [
        { createdAt: { lt: new Date(createdAt) } },
        {
          AND: [{ createdAt: new Date(createdAt), id: { lt: id } }],
        },
      ],
    };
  }

  /**
   * Check if pagination options are cursor-based
   */
  protected isCursorPagination(
    options: CursorPaginationOptions | OffsetPaginationOptions
  ): options is CursorPaginationOptions {
    return 'cursor' in options;
  }

  abstract findMany(
    options: {
      where?: TWhereInput;
      orderBy?: TOrderByInput | TOrderByInput[];
      select?: TSelectInput;
      include?: TIncludeInput;
    } & (CursorPaginationOptions | OffsetPaginationOptions),
    db?: DatabaseClient
  ): Promise<PaginationResult<TModel>>;

  abstract findUnique(
    where: TWhereInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel | null>;

  abstract findFirst(
    where?: TWhereInput,
    options?: {
      orderBy?: TOrderByInput | TOrderByInput[];
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel | null>;

  abstract create(
    data: TCreateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel>;

  abstract update(
    where: TWhereInput,
    data: TUpdateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel>;

  abstract delete(where: TWhereInput, db?: DatabaseClient): Promise<TModel>;

  abstract count(where?: TWhereInput, db?: DatabaseClient): Promise<number>;
}
