import { BloodUnitStatus } from '@/database/entities/inventory.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create BloodUnit DTO
export const createBloodUnitSchema = z.object({
  memberId: z.string().nonempty('Member ID is required'),
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodVolume: z.number().min(1, 'Blood volume must be at least 1ml'),
  remainingVolume: z.number().min(0, 'Remaining volume cannot be negative'),
  expiredDate: z.string().or(z.date()),
  status: z.nativeEnum(BloodUnitStatus).optional(),
});

export type CreateBloodUnitDtoType = z.infer<typeof createBloodUnitSchema>;
export class CreateBloodUnitDto extends createZodDto(createBloodUnitSchema) {
  @ApiProperty({ description: 'Customer ID who donated the blood' })
  memberId: string;

  @ApiProperty({
    description: 'Blood group',
    enum: BloodGroup,
    example: BloodGroup.O,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    description: 'Blood Rh factor',
    enum: BloodRh,
    example: BloodRh.POSITIVE,
  })
  bloodRh: BloodRh;

  @ApiProperty({ description: 'Blood volume in ml', example: 450 })
  bloodVolume: number;

  @ApiProperty({ description: 'Remaining volume in ml', example: 450 })
  remainingVolume: number;

  @ApiProperty({ description: 'Expiration date of the blood unit' })
  expiredDate: string | Date;

  @ApiPropertyOptional({
    description: 'Initial status of the blood unit',
    enum: BloodUnitStatus,
    default: BloodUnitStatus.AVAILABLE,
  })
  status?: BloodUnitStatus;
}

// Update BloodUnit DTO
export const updateBloodUnitSchema = z.object({
  bloodVolume: z
    .number()
    .min(1, 'Blood volume must be at least 1ml')
    .optional(),
  remainingVolume: z
    .number()
    .min(0, 'Remaining volume cannot be negative')
    .optional(),
  expiredDate: z.string().or(z.date()).optional(),
  status: z.nativeEnum(BloodUnitStatus).optional(),
  staffId: z.string().optional(),
});

export type UpdateBloodUnitDtoType = z.infer<typeof updateBloodUnitSchema>;
export class UpdateBloodUnitDto extends createZodDto(updateBloodUnitSchema) {
  @ApiPropertyOptional({ description: 'Blood volume in ml', example: 450 })
  bloodVolume?: number;

  @ApiPropertyOptional({ description: 'Remaining volume in ml', example: 400 })
  remainingVolume?: number;

  @ApiPropertyOptional({ description: 'Expiration date of the blood unit' })
  expiredDate?: string | Date;

  @ApiPropertyOptional({
    description: 'Status of the blood unit',
    enum: BloodUnitStatus,
  })
  status?: BloodUnitStatus;

  @ApiPropertyOptional({ description: 'ID of staff making the update' })
  staffId?: string;
}

// BloodUnit Response DTO
export class BloodUnitResponseDto {
  @ApiProperty({ description: 'Blood unit ID' })
  id: string;
  @ApiProperty({
    description: 'Customer who donated the blood',
    example: {
      id: 'customer-uuid',
      firstName: 'John',
      lastName: 'Doe',
    },
  })
  member: {
    id: string;
    firstName: string;
    lastName: string;
  };
  @ApiProperty({
    description: 'Blood type information',
    example: {
      group: 'O',
      rh: '+',
    },
  })
  bloodType: {
    group: string;
    rh: string;
  };

  @ApiProperty({ description: 'Blood volume in ml', example: 450 })
  bloodVolume: number;

  @ApiProperty({ description: 'Remaining volume in ml', example: 400 })
  remainingVolume: number;

  @ApiProperty({ description: 'Expiration date' })
  expiredDate: Date;

  @ApiProperty({ description: 'Current status', enum: BloodUnitStatus })
  status: BloodUnitStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// BloodUnit List Query DTO
export const bloodUnitListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 10)),
  status: z.nativeEnum(BloodUnitStatus).optional(),
  bloodType: z.string().optional(),
  expired: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export type BloodUnitListQueryDtoType = z.infer<
  typeof bloodUnitListQuerySchema
>;
export class BloodUnitListQueryDto extends createZodDto(
  bloodUnitListQuerySchema,
) {}
