import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CloudinaryService,
  CloudinaryUploadResult,
} from './cloudinary.service';

@ApiTags('Cloudinary Test')
@Controller('cloudinary-test')
export class CloudinaryTestController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload single image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name in Cloudinary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            public_id: { type: 'string' },
            secure_url: { type: 'string' },
            url: { type: 'string' },
            format: { type: 'string' },
            width: { type: 'number' },
            height: { type: 'number' },
            bytes: { type: 'number' },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ): Promise<{ message: string; data: CloudinaryUploadResult }> {
    const result = await this.cloudinaryService.uploadImage(file, folder);
    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple images to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files to upload (max 10)',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name in Cloudinary',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              public_id: { type: 'string' },
              secure_url: { type: 'string' },
              url: { type: 'string' },
              format: { type: 'string' },
              width: { type: 'number' },
              height: { type: 'number' },
              bytes: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ): Promise<{ message: string; data: CloudinaryUploadResult[] }> {
    const results = await this.cloudinaryService.uploadMultipleImages(
      files,
      folder,
    );
    return {
      message: 'Images uploaded successfully',
      data: results,
    };
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete image from Cloudinary' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
        },
      },
    },
  })
  async deleteImage(
    @Param('publicId') publicId: string,
  ): Promise<{ message: string; data: { result: string } }> {
    // Decode the publicId since it might contain special characters
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await this.cloudinaryService.deleteImage(decodedPublicId);
    return {
      message: 'Image deleted successfully',
      data: result,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple images from Cloudinary' })
  @ApiResponse({
    status: 200,
    description: 'Images deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'object' },
          },
        },
      },
    },
  })
  async deleteMultipleImages(
    @Body('publicIds') publicIds: string[],
  ): Promise<{ message: string; data: { deleted: Record<string, string> } }> {
    const result = await this.cloudinaryService.deleteMultipleImages(publicIds);
    return {
      message: 'Images deleted successfully',
      data: result,
    };
  }

  @Get('url/:publicId')
  @ApiOperation({ summary: 'Get optimized image URL' })
  @ApiResponse({
    status: 200,
    description: 'Image URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            optimized_url: { type: 'string' },
          },
        },
      },
    },
  })
  async getImageUrl(
    @Param('publicId') publicId: string,
    @Query('width') width?: number,
    @Query('height') height?: number,
  ): Promise<{
    message: string;
    data: { url: string; optimized_url: string };
  }> {
    const decodedPublicId = decodeURIComponent(publicId);
    const url = this.cloudinaryService.getImageUrl(decodedPublicId);
    const optimizedUrl = this.cloudinaryService.getOptimizedImageUrl(
      decodedPublicId,
      width,
      height,
    );

    return {
      message: 'Image URLs generated successfully',
      data: {
        url,
        optimized_url: optimizedUrl,
      },
    };
  }
}
