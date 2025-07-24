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
import { RegisterStaffDto, UpdateStaffProfileDto } from '../dtos';
import { StaffService } from '../services/staff.service';

@ApiTags('Staff')
@Controller('staffs')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Get current staff profile' })
  async getMe(@Req() request: RequestWithUser) {
    return this.staffService.getMe(request.user.id);
  }

  @Patch('me')
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Update current staff profile' })
  async updateMe(
    @Req() request: RequestWithUser,
    @Body() data: UpdateStaffProfileDto,
  ) {
    return this.staffService.updateStaff(request.user.id, data);
  }

  @Post('avatar')
  @UseGuards(ClerkAdminAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload staff avatar' })
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
    // Get current staff profile to check existing avatar
    const currentStaff = await this.staffService.getMe(request.user.id);

    // Replace avatar (delete old and upload new)
    const uploadResult = await this.cloudinaryService.replaceAvatar(
      file,
      'avatars/staffs',
      currentStaff.avatar,
    );

    // Update staff avatar in database
    const updatedStaff = await this.staffService.updateAvatar(
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
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({
    summary:
      'Register a new staff account (Admin only). Default password is 12345678',
    description: 'Creates a staff account with the provided information',
  })
  async registerStaff(
    @Req() request: RequestWithUser,
    @Body() data: RegisterStaffDto,
  ) {
    return this.staffService.registerStaff(data);
  }
}
