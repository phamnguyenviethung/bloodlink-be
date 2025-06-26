import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Blog, BlogStatus } from '@/database/entities/blog.entity';
import {
  IBlogService,
  CreateBlogData,
  UpdateBlogData,
  BlogResponse,
  BlogListFilters,
  PaginatedBlogResponse,
  SlugData,
} from './interfaces/blog.interface';

@Injectable()
export class BlogService implements IBlogService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Generate Vietnamese-friendly slug from title
   * Handles Vietnamese diacritics and special characters
   */
  generateSlug(title: string): string {
    // Vietnamese character mapping
    const vietnameseMap: { [key: string]: string } = {
      à: 'a',
      á: 'a',
      ạ: 'a',
      ả: 'a',
      ã: 'a',
      â: 'a',
      ầ: 'a',
      ấ: 'a',
      ậ: 'a',
      ẩ: 'a',
      ẫ: 'a',
      ă: 'a',
      ằ: 'a',
      ắ: 'a',
      ặ: 'a',
      ẳ: 'a',
      ẵ: 'a',
      è: 'e',
      é: 'e',
      ẹ: 'e',
      ẻ: 'e',
      ẽ: 'e',
      ê: 'e',
      ề: 'e',
      ế: 'e',
      ệ: 'e',
      ể: 'e',
      ễ: 'e',
      ì: 'i',
      í: 'i',
      ị: 'i',
      ỉ: 'i',
      ĩ: 'i',
      ò: 'o',
      ó: 'o',
      ọ: 'o',
      ỏ: 'o',
      õ: 'o',
      ô: 'o',
      ồ: 'o',
      ố: 'o',
      ộ: 'o',
      ổ: 'o',
      ỗ: 'o',
      ơ: 'o',
      ờ: 'o',
      ớ: 'o',
      ợ: 'o',
      ở: 'o',
      ỡ: 'o',
      ù: 'u',
      ú: 'u',
      ụ: 'u',
      ủ: 'u',
      ũ: 'u',
      ư: 'u',
      ừ: 'u',
      ứ: 'u',
      ự: 'u',
      ử: 'u',
      ữ: 'u',
      ỳ: 'y',
      ý: 'y',
      ỵ: 'y',
      ỷ: 'y',
      ỹ: 'y',
      đ: 'd',
      À: 'A',
      Á: 'A',
      Ạ: 'A',
      Ả: 'A',
      Ã: 'A',
      Â: 'A',
      Ầ: 'A',
      Ấ: 'A',
      Ậ: 'A',
      Ẩ: 'A',
      Ẫ: 'A',
      Ă: 'A',
      Ằ: 'A',
      Ắ: 'A',
      Ặ: 'A',
      Ẳ: 'A',
      Ẵ: 'A',
      È: 'E',
      É: 'E',
      Ẹ: 'E',
      Ẻ: 'E',
      Ẽ: 'E',
      Ê: 'E',
      Ề: 'E',
      Ế: 'E',
      Ệ: 'E',
      Ể: 'E',
      Ễ: 'E',
      Ì: 'I',
      Í: 'I',
      Ị: 'I',
      Ỉ: 'I',
      Ĩ: 'I',
      Ò: 'O',
      Ó: 'O',
      Ọ: 'O',
      Ỏ: 'O',
      Õ: 'O',
      Ô: 'O',
      Ồ: 'O',
      Ố: 'O',
      Ộ: 'O',
      Ổ: 'O',
      Ỗ: 'O',
      Ơ: 'O',
      Ờ: 'O',
      Ớ: 'O',
      Ợ: 'O',
      Ở: 'O',
      Ỡ: 'O',
      Ù: 'U',
      Ú: 'U',
      Ụ: 'U',
      Ủ: 'U',
      Ũ: 'U',
      Ư: 'U',
      Ừ: 'U',
      Ứ: 'U',
      Ự: 'U',
      Ử: 'U',
      Ữ: 'U',
      Ỳ: 'Y',
      Ý: 'Y',
      Ỵ: 'Y',
      Ỷ: 'Y',
      Ỹ: 'Y',
      Đ: 'D',
    };

    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  async createBlog(data: CreateBlogData): Promise<BlogResponse> {
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    const existingBlog = await this.em.findOne(Blog, { slug });
    if (existingBlog) {
      // Add timestamp to make it unique
      const timestamp = Date.now();
      data.slug = `${slug}-${timestamp}`;
    }

    const blog = new Blog({
      ...data,
      slug: existingBlog ? `${slug}-${Date.now()}` : slug,
      publishedAt:
        data.status === BlogStatus.PUBLISHED ? new Date() : undefined,
    });

    await this.em.persistAndFlush(blog);
    return this.mapToResponse(blog);
  }

  async updateBlog(id: string, data: UpdateBlogData): Promise<BlogResponse> {
    const blog = await this.em.findOne(Blog, { id });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Generate new slug if title is being updated
    if (data.title && data.title !== blog.title) {
      const newSlug = this.generateSlug(data.title);
      const existingBlog = await this.em.findOne(Blog, {
        slug: newSlug,
        id: { $ne: id }, // Exclude current blog
      });

      if (existingBlog) {
        data.slug = `${newSlug}-${Date.now()}`;
      } else {
        data.slug = newSlug;
      }
    }

    // Update publishedAt when status changes to published
    if (
      data.status === BlogStatus.PUBLISHED &&
      blog.status !== BlogStatus.PUBLISHED
    ) {
      data.publishedAt = new Date();
    }

    Object.assign(blog, data);
    await this.em.flush();

    return this.mapToResponse(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.em.findOne(Blog, { id });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.em.removeAndFlush(blog);
  }

  async getBlogById(id: string): Promise<BlogResponse> {
    const blog = await this.em.findOne(Blog, { id });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.mapToResponse(blog);
  }

  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    const blog = await this.em.findOne(Blog, { slug });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.mapToResponse(blog);
  }

  async getBlogs(filters: BlogListFilters): Promise<PaginatedBlogResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      tag,
      publishedOnly,
    } = filters;
    const offset = (page - 1) * limit;

    console.log(typeof publishedOnly, publishedOnly);

    // Build query conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (publishedOnly && publishedOnly === true) {
      where.status = BlogStatus.PUBLISHED;
    }

    if (search) {
      where.$or = [
        { title: { $ilike: `%${search}%` } },
        { excerpt: { $ilike: `%${search}%` } },
        { content: { $ilike: `%${search}%` } },
      ];
    }

    if (tag) {
      where.tags = { $contains: [tag] };
    }

    const [blogs, total] = await this.em.findAndCount(Blog, where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: blogs.map((blog) => this.mapToResponse(blog)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  private mapToResponse(blog: Blog): BlogResponse {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      imageUrl: blog.imageUrl,
      slug: blog.slug,
      tags: blog.tags,
      status: blog.status,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }
}
