import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import {
  BloodTypeComponent,
  EmergencyRequestStatus,
} from '@/database/entities/emergency-request.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Create Emergency Request DTO
export const createEmergencyRequestSchema = z.object({
  requiredVolume: z.number().min(1, 'Required volume must be at least 1ml'),
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  description: z.string().optional(),
  wardCode: z.string().optional(),
  districtCode: z.string().optional(),
  provinceCode: z.string().optional(),
  wardName: z.string().optional(),
  districtName: z.string().optional(),
  provinceName: z.string().optional(),
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
    default: BloodGroup.O,
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
    example: BloodTypeComponent.RED_CELLS,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiPropertyOptional({
    description: 'Description of the emergency request',
    example: 'Patient urgently needs blood transfusion for surgery',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ward code',
    example: '001',
  })
  wardCode?: string;

  @ApiPropertyOptional({
    description: 'District code',
    example: '001',
  })
  districtCode?: string;

  @ApiPropertyOptional({
    description: 'Province code',
    example: '79',
  })
  provinceCode?: string;

  @ApiPropertyOptional({
    description: 'Ward name',
    example: 'Ward 1',
  })
  wardName?: string;

  @ApiPropertyOptional({
    description: 'District name',
    example: 'District 1',
  })
  districtName?: string;

  @ApiPropertyOptional({
    description: 'Province name',
    example: 'Ho Chi Minh City',
  })
  provinceName?: string;

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
  description: z.string().optional(),
  rejectionReason: z.string().optional(),
  wardCode: z.string().optional(),
  districtCode: z.string().optional(),
  provinceCode: z.string().optional(),
  wardName: z.string().optional(),
  districtName: z.string().optional(),
  provinceName: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  staffId: z.string().optional(), // For audit trail
});

// User/Hospital Update Emergency Request DTO (limited fields)
export const userUpdateEmergencyRequestSchema = z.object({
  requiredVolume: z
    .number()
    .min(1, 'Required volume must be at least 1ml')
    .optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  bloodRh: z.nativeEnum(BloodRh).optional(),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  description: z.string().optional(),
  wardCode: z.string().optional(),
  districtCode: z.string().optional(),
  provinceCode: z.string().optional(),
  wardName: z.string().optional(),
  districtName: z.string().optional(),
  provinceName: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
});

export type UpdateEmergencyRequestDtoType = z.infer<
  typeof updateEmergencyRequestSchema
>;

export type UserUpdateEmergencyRequestDtoType = z.infer<
  typeof userUpdateEmergencyRequestSchema
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
    description: 'Description of the emergency request',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Reason for rejection (only used when status is REJECTED)',
  })
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Ward code',
  })
  wardCode?: string;

  @ApiPropertyOptional({
    description: 'District code',
  })
  districtCode?: string;

  @ApiPropertyOptional({
    description: 'Province code',
  })
  provinceCode?: string;

  @ApiPropertyOptional({
    description: 'Ward name',
  })
  wardName?: string;

  @ApiPropertyOptional({
    description: 'District name',
  })
  districtName?: string;

  @ApiPropertyOptional({
    description: 'Province name',
  })
  provinceName?: string;

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

