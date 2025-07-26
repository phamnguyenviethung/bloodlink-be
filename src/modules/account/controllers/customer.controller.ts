import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccountRole } from '@/database/entities/Account.entity';
import { AuthenticatedGuard } from '@/modules/auth/guard/authenticated.guard';
import { Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';

import { FindCustomersByBloodTypeDto } from '../dtos';
import { FindCustomersByLocationDto } from '../dtos/location-search';
import { UpdateCustomerProfileDto } from '../dtos/profile';
import { CustomerService } from '../services/customer.service';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER)
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({ status: 200, description: 'Return customer profile' })
  async getMe(@Req() req: any) {
    return this.customerService.getMe(req.user.id);
  }

  @Put('me')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER)
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiBody({ type: UpdateCustomerProfileDto })
  @ApiResponse({ status: 200, description: 'Return updated customer profile' })
  async updateCustomer(
    @Req() req: any,
    @Body() data: UpdateCustomerProfileDto,
  ) {
    return this.customerService.updateCustomer(req.user.id, data);
  }

  @Put('me/avatar')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER)
  @ApiOperation({ summary: 'Update customer avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Return updated customer profile' })
  async updateAvatar(@Req() req: any, @Body('avatarUrl') avatarUrl: string) {
    return this.customerService.updateAvatar(req.user.id, avatarUrl);
  }

  @Post('find-by-blood-type')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER)
  @ApiOperation({
    summary: 'Find customers by blood type within radius of current user',
  })
  @ApiBody({ type: FindCustomersByBloodTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Return customers with matching blood type within radius',
  })
  async findCustomersByBloodType(
    @Req() req: any,
    @Body() data: FindCustomersByBloodTypeDto,
  ) {
    return this.customerService.findCustomersByBloodTypeWithinRadius(
      req.user.id,
      data,
    );
  }

  @Post('find-by-location')
  @Roles(AccountRole.USER)
  @ApiOperation({
    summary:
      'Find customers by blood type within radius of specified coordinates',
  })
  @ApiBody({ type: FindCustomersByLocationDto })
  @ApiResponse({
    status: 200,
    description:
      'Return customers with matching blood type within radius of specified location',
  })
  async findCustomersByLocation(@Body() data: FindCustomersByLocationDto) {
    return this.customerService.findCustomersByLocationAndBloodType(data);
  }

  @Get()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get all customers (admin only)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({ status: 200, description: 'Return customers list' })
  async getAllCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerService.getAllCustomers({ page, limit });
  }

  @Get('stats')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get customer statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Return customer statistics' })
  async getCustomerStats() {
    return this.customerService.getCustomerStats();
  }
}
