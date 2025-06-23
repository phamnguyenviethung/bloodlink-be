import { ApiProperty } from '@nestjs/swagger';
import {
  BloodGroup,
  BloodRh,
  BloodComponentType,
} from '../../../database/entities/Blood.entity';

export class BloodCompatibilitySearchDto {
  @ApiProperty({
    enum: BloodGroup,
    description: 'Blood group to search compatibility for',
    example: BloodGroup.A,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    enum: BloodRh,
    description: 'Blood Rh factor to search compatibility for',
    example: BloodRh.POSITIVE,
  })
  rh: BloodRh;

  @ApiProperty({
    enum: BloodComponentType,
    description: 'Type of blood component to check compatibility for',
    example: BloodComponentType.WHOLE_BLOOD,
    required: false,
  })
  componentType?: BloodComponentType;
}
