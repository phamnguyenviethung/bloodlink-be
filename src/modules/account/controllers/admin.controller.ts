import { RequestWithUser } from '@/share/types/request.type';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClerkAdminAuthGuard } from '../../auth/guard/clerkAdmin.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { RegisterAdminDto } from '../dtos';
import { UpdateAdminProfileDto } from '../dtos/profile';
import { AdminService } from '../services/admin.service';
import { HospitalSerivce } from '../services/hospital.service';

@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly hospitalService: HospitalSerivce,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Get current admin profile' })
  async getMe(@Req() request: RequestWithUser) {
    return this.adminService.getMe(request.user.id);
  }

  @Patch('me')
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Update current admin profile' })
  async updateMe(
    @Req() request: RequestWithUser,
    @Body() data: UpdateAdminProfileDto,
  ) {
    return this.adminService.updateAdmin(request.user.id, data);
  }

  @Post('avatar')
  @UseGuards(ClerkAdminAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload admin avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
      required: ['avatar'],
    },
  })
  async uploadAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Get current admin profile to check existing avatar
    const currentAdmin = await this.adminService.getMe(request.user.id);

    // Replace avatar (delete old and upload new)
    const uploadResult = await this.cloudinaryService.replaceAvatar(
      file,
      'avatars/admins',
      currentAdmin.avatar,
    );

    // Update admin avatar in database
    const updatedAdmin = await this.adminService.updateAvatar(
      request.user.id,
      uploadResult.secure_url,
    );

    return {
      message: 'Avatar updated successfully',
      data: {
        avatar_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        old_avatar_deleted: uploadResult.oldAvatarDeleted,
      },
    };
  }

  @Post('register')
  @ApiOperation({
    summary:
      'Register a new admin account (Admin only). Default password is 12345678',
    description: 'Creates an admin account with the provided information',
  })
  async registerAdmin(
    @Req() request: RequestWithUser,
    @Body() data: RegisterAdminDto,
  ) {
    return this.adminService.registerAdmin(data);
  }
}
