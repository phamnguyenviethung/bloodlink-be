import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { BlogStatus } from '@/database/entities/blog.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Create Blog DTO Schema
export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
});

export type CreateBlogDtoType = z.infer<typeof createBlogSchema>;
export class CreateBlogDto extends createZodDto(createBlogSchema) {
  @ApiProperty({
    description: 'Title of the blog post',
    example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
    maxLength: 255,
  })
  title!: string;

  @ApiProperty({
    description: 'HTML content of the blog post',
    example:
      '<h1>Hiến máu nhân đạo</h1><p>Hiến máu là một hành động cao đẹp...</p>',
  })
  content!: string;

  @ApiPropertyOptional({
    description: 'Short excerpt/summary of the blog post',
    example:
      'Hiến máu nhân đạo là hành động cao đẹp, thể hiện tinh thần tương thân tương ái...',
    maxLength: 500,
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description:
      'Tags associated with the blog post (JSON string array or comma-separated)',
    example: '["hiến máu", "nhân đạo", "sức khỏe", "cộng đồng"]',
    type: String,
  })
  tags?: string;

  @ApiPropertyOptional({
    description: 'Status of the blog post',
    example: 'draft',
    type: String,
  })
  status?: string;
}

// Update Blog DTO Schema
export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
  removeImage: z.string().optional(),
});

export type UpdateBlogDtoType = z.infer<typeof updateBlogSchema>;
export class UpdateBlogDto extends createZodDto(updateBlogSchema) {
  @ApiPropertyOptional({
    description: 'Title of the blog post',
    example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
    maxLength: 255,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'HTML content of the blog post',
    example:
      '<h1>Hiến máu nhân đạo</h1><p>Hiến máu là một hành động cao đẹp...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Short excerpt/summary of the blog post',
    example:
      'Hiến máu nhân đạo là hành động cao đẹp, thể hiện tinh thần tương thân tương ái...',
    maxLength: 500,
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description:
      'Tags associated with the blog post (JSON string array or comma-separated)',
    example: '["hiến máu", "nhân đạo", "sức khỏe", "cộng đồng"]',
    type: String,
  })
  tags?: string;

  @ApiPropertyOptional({
    description: 'Status of the blog post',
    example: 'published',
    type: String,
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Set to "true" to remove existing image',
    example: 'false',
    type: String,
  })
  removeImage?: string;
}

// Blog Response DTO
export class BlogResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'uuid-here',
  })
  id!: string;

  @ApiProperty({
    description: 'Title of the blog post',
    example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
  })
  title!: string;

  @ApiProperty({
    description: 'HTML content of the blog post',
    example:
      '<h1>Hiến máu nhân đạo</h1><p>Hiến máu là một hành động cao đẹp...</p>',
  })
  content!: string;

  @ApiPropertyOptional({
    description: 'Short excerpt/summary of the blog post',
    example:
      'Hiến máu nhân đạo là hành động cao đẹp, thể hiện tinh thần tương thân tương ái...',
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'URL of the blog post image',
    example: 'https://example.com/images/hien-mau-nhan-dao.jpg',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'SEO-friendly slug',
    example: 'hien-mau-nhan-dao-hanh-dong-y-nghia-vi-cong-dong',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the blog post',
    example: ['hiến máu', 'nhân đạo', 'sức khỏe', 'cộng đồng'],
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Status of the blog post',
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  status!: BlogStatus;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2025-06-25T10:00:00Z',
  })
  publishedAt?: Date;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-06-25T09:00:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-06-25T11:00:00Z',
  })
  updatedAt!: Date;
}

// Blog List Query DTO Schema
export const blogListQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').optional(),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').optional(),
  status: z.nativeEnum(BlogStatus).optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  publishedOnly: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export type BlogListQueryDtoType = z.infer<typeof blogListQuerySchema>;
export class BlogListQueryDto extends createZodDto(blogListQuerySchema) {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: 'Search by title',
    example: 'hiến máu',
  })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: 'hiến máu',
  })
  tag?: string;

  @ApiPropertyOptional({
    description: 'Include only published posts',
    example: true,
  })
  publishedOnly?: boolean;
}

// Generate Slug DTO Schema
export const generateSlugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export type GenerateSlugDtoType = z.infer<typeof generateSlugSchema>;
export class GenerateSlugDto extends createZodDto(generateSlugSchema) {
  @ApiProperty({
    description: 'Vietnamese title to generate slug from',
    example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
  })
  title!: string;
}

// Slug Response DTO
export class SlugResponseDto {
  @ApiProperty({
    description: 'Generated SEO-friendly slug',
    example: 'hien-mau-nhan-dao-hanh-dong-y-nghia-vi-cong-dong',
  })
  slug!: string;

  @ApiProperty({
    description: 'Original title',
    example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
  })
  originalTitle!: string;
}
