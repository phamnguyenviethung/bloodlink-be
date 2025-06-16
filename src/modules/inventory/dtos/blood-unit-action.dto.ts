import { BloodUnitAction } from '@/database/entities/inventory.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create BloodUnitAction DTO
export const createBloodUnitActionSchema = z.object({
  bloodUnitId: z.string().uuid('Blood unit ID must be a valid UUID'),
  staffId: z.string().uuid('Staff ID must be a valid UUID'),
  action: z.nativeEnum(BloodUnitAction),
  description: z.string().optional(),
  previousValue: z.string().optional(),
  newValue: z.string().optional(),
});

export type CreateBloodUnitActionDtoType = z.infer<
  typeof createBloodUnitActionSchema
>;
export class CreateBloodUnitActionDto extends createZodDto(
  createBloodUnitActionSchema,
) {}

// BloodUnitAction Response DTO
export class BloodUnitActionResponseDto {
  @ApiProperty({ description: 'Blood unit action ID' })
  id: string;

  @ApiProperty({ description: 'Blood unit information' })
  bloodUnit: {
    id: string;
    bloodVolume: number;
    remainingVolume: number;
    status: string;
  };

  @ApiProperty({ description: 'Staff who performed the action' })
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };

  @ApiProperty({
    description: 'Type of action performed',
    enum: BloodUnitAction,
  })
  action: BloodUnitAction;

  @ApiPropertyOptional({ description: 'Description of the action' })
  description?: string;

  @ApiPropertyOptional({ description: 'Previous value before action' })
  previousValue?: string;

  @ApiPropertyOptional({ description: 'New value after action' })
  newValue?: string;

  @ApiProperty({ description: 'Action creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Action last update date' })
  updatedAt: Date;
}

// BloodUnitAction List Query DTO
export const bloodUnitActionListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 10)),
  action: z.nativeEnum(BloodUnitAction).optional(),
  bloodUnitId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
});

export type BloodUnitActionListQueryDtoType = z.infer<
  typeof bloodUnitActionListQuerySchema
>;
export class BloodUnitActionListQueryDto extends createZodDto(
  bloodUnitActionListQuerySchema,
) {}
