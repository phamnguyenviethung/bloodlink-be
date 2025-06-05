import { RequestWithUser } from '@/share/types/request.type';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAdminAuthGuard } from '../../auth/guard/clerkAdmin.guard';
import { UpdateAdminProfileDto } from '../dtos/profile';
import { AdminService } from '../services/admin.service';

@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
