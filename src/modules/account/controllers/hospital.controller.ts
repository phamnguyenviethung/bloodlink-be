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
import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { UpdateHospitalProfileDto } from '../dtos/profile';
import { HospitalSerivce } from '../services/hospital.service';
import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
import { RegisterHospitalDto } from '../dtos/hospital';

@ApiTags('Hospital')
@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalSerivce) {}

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
