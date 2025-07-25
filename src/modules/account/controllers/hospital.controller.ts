import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
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

import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { RegisterHospitalDto } from '../dtos/hospital';
import { UpdateHospitalProfileDto } from '../dtos/profile';
import { HospitalSerivce } from '../services/hospital.service';

@ApiTags('Hospital')
@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalSerivce,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get current hospital profile' })
  async getMe(@Req() request: RequestWithUser) {
    return this.hospitalService.getMe(request.user.id);
  }

  @Patch('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Update current customer profile' })
  async updateMe(
    @Req() request: RequestWithUser,
    @Body() data: UpdateHospitalProfileDto,
  ) {
    return this.hospitalService.updateHospital(request.user.id, data);
  }

  @Post('avatar')
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload hospital avatar' })
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
    // Get current hospital profile to check existing avatar
    const currentHospital = await this.hospitalService.getMe(request.user.id);

    // Replace avatar (delete old and upload new)
    const uploadResult = await this.cloudinaryService.replaceAvatar(
      file,
      'avatars/hospitals',
      currentHospital.avatar,
    );

    // Update hospital avatar in database
    await this.hospitalService.updateAvatar(
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
      'Register a new hospital account (Admin only). Default password is 12345678',
    description:
      'Creates a hospital account and sends an invitation email to the provided address',
  })
  async registerHospital(
    @Req() request: RequestWithUser,
    @Body() data: RegisterHospitalDto,
  ) {
    return this.hospitalService.registerHospital(data);
  }
}
