import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMetaType = z.infer<typeof paginationMetaSchema>;

export class PaginationMetaDto extends createZodDto(paginationMetaSchema) {}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMetaType {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });

export type PaginatedResponseType<T> = {
  data: T[];
  meta: PaginationMetaType;
};

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponseType<T> {
  return {
    data,
    meta: createPaginationMeta(page, limit, total),
  };
}
