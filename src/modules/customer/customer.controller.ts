import { RequestWithUser } from '@/share/types/request.type';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guard/clerk.guard';
import { CustomerService } from './customer.service';

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
}
