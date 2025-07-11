import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogResponseDto,
  BlogListQueryDto,
  GenerateSlugDto,
  SlugResponseDto,
} from './dtos/blog.dto';
import { Public, Roles } from '@/share/decorators/role.decorator';
import { AccountRole, StaffRole } from '@/database/entities/Account.entity';
import { RolesGuard } from '@/share/guards/roles.guard';
import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { StaffRoleGuard, StaffRoles } from '../auth/guard/staffRole.guard';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    type: BlogResponseDto,
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogResponseDto> {
    return this.blogService.createBlog(createBlogDto);
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
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiParam({ name: 'id', type: String, description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
    type: BlogResponseDto,
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<BlogResponseDto> {
    return this.blogService.updateBlog(id, updateBlogDto);
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
  @ApiBearerAuth()
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
