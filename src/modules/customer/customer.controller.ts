import { RequestWithUser } from '@/share/types/request.type';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guard/clerk.guard';
import { CustomerService } from './customer.service';
import { UpdateCustomerProfileDto } from './dtos/customer.dto';
@ApiTags('Customers')
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
}
