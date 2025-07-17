import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import {
  BloodComponentType,
  BloodGroup,
  BloodRh,
} from "@/database/entities/Blood.entity";
import { BloodUnitStatus } from "@/database/entities/inventory.entity";
import { ApiProperty } from "@nestjs/swagger";

// Create Whole Blood Unit DTO
export const createWholeBloodUnitSchema = z.object({
  memberId: z.string().nonempty('Member ID is required'),
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodVolume: z.number().min(1, 'Blood volume must be at least 1ml'),
  remainingVolume: z.number().min(0, 'Remaining volume cannot be negative'),
  expiredDate: z.string().or(z.date()),
});

export type CreateWholeBloodUnitDtoType = z.infer<
  typeof createWholeBloodUnitSchema
>;
export class CreateWholeBloodUnitDto extends createZodDto(
  createWholeBloodUnitSchema,
) {}

// Separate Blood Components DTO
export const separateBloodComponentsSchema = z.object({
  wholeBloodUnitId: z.string().nonempty('Whole blood unit ID is required'),
  redCellsVolume: z.number().min(1, 'Red cells volume must be at least 1ml'),
  plasmaVolume: z.number().min(1, 'Plasma volume must be at least 1ml'),
  plateletsVolume: z.number().min(1, 'Platelets volume must be at least 1ml'),
  expiredDate: z.string().or(z.date()),
});

export type SeparateBloodComponentsDtoType = z.infer<
  typeof separateBloodComponentsSchema
>;
export class SeparateBloodComponentsDto extends createZodDto(
  separateBloodComponentsSchema,
) {}

// Keep the old DTO for backward compatibility (deprecated)
export const createBloodUnitSchema = z.object({
  memberId: z.string().nonempty('Member ID is required'),
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodVolume: z.number().min(1, 'Blood volume must be at least 1ml'),
  bloodComponentType: z.nativeEnum(BloodComponentType),
  remainingVolume: z.number().min(0, 'Remaining volume cannot be negative'),
  expiredDate: z.string().or(z.date()),
});

export type CreateBloodUnitDtoType = z.infer<typeof createBloodUnitSchema>;
export class CreateBloodUnitDto extends createZodDto(createBloodUnitSchema) {}

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
export class UpdateBloodUnitDto extends createZodDto(updateBloodUnitSchema) {}

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

  @ApiProperty({
    description: 'Blood component type',
    enum: BloodComponentType,
  })
  bloodComponentType: BloodComponentType;

  @ApiProperty({ description: 'Remaining volume in ml', example: 400 })
  remainingVolume: number;

  @ApiProperty({
    description: 'Whether blood unit is separated',
    example: false,
  })
  isSeparated: boolean;

  @ApiProperty({ description: 'Parent whole blood unit ID', required: false })
  parentWholeBlood?: string;

  @ApiProperty({ description: 'Expiration date' })
  expiredDate: Date;

  @ApiProperty({ description: 'Current status', enum: BloodUnitStatus })
  status: BloodUnitStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Separate Blood Components Response DTO
export class SeparateBloodComponentsResponseDto {
  @ApiProperty({
    description: 'Updated whole blood unit',
    type: BloodUnitResponseDto,
  })
  wholeBloodUnit: BloodUnitResponseDto;

  @ApiProperty({
    description: 'Created red cells unit',
    type: BloodUnitResponseDto,
  })
  redCellsUnit: BloodUnitResponseDto;

  @ApiProperty({
    description: 'Created plasma unit',
    type: BloodUnitResponseDto,
  })
  plasmaUnit: BloodUnitResponseDto;

  @ApiProperty({
    description: 'Created platelets unit',
    type: BloodUnitResponseDto,
  })
  plateletsUnit: BloodUnitResponseDto;
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
