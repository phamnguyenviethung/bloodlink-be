import { ApiProperty } from '@nestjs/swagger';
import {
  BloodGroup,
  BloodRh,
  BloodComponentType,
} from '../../../database/entities/Blood.entity';

export class BloodInfoResponseDto {
  @ApiProperty({ enum: BloodGroup })
  group: BloodGroup;

  @ApiProperty({ enum: BloodRh })
  rh: BloodRh;

  @ApiProperty({ description: 'Description of the blood type' })
  description: string;

  @ApiProperty({ description: 'Characteristics of the blood type' })
  characteristics: string;

  @ApiProperty({ description: 'Who can donate to this blood type' })
  canDonateTo: string;

  @ApiProperty({ description: 'Who can receive from this blood type' })
  canReceiveFrom: string;

  @ApiProperty({ description: 'Frequency in population' })
  frequency: string;

  @ApiProperty({ description: 'Special notes', required: false })
  specialNotes?: string;
}

export class BloodCompatibilityResponseDto {
  @ApiProperty({ enum: BloodComponentType })
  componentType: BloodComponentType;

  @ApiProperty({ type: [BloodInfoResponseDto] })
  compatibleDonors: BloodInfoResponseDto[];

  @ApiProperty({ type: [BloodInfoResponseDto] })
  compatibleRecipients: BloodInfoResponseDto[];
}
