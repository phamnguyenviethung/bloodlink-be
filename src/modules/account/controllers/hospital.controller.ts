import { RequestWithUser } from '@/share/types/request.type';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { UpdateHospitalProfileDto } from '../dtos/profile';
import { HospitalSerivce } from '../services/hospital.service';

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
}
