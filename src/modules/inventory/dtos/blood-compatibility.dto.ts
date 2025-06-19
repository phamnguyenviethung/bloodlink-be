import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { BloodUnitStatus } from '@/database/entities/inventory.entity';

// Blood compatibility query schema
export const bloodCompatibilityQuerySchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).optional().default(10),
  status: z.nativeEnum(BloodUnitStatus).optional(),
  expired: z.coerce.boolean().optional(),
});

export type BloodCompatibilityQueryDtoType = z.infer<
  typeof bloodCompatibilityQuerySchema
>;
export class BloodCompatibilityQueryDto extends createZodDto(
  bloodCompatibilityQuerySchema,
) {
  @ApiProperty({
    enum: BloodGroup,
    description: 'Recipient blood group',
    example: BloodGroup.A,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    enum: BloodRh,
    description: 'Recipient Rh factor',
    example: BloodRh.POSITIVE,
  })
  bloodRh: BloodRh;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  limit?: number;

  @ApiPropertyOptional({
    enum: BloodUnitStatus,
    description: 'Filter by blood unit status',
  })
  status?: BloodUnitStatus;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by expiration status',
  })
  expired?: boolean;
}

// Blood component compatibility query schema
export const bloodComponentCompatibilityQuerySchema =
  bloodCompatibilityQuerySchema.extend({
    componentType: z.enum(['RBC', 'PLASMA', 'PLATELETS']),
  });

export type BloodComponentCompatibilityQueryDtoType = z.infer<
  typeof bloodComponentCompatibilityQuerySchema
>;
export class BloodComponentCompatibilityQueryDto extends createZodDto(
  bloodComponentCompatibilityQuerySchema,
) {
  @ApiProperty({
    enum: BloodGroup,
    description: 'Recipient blood group',
    example: BloodGroup.A,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    enum: BloodRh,
    description: 'Recipient Rh factor',
    example: BloodRh.POSITIVE,
  })
  bloodRh: BloodRh;

  @ApiProperty({
    enum: ['RBC', 'PLASMA', 'PLATELETS'],
    description: 'Blood component type',
    example: 'RBC',
  })
  componentType: 'RBC' | 'PLASMA' | 'PLATELETS';

  @ApiPropertyOptional({
    type: Number,
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  limit?: number;

  @ApiPropertyOptional({
    enum: BloodUnitStatus,
    description: 'Filter by blood unit status',
  })
  status?: BloodUnitStatus;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by expiration status',
  })
  expired?: boolean;
}

export class BloodCompatibilityInfoDto {
  @ApiProperty({
    description: 'Recipient blood group and Rh',
    example: 'A+',
  })
  recipient: string;

  @ApiProperty({
    description: 'Compatible donor blood types',
    example: ['A+', 'A-', 'O+', 'O-'],
    type: [String],
  })
  compatibleDonors: string[];

  @ApiProperty({
    description: 'Explanation of compatibility rules',
    example: 'A+ recipients can receive blood from A+, A-, O+, and O- donors',
  })
  explanation: string;
}

export class BloodComponentCompatibilityInfoDto extends BloodCompatibilityInfoDto {
  @ApiProperty({
    description: 'Blood component type',
    example: 'RBC',
  })
  componentType: string;

  @ApiProperty({
    description: 'Component-specific compatibility rules',
    example:
      'Red blood cells follow the same compatibility rules as whole blood transfusion',
  })
  componentRules: string;
}
