import { UploadApiResponse } from 'cloudinary';

import { BadRequestException, Injectable } from '@nestjs/common';

import { cloudinary, CloudinaryConfig } from './cloudinary.config';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private cloudinaryConfig: CloudinaryConfig) {}

  /**
   * Upload image to Cloudinary
   * @param file - Express.Multer.File object
   * @param folder - Optional folder name in Cloudinary
   * @returns Promise<CloudinaryUploadResult>
   */
  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<CloudinaryUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum 10MB allowed',
      );
    }

    try {
      const uploadOptions: any = {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(file.buffer);
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param files - Array of Express.Multer.File objects
   * @param folder - Optional folder name in Cloudinary
   * @returns Promise<CloudinaryUploadResult[]>
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Multiple upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image to delete
   * @returns Promise<{result: string}>
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { result: result.result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Delete failed: ${errorMessage}`);
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param publicIds - Array of public IDs to delete
   * @returns Promise<{deleted: Record<string, string>}>
   */
  async deleteMultipleImages(
    publicIds: string[],
  ): Promise<{ deleted: Record<string, string> }> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Public IDs are required');
    }

    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return { deleted: result.deleted };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Multiple delete failed: ${errorMessage}`);
    }
  }

  /**
   * Get image URL with transformations
   * @param publicId - Public ID of the image
   * @param transformations - Cloudinary transformation options
   * @returns string - Transformed image URL
   */
  getImageUrl(publicId: string, transformations?: Record<string, any>): string {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    return cloudinary.url(publicId, transformations);
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param cloudinaryUrl - Full Cloudinary URL
   * @returns string - Extracted public_id
   */
  extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
    if (!cloudinaryUrl) return null;

    try {
      // Match pattern: .../upload/v{version}/{public_id}.{extension}
      // or .../upload/{public_id}.{extension}
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
      const match = cloudinaryUrl.match(regex);

      if (match && match[1]) {
        return match[1]; // This is the public_id (including folder path)
      }

      return null;
    } catch (error) {
      console.warn('Error extracting public_id from URL:', error);
      return null;
    }
  }

  /**
   * Delete old avatar and upload new one (atomic operation)
   * @param file - New avatar file
   * @param folder - Cloudinary folder
   * @param oldAvatarUrl - URL of old avatar to delete
   * @returns Promise<CloudinaryUploadResult>
   */
  async replaceAvatar(
    file: Express.Multer.File,
    folder: string,
    oldAvatarUrl?: string,
  ): Promise<CloudinaryUploadResult & { oldAvatarDeleted: boolean }> {
    let oldAvatarDeleted = false;

    // Delete old avatar if exists
    if (oldAvatarUrl) {
      const oldPublicId = this.extractPublicIdFromUrl(oldAvatarUrl);
      if (oldPublicId) {
        try {
          await this.deleteImage(oldPublicId);
          oldAvatarDeleted = true;
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
          // Continue with upload even if delete fails
        }
      }
    }

    // Upload new avatar
    const uploadResult = await this.uploadImage(file, folder);

    return {
      ...uploadResult,
      oldAvatarDeleted,
    };
  }
  getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number,
  ): string {
    const transformations: Record<string, any> = {
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (width) transformations.width = width;
    if (height) transformations.height = height;
    if (width && height) transformations.crop = 'fill';

    return this.getImageUrl(publicId, transformations);
  }
}
