import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ApiProperty } from '@nestjs/swagger';

// DTO for finding customers by blood type within radius of specific coordinates
export const findCustomersByLocationSchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  radius: z.number().positive().describe('Search radius in kilometers'),
  latitude: z.string().describe('Latitude of the center point'),
  longitude: z.string().describe('Longitude of the center point'),
});

export class FindCustomersByLocationDto extends createZodDto(
  findCustomersByLocationSchema,
) {
  @ApiProperty({
    enum: BloodGroup,
    description: 'Blood group to search for',
    example: BloodGroup.A,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    enum: BloodRh,
    description: 'Blood Rh factor to search for',
    example: BloodRh.POSITIVE,
  })
  bloodRh: BloodRh;

  @ApiProperty({
    description: 'Search radius in kilometers',
    example: 10,
    minimum: 0.1,
  })
  radius: number;

  @ApiProperty({
    description: 'Latitude of the center point',
    example: '10.762622',
  })
  latitude: string;

  @ApiProperty({
    description: 'Longitude of the center point',
    example: '106.660172',
  })
  longitude: string;
}

export type FindCustomersByLocationDtoType = z.infer<
  typeof findCustomersByLocationSchema
>;
