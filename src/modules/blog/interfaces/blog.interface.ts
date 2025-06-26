import { BlogStatus } from '@/database/entities/blog.entity';

export interface IBlogService {
  generateSlug(title: string): string;
  createBlog(data: CreateBlogData): Promise<BlogResponse>;
  updateBlog(id: string, data: UpdateBlogData): Promise<BlogResponse>;
  deleteBlog(id: string): Promise<void>;
  getBlogById(id: string): Promise<BlogResponse>;
  getBlogBySlug(slug: string): Promise<BlogResponse>;
  getBlogs(filters: BlogListFilters): Promise<PaginatedBlogResponse>;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  status?: BlogStatus;
  slug?: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  status?: BlogStatus;
  slug?: string;
  publishedAt?: Date;
}

export interface BlogResponse {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  slug: string;
  tags?: string[];
  status: BlogStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogListFilters {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  search?: string;
  tag?: string;
  publishedOnly?: boolean;
}

export interface PaginatedBlogResponse {
  data: BlogResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SlugData {
  slug: string;
  originalTitle: string;
}
