import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BloodInfoService } from './blood-info.service';
import {
  BloodGroup,
  BloodRh,
  BloodComponentType,
} from '../../database/entities/Blood.entity';
import {
  BloodInfoResponseDto,
  BloodCompatibilityResponseDto,
} from './dtos/blood-info-response.dto';

@ApiTags('Blood Information')
@Controller('blood-info')
export class BloodInfoController {
  constructor(private readonly bloodInfoService: BloodInfoService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all blood type information',
    description:
      'Retrieve comprehensive information about all blood types for customers',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all blood type information',
    type: [BloodInfoResponseDto],
  })
  async getAllBloodTypeInfo(): Promise<BloodInfoResponseDto[]> {
    return this.bloodInfoService.getAllBloodTypeInfo();
  }

  @Get(':group/:rh')
  @ApiOperation({
    summary: 'Get specific blood type information',
    description: 'Retrieve detailed information about a specific blood type',
  })
  @ApiParam({
    name: 'group',
    enum: BloodGroup,
    description: 'Blood group (A, B, AB, O)',
  })
  @ApiParam({
    name: 'rh',
    enum: BloodRh,
    description: 'Rh factor (+ or -)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved blood type information',
    type: BloodInfoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blood type information not found',
  })
  async getBloodTypeInfo(
    @Param('group') group: BloodGroup,
    @Param('rh') rh: BloodRh,
  ): Promise<BloodInfoResponseDto> {
    return this.bloodInfoService.getBloodTypeInfo(group, rh);
  }

  @Get(':group/:rh/compatibility')
  @ApiOperation({
    summary: 'Get blood compatibility information',
    description:
      'Retrieve compatibility information for a blood type across different components',
  })
  @ApiParam({
    name: 'group',
    enum: BloodGroup,
    description: 'Blood group (A, B, AB, O)',
  })
  @ApiParam({
    name: 'rh',
    enum: BloodRh,
    description: 'Rh factor (+ or -)',
  })
  @ApiQuery({
    name: 'componentType',
    enum: BloodComponentType,
    required: false,
    description: 'Specific blood component type to check compatibility for',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved compatibility information',
    type: [BloodCompatibilityResponseDto],
  })
  async getBloodCompatibility(
    @Param('group') group: BloodGroup,
    @Param('rh') rh: BloodRh,
    @Query('componentType') componentType?: BloodComponentType,
  ): Promise<BloodCompatibilityResponseDto[]> {
    return this.bloodInfoService.getBloodCompatibility(
      group,
      rh,
      componentType,
    );
  }

  @Get(':group/:rh/compatible-donors/:componentType')
  @ApiOperation({
    summary: 'Search compatible donors',
    description:
      'Find all blood types that can donate to a specific recipient for a given component',
  })
  @ApiParam({
    name: 'group',
    enum: BloodGroup,
    description: 'Recipient blood group (A, B, AB, O)',
  })
  @ApiParam({
    name: 'rh',
    enum: BloodRh,
    description: 'Recipient Rh factor (+ or -)',
  })
  @ApiParam({
    name: 'componentType',
    enum: BloodComponentType,
    description: 'Blood component type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully found compatible donors',
    type: [BloodInfoResponseDto],
  })
  async searchCompatibleDonors(
    @Param('group') group: BloodGroup,
    @Param('rh') rh: BloodRh,
    @Param('componentType') componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]> {
    return this.bloodInfoService.searchCompatibleDonors(
      group,
      rh,
      componentType,
    );
  }

  @Get(':group/:rh/compatible-recipients/:componentType')
  @ApiOperation({
    summary: 'Search compatible recipients',
    description:
      'Find all blood types that can receive from a specific donor for a given component',
  })
  @ApiParam({
    name: 'group',
    enum: BloodGroup,
    description: 'Donor blood group (A, B, AB, O)',
  })
  @ApiParam({
    name: 'rh',
    enum: BloodRh,
    description: 'Donor Rh factor (+ or -)',
  })
  @ApiParam({
    name: 'componentType',
    enum: BloodComponentType,
    description: 'Blood component type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully found compatible recipients',
    type: [BloodInfoResponseDto],
  })
  async searchCompatibleRecipients(
    @Param('group') group: BloodGroup,
    @Param('rh') rh: BloodRh,
    @Param('componentType') componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]> {
    return this.bloodInfoService.searchCompatibleRecipients(
      group,
      rh,
      componentType,
    );
  }
}
