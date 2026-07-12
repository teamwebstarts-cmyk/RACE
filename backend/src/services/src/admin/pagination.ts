import type { FilterQuery, Model } from 'mongoose';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function paginate<T, D>(
  model: Model<D>,
  filter: FilterQuery<D>,
  params: PaginationParams,
  mapFn: (doc: D) => T,
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const sortField = params.sortBy ?? 'createdAt';
  const sortDir = params.sortOrder === 'asc' ? 1 : -1;

  const [total, docs] = await Promise.all([
    model.countDocuments(filter),
    model
      .find(filter)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    items: docs.map((doc) => mapFn(doc as D)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
