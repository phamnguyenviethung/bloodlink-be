import { EmergencyRequestLogStatus } from '@/database/entities/emergency-request.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Emergency Request Log Response DTO
export class EmergencyRequestLogResponseDto {
  @ApiProperty({ description: 'Log entry ID' })
  id: string;

  @ApiProperty({ description: 'Emergency request ID' })
  emergencyRequest: {
    id: string;
    status: string;
    address: string;
  };

  @ApiProperty({ description: 'Staff who performed the action' })
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };

  @ApiProperty({
    description: 'Log status/action type',
    enum: EmergencyRequestLogStatus,
  })
  status: EmergencyRequestLogStatus;

  @ApiPropertyOptional({ description: 'Optional note/description' })
  note?: string;

  @ApiPropertyOptional({ description: 'Previous value before change' })
  previousValue?: string;

  @ApiPropertyOptional({ description: 'New value after change' })
  newValue?: string;

  @ApiProperty({ description: 'When the action was performed' })
  createdAt: Date;
}

// Query DTO for Emergency Request Log list
export const emergencyRequestLogListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 10)),
  emergencyRequestId: z.string().optional(),
  staffId: z.string().optional(),
  status: z.nativeEnum(EmergencyRequestLogStatus).optional(),
});

export type EmergencyRequestLogListQueryDtoType = z.infer<
  typeof emergencyRequestLogListQuerySchema
>;

export class EmergencyRequestLogListQueryDto extends createZodDto(
  emergencyRequestLogListQuerySchema,
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
    description: 'Filter by emergency request ID',
  })
  emergencyRequestId?: string;

  @ApiPropertyOptional({
    description: 'Filter by staff ID',
  })
  staffId?: string;

  @ApiPropertyOptional({
    description: 'Filter by log status/action type',
    enum: EmergencyRequestLogStatus,
  })
  status?: EmergencyRequestLogStatus;
}
