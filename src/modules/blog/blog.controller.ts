import { StaffRole } from '@/database/entities/Account.entity';
import { BlogStatus } from '@/database/entities/blog.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { Public } from '@/share/decorators/role.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import { StaffRoleGuard, StaffRoles } from '../auth/guard/staffRole.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BlogService } from './blog.service';
import {
  BlogListQueryDto,
  BlogResponseDto,
  CreateBlogDto,
  GenerateSlugDto,
  SlugResponseDto,
  UpdateBlogDto,
} from './dtos/blog.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new blog post with optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Blog title',
          example: 'Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng',
        },
        content: {
          type: 'string',
          description: 'Blog content (HTML)',
          example:
            '<h1>Hiến máu nhân đạo</h1><p>Hiến máu là một hành động cao đẹp...</p>',
        },
        excerpt: {
          type: 'string',
          description: 'Blog excerpt/summary',
          example: 'Hiến máu nhân đạo là hành động cao đẹp...',
        },
        tags: {
          type: 'string',
          description: 'Tags as JSON string array or comma-separated string',
          example: '["hiến máu", "nhân đạo", "sức khỏe"]',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          description: 'Blog status',
          example: 'draft',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Blog image file (optional)',
        },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    type: BlogResponseDto,
  })
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BlogResponseDto> {
    let imageUrl: string | undefined;

    // Upload image to Cloudinary if provided
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'blogs',
      );
      imageUrl = uploadResult.secure_url;
    }

    // Parse tags if provided as string
    let parsedTags: string[] | undefined;
    if (createBlogDto.tags) {
      try {
        // Handle if tags is already an array (shouldn't happen but safe)
        if (Array.isArray(createBlogDto.tags)) {
          parsedTags = createBlogDto.tags;
        } else {
          // Parse JSON string, handle potential comma-separated format
          const tagsString = createBlogDto.tags as string;
          if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
            parsedTags = JSON.parse(tagsString);
          } else {
            // Handle comma-separated format: "tag1,tag2,tag3"
            parsedTags = tagsString.split(',').map((tag) => tag.trim());
          }
        }
      } catch (error) {
        // If JSON parsing fails, treat as comma-separated string
        const tagsString = createBlogDto.tags as string;
        parsedTags = tagsString.split(',').map((tag) => tag.trim());
      }
    }

    const parsedData = {
      ...createBlogDto,
      tags: parsedTags,
      status: createBlogDto.status as BlogStatus,
      imageUrl,
    };

    return this.blogService.createBlog(parsedData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts with pagination and filters' })
  @ApiPaginatedResponse(BlogResponseDto)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    example: 'published',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title, excerpt, or content',
    example: 'hiến máu',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
    description: 'Filter by tag',
    example: 'sức khỏe',
  })
  @ApiQuery({
    name: 'publishedOnly',
    required: false,
    type: Boolean,
    description: 'Show only published posts',
    example: true,
  })
  @Public()
  async getBlogs(@Query() query: BlogListQueryDto) {
    return this.blogService.getBlogs(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a blog post by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Blog post slug' })
  @ApiResponse({
    status: 200,
    description: 'Blog post found',
    type: BlogResponseDto,
  })
  @Public()
  async getBlogBySlug(@Param('slug') slug: string): Promise<BlogResponseDto> {
    return this.blogService.getBlogBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post found',
    type: BlogResponseDto,
  })
  @Public()
  async getBlogById(@Param('id') id: string): Promise<BlogResponseDto> {
    return this.blogService.getBlogById(id);
  }

  @Patch(':id')
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Update a blog post with optional image replacement',
  })
  @ApiParam({ name: 'id', type: String, description: 'Blog post ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Blog title',
          example: 'Updated blog title',
        },
        content: {
          type: 'string',
          description: 'Blog content (HTML)',
          example: '<h1>Updated content</h1><p>Updated blog content...</p>',
        },
        excerpt: {
          type: 'string',
          description: 'Blog excerpt/summary',
          example: 'Updated excerpt...',
        },
        tags: {
          type: 'string',
          description: 'Tags as JSON string array or comma-separated string',
          example: '["updated", "tags"]',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          description: 'Blog status',
          example: 'published',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'New blog image file (optional, replaces existing)',
        },
        removeImage: {
          type: 'string',
          description: 'Set to "true" to remove existing image',
          example: 'false',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
    type: BlogResponseDto,
  })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto & { removeImage?: string },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BlogResponseDto> {
    let imageUrl: string | null | undefined;

    // Handle image operations
    if (file) {
      // Get current blog to check existing image for replacement
      const currentBlog = await this.blogService.getBlogById(id);

      // Replace image (delete old and upload new)
      const uploadResult = await this.cloudinaryService.replaceAvatar(
        file,
        'blogs',
        currentBlog.imageUrl,
      );
      imageUrl = uploadResult.secure_url;
    } else if (updateBlogDto.removeImage === 'true') {
      // Remove existing image
      const currentBlog = await this.blogService.getBlogById(id);

      if (currentBlog.imageUrl) {
        try {
          await this.cloudinaryService.deleteImage(currentBlog.imageUrl);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
      imageUrl = null;
    }

    // Parse tags if provided as string
    let parsedTags: string[] | undefined;
    if (updateBlogDto.tags) {
      try {
        // Handle if tags is already an array (shouldn't happen but safe)
        if (Array.isArray(updateBlogDto.tags)) {
          parsedTags = updateBlogDto.tags;
        } else {
          // Parse JSON string, handle potential comma-separated format
          const tagsString = updateBlogDto.tags as string;
          if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
            parsedTags = JSON.parse(tagsString);
          } else {
            // Handle comma-separated format: "tag1,tag2,tag3"
            parsedTags = tagsString.split(',').map((tag) => tag.trim());
          }
        }
      } catch (error) {
        // If JSON parsing fails, treat as comma-separated string
        const tagsString = updateBlogDto.tags as string;
        parsedTags = tagsString.split(',').map((tag) => tag.trim());
      }
    }

    const parsedData = {
      ...updateBlogDto,
      tags: parsedTags,
      status: updateBlogDto.status as BlogStatus,
      ...(imageUrl !== undefined && { imageUrl }),
    };

    // Remove the removeImage field from the data sent to service
    delete (parsedData as any).removeImage;

    return this.blogService.updateBlog(id, parsedData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiParam({ name: 'id', type: String, description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post deleted successfully',
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async deleteBlog(@Param('id') id: string): Promise<{ message: string }> {
    await this.blogService.deleteBlog(id);
    return { message: 'Blog post deleted successfully' };
  }

  @Post('generate-slug')
  @ApiOperation({
    summary: 'Generate SEO-friendly slug from Vietnamese title',
    description:
      'Test endpoint to generate Vietnamese-friendly slug from a title. Handles Vietnamese diacritics and special characters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Slug generated successfully',
    type: SlugResponseDto,
  })
  @Public()
  async generateSlug(
    @Body() generateSlugDto: GenerateSlugDto,
  ): Promise<SlugResponseDto> {
    const slug = this.blogService.generateSlug(generateSlugDto.title);
    return {
      slug,
      originalTitle: generateSlugDto.title,
    };
  }
}
