import { AccountRole } from '@/database/entities/Account.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
import { Roles } from '@/share/decorators/role.decorator';
import { RequestWithUser } from '@/share/types/request.type';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import {
  FindCustomersByBloodTypeDto,
  UpdateCustomerProfileDto,
} from '../dtos/profile';
import { CustomerService } from '../services/customer.service';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get current customer profile' })
  async getMe(@Req() request: RequestWithUser) {
    return this.customerService.getMe(request.user.id);
  }

  @Patch('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Update current customer profile' })
  async updateMe(
    @Req() request: RequestWithUser,
    @Body() data: UpdateCustomerProfileDto,
  ) {
    return this.customerService.updateCustomer(request.user.id, data);
  }

  @Post('avatar')
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload customer avatar' })
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
    // Get current customer profile to check existing avatar
    const currentCustomer = await this.customerService.getMe(request.user.id);

    // Replace avatar (delete old and upload new)
    const uploadResult = await this.cloudinaryService.replaceAvatar(
      file,
      'avatars/customers',
      currentCustomer.avatar,
    );

    // Update customer avatar in database
    const updatedCustomer = await this.customerService.updateAvatar(
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

  @Get('find-nearby')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary:
      'Find customers with specific blood type within a radius from your location',
  })
  @ApiQuery({
    name: 'bloodGroup',
    type: String,
    enum: BloodGroup,
    required: true,
  })
  @ApiQuery({
    name: 'bloodRh',
    type: String,
    enum: BloodRh,
    required: true,
  })
  @ApiQuery({
    name: 'radius',
    type: Number,
    required: true,
    description: 'Search radius in kilometers (max 100)',
  })
  async findByBloodTypeWithinRadius(
    @Req() request: RequestWithUser,
    @Query() queryParams: Record<string, string>,
  ) {
    // Parse and validate radius
    const radiusStr = queryParams.radius;
    if (!radiusStr) {
      throw new BadRequestException('Radius parameter is required');
    }

    const radius = Number(radiusStr);
    if (isNaN(radius)) {
      throw new BadRequestException('Radius must be a valid number');
    }

    if (radius < 0 || radius > 100) {
      throw new BadRequestException(
        'Radius must be between 0 and 100 kilometers',
      );
    }

    // Create validated DTO
    const params: FindCustomersByBloodTypeDto = {
      bloodGroup: queryParams.bloodGroup as BloodGroup,
      bloodRh: queryParams.bloodRh as BloodRh,
      radius: radius,
    };

    return this.customerService.findCustomersByBloodTypeWithinRadius(
      request.user.id,
      params,
    );
  }

  @Get('list')
  @Roles(AccountRole.ADMIN)
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Get all customers (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerService.getAllCustomers({ page, limit });
  }

  @Get('stats')
  @Roles(AccountRole.ADMIN)
  @UseGuards(ClerkAdminAuthGuard)
  @ApiOperation({ summary: 'Get customer statistics (admin only)' })
  async getCustomerStats() {
    return this.customerService.getCustomerStats();
  }
}
