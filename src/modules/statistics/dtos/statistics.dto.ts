import { ApiProperty } from "@nestjs/swagger";

export class StatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of campaigns in the system',
    example: 15,
  })
  totalCampaigns: number;

  @ApiProperty({
    description: 'Total volume of whole blood donated (in ml)',
    example: 50000,
  })
  totalBloodDonated: number;

  @ApiProperty({
    description: 'Total number of blood units donated',
    example: 150,
  })
  totalBloodUnits: number;
}
