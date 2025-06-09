import { CampaignDonationStatus } from '@/database/entities/campaign.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create donation request
export const createDonationRequestSchema = z.object({
  campaignId: z.string(),
  appointmentDate: z.string().or(z.date()).optional(),
  note: z.string().optional(),
});

export type CreateDonationRequestDtoType = z.infer<
  typeof createDonationRequestSchema
>;

export class CreateDonationRequestDto extends createZodDto(
  createDonationRequestSchema,
) {}

// Response DTO
export const donationRequestResponseSchema = z.object({
  id: z.string(),
  donor: z.object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
  campaign: z.object({
    id: z.string(),
    name: z.string(),
  }),
  amount: z.number().optional(),
  note: z.string().optional(),
  appointmentDate: z.date().optional(),
  currentStatus: z.nativeEnum(CampaignDonationStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DonationRequestResponseDtoType = z.infer<
  typeof donationRequestResponseSchema
>;

export class DonationRequestResponseDto extends createZodDto(
  donationRequestResponseSchema,
) {}

// Update donation request status
export const updateDonationRequestStatusSchema = z.object({
  status: z.nativeEnum(CampaignDonationStatus),
  appointmentDate: z.string().or(z.date()).optional(),
  note: z.string().optional(),
});

export type UpdateDonationRequestStatusDtoType = z.infer<
  typeof updateDonationRequestStatusSchema
>;

export class UpdateDonationRequestStatusDto extends createZodDto(
  updateDonationRequestStatusSchema,
) {}

// List query
export const donationRequestListQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  status: z.nativeEnum(CampaignDonationStatus).optional(),
});

export type DonationRequestListQueryDtoType = z.infer<
  typeof donationRequestListQuerySchema
>;

export class DonationRequestListQueryDto extends createZodDto(
  donationRequestListQuerySchema,
) {}
