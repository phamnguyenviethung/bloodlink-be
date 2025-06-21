import {
  EmergencyRequestStatus,
  BloodTypeComponent,
} from '@/database/entities/emergency-request.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create Emergency Request DTO
export const createEmergencyRequestSchema = z.object({
  requiredVolume: z.number().min(1, 'Required volume must be at least 1ml'),
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  address: z.string().nonempty('Address is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
});

export type CreateEmergencyRequestDtoType = z.infer<
  typeof createEmergencyRequestSchema
>;

export class CreateEmergencyRequestDto extends createZodDto(
  createEmergencyRequestSchema,
) {
  @ApiProperty({
    description: 'Required volume in ml',
    example: 450,
    minimum: 1,
  })
  requiredVolume: number;

  @ApiProperty({
    description: 'Blood group required',
    enum: BloodGroup,
    example: BloodGroup.O,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    description: 'Blood Rh factor required',
    enum: BloodRh,
    example: BloodRh.POSITIVE,
  })
  bloodRh: BloodRh;
  @ApiPropertyOptional({
    description: 'Blood component type required',
    enum: BloodTypeComponent,
    example: BloodTypeComponent.RBC,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiProperty({
    description: 'Emergency location address',
    example: '123 Hospital Street, District 1, Ho Chi Minh City',
  })
  address: string;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: '106.6297',
  })
  longitude?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: '10.8231',
  })
  latitude?: string;
}

// Update Emergency Request DTO
export const updateEmergencyRequestSchema = z.object({
  bloodUnitId: z.string().optional(),
  usedVolume: z.number().min(0, 'Used volume cannot be negative').optional(),
  requiredVolume: z
    .number()
    .min(1, 'Required volume must be at least 1ml')
    .optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  bloodRh: z.nativeEnum(BloodRh).optional(),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  status: z.nativeEnum(EmergencyRequestStatus).optional(),
  address: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  staffId: z.string().optional(), // For audit trail
});

export type UpdateEmergencyRequestDtoType = z.infer<
  typeof updateEmergencyRequestSchema
>;

export class UpdateEmergencyRequestDto extends createZodDto(
  updateEmergencyRequestSchema,
) {
  @ApiPropertyOptional({ description: 'Blood unit ID that is being requested' })
  bloodUnitId?: string;

  @ApiPropertyOptional({
    description: 'Used volume in ml',
    example: 200,
    minimum: 0,
  })
  usedVolume?: number;

  @ApiPropertyOptional({
    description: 'Required volume in ml',
    example: 450,
    minimum: 1,
  })
  requiredVolume?: number;

  @ApiPropertyOptional({
    description: 'Blood group required',
    enum: BloodGroup,
  })
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({
    description: 'Blood Rh factor required',
    enum: BloodRh,
  })
  bloodRh?: BloodRh;

  @ApiPropertyOptional({
    description: 'Blood component type required',
    enum: BloodTypeComponent,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiPropertyOptional({
    description: 'Emergency request status',
    enum: EmergencyRequestStatus,
  })
  status?: EmergencyRequestStatus;

  @ApiPropertyOptional({
    description: 'Emergency location address',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
  })
  longitude?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
  })
  latitude?: string;

  @ApiPropertyOptional({
    description: 'Staff ID for audit trail (automatically injected)',
  })
  staffId?: string;
}

// Emergency Request Response DTO
export class EmergencyRequestResponseDto {
  @ApiProperty({ description: 'Emergency request ID' })
  id: string;

  @ApiProperty({ description: 'Account who requested' })
  requestedBy: {
    id: string;
    email: string;
    role: string;
  };
  @ApiPropertyOptional({ description: 'Blood unit information' })
  bloodUnit?: {
    id: string;
    bloodVolume: number;
    remainingVolume: number;
    status: string;
  };

  @ApiProperty({ description: 'Used volume in ml' })
  usedVolume: number;

  @ApiProperty({ description: 'Required volume in ml' })
  requiredVolume: number;

  @ApiProperty({ description: 'Blood type information' })
  bloodType: {
    id: string;
    group: string;
    rh: string;
  };
  @ApiPropertyOptional({
    description: 'Blood component type',
    enum: BloodTypeComponent,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiProperty({
    description: 'Emergency request status',
    enum: EmergencyRequestStatus,
  })
  status: EmergencyRequestStatus;

  @ApiProperty({ description: 'Emergency location address' })
  address: string;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  longitude?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  latitude?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Query DTO for list
export const emergencyRequestListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 10)),
  status: z.nativeEnum(EmergencyRequestStatus).optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  bloodRh: z.nativeEnum(BloodRh).optional(),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  requestedBy: z.string().optional(),
});

export type EmergencyRequestListQueryDtoType = z.infer<
  typeof emergencyRequestListQuerySchema
>;

export class EmergencyRequestListQueryDto extends createZodDto(
  emergencyRequestListQuerySchema,
) {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: EmergencyRequestStatus,
  })
  status?: EmergencyRequestStatus;

  @ApiPropertyOptional({
    description: 'Filter by blood group',
    enum: BloodGroup,
  })
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({
    description: 'Filter by blood Rh',
    enum: BloodRh,
  })
  bloodRh?: BloodRh;

  @ApiPropertyOptional({
    description: 'Filter by blood component type',
    enum: BloodTypeComponent,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiPropertyOptional({
    description: 'Filter by requester ID',
  })
  requestedBy?: string;
}
