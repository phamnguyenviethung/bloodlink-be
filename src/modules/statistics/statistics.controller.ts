import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { StatisticsResponseDto } from "./dtos/statistics.dto";
import { StatisticsService } from "./statistics.service";

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get system statistics',
    description:
      'Returns total number of campaigns and total blood donated in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
    type: StatisticsResponseDto,
  })
  async getSystemStatistics(): Promise<StatisticsResponseDto> {
    return this.statisticsService.getSystemStatistics();
  }
}
