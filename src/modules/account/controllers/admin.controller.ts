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
import { UpdateAdminProfileDto } from '../dtos/profile';
import { RegisterAdminDto } from '../dtos';
import { AdminService } from '../services/admin.service';
import { HospitalSerivce } from '../services/hospital.service';

@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly hospitalService: HospitalSerivce,
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