export class UserUpdateEmergencyRequestDto extends createZodDto(
  userUpdateEmergencyRequestSchema,
) {
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
    description: 'Description of the emergency request',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ward code',
  })
  wardCode?: string;

  @ApiPropertyOptional({
    description: 'District code',
  })
  districtCode?: string;

  @ApiPropertyOptional({
    description: 'Province code',
  })
  provinceCode?: string;

  @ApiPropertyOptional({
    description: 'Ward name',
  })
  wardName?: string;

  @ApiPropertyOptional({
    description: 'District name',
  })
  districtName?: string;

  @ApiPropertyOptional({
    description: 'Province name',
  })
  provinceName?: string;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
  })
  longitude?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
  })
  latitude?: string;
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

  @ApiPropertyOptional({ description: 'Description of the emergency request' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Suggested contacts provided by staff',
    type: [Object],
    example: [
      {
        id: 'uuid-customer-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+84123456789',
        bloodType: {
          group: 'O',
          rh: 'POSITIVE',
        },
      },
    ],
  })
  suggestedContacts?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    bloodType: {
      group: string;
      rh: string;
    };
  }[];

  @ApiPropertyOptional({
    description: 'Reason for rejection if status is REJECTED',
  })
  rejectionReason?: string;

  @ApiProperty({ description: 'Emergency request start date' })
  startDate: Date;

  @ApiProperty({ description: 'Emergency request end date' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Ward code' })
  wardCode?: string;

  @ApiPropertyOptional({ description: 'District code' })
  districtCode?: string;

  @ApiPropertyOptional({ description: 'Province code' })
  provinceCode?: string;

  @ApiPropertyOptional({ description: 'Ward name' })
  wardName?: string;

  @ApiPropertyOptional({ description: 'District name' })
  districtName?: string;

  @ApiPropertyOptional({ description: 'Province name' })
  provinceName?: string;

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
) {}

// Reject Emergency Request DTO

export const rejectEmergencyRequestSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type RejectEmergencyRequestDtoType = z.infer<
  typeof rejectEmergencyRequestSchema
>;

export class RejectEmergencyRequestDto extends createZodDto(
  rejectEmergencyRequestSchema,
) {
  @ApiProperty({
    description: 'Reason for rejecting the emergency request',
    example: 'Blood type not available in inventory',
  })
  rejectionReason: string;
}

// Reject Emergency Requests by Blood Type DTO

export const rejectEmergencyRequestsByBloodTypeSchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  bloodTypeComponent: z.nativeEnum(BloodTypeComponent).optional(),
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type RejectEmergencyRequestsByBloodTypeDtoType = z.infer<
  typeof rejectEmergencyRequestsByBloodTypeSchema
>;

export class RejectEmergencyRequestsByBloodTypeDto extends createZodDto(
  rejectEmergencyRequestsByBloodTypeSchema,
) {
  @ApiProperty({
    description: 'Blood group to reject all requests for',
    enum: BloodGroup,
  })
  bloodGroup: BloodGroup;

  @ApiProperty({
    description: 'Blood Rh factor to reject all requests for',
    enum: BloodRh,
  })
  bloodRh: BloodRh;

  @ApiPropertyOptional({
    description: 'Blood component type to reject all requests for',
    enum: BloodTypeComponent,
  })
  bloodTypeComponent?: BloodTypeComponent;

  @ApiProperty({
    description:
      'Reason for rejecting all emergency requests of this blood type',
    example: 'Blood type O+ is currently out of stock',
  })
  rejectionReason: string;
}

// Approve Emergency Request DTO (Staff only)

export const approveEmergencyRequestSchema = z.object({
  bloodUnitId: z.string().min(1, 'Blood unit ID is required'),
  usedVolume: z.number().min(0, 'Used volume cannot be negative'),
});

export type ApproveEmergencyRequestDtoType = z.infer<
  typeof approveEmergencyRequestSchema
>;

export class ApproveEmergencyRequestDto extends createZodDto(
  approveEmergencyRequestSchema,
) {
  @ApiProperty({
    description: 'Blood unit ID to assign to the emergency request',
    example: 'uuid-blood-unit-id',
  })
  bloodUnitId: string;

  @ApiProperty({
    description: 'Volume of blood used in ml',
    example: 450,
    minimum: 0,
  })
  usedVolume: number;
}

// Provide Contacts DTO (Staff only)
export const provideContactsSchema = z.object({
  suggestedContacts: z
    .array(
      z.object({
        id: z.string().min(1, 'Contact ID is required'),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email('Valid email is required'),
        phone: z.string().optional(),
        bloodType: z.object({
          group: z.string().min(1, 'Blood group is required'),
          rh: z.string().min(1, 'Blood Rh is required'),
        }),
      }),
    )
    .min(1, 'At least one contact must be provided'),
});

export type ProvideContactsDtoType = z.infer<typeof provideContactsSchema>;

export class ProvideContactsDto extends createZodDto(provideContactsSchema) {
  @ApiProperty({
    description: 'List of suggested contacts for the user',
    type: [Object],
    example: [
      {
        id: 'uuid-customer-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+84123456789',
        bloodType: {
          group: 'O',
          rh: 'POSITIVE',
        },
      },
    ],
  })
  suggestedContacts: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    bloodType: {
      group: string;
      rh: string;
    };
  }[];
}
