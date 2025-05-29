import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './services/location.service';
import { ApiOperation } from '@nestjs/swagger';
import { VietnamProvinceService } from './services/vietnamProvince.service';

@Controller('location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly vietnamProvinceService: VietnamProvinceService,
  ) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Get all provinces' })
  async getProvinces() {
    return this.vietnamProvinceService.getProvinces();
  }

  @Get('districts/:provinceId')
  @ApiOperation({ summary: 'Get district by ward id' })
  async getDistricts(@Param('provinceId') provinceId: number) {
    return this.vietnamProvinceService.getDistricts(provinceId);
  }

  @Get('wards/:districtId')
  @ApiOperation({ summary: 'Get district by ward id' })
  async getWards(@Param('districtId') districtId: number) {
    return this.vietnamProvinceService.getWards(districtId);
  }

  @Get('full-address/:wardId')
  @ApiOperation({ summary: 'Get ward by id' })
  async getWard(@Param('wardId') wardId: number) {
    return this.vietnamProvinceService.getFullByWard(wardId);
  }
}
