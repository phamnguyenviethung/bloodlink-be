import { RequestWithUser } from '@/share/types/request.type';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAdminAuthGuard } from '../../auth/guard/clerkAdmin.guard';
import { UpdateStaffProfileDto, RegisterStaffDto } from '../dtos';
import { StaffService } from '../services/staff.service';

@ApiTags('Staff')
@Controller('staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

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
