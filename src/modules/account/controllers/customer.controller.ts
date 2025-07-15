import { RequestWithUser } from '@/share/types/request.type';
import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { CustomerService } from '../services/customer.service';
import {
  UpdateCustomerProfileDto,
  FindCustomersByBloodTypeDto,
} from '../dtos/profile';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
}
