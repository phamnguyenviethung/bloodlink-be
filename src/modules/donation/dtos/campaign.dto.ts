import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  CampaignDonationStatus,
  CampaignStatus,
} from '@/database/entities/campaign.entity';

// Create Campaign DTO
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(CampaignStatus).optional(),
  banner: z.string().optional(),
  location: z.string().optional(),
  limitDonation: z.number().int().nonnegative().optional(),
});

export type CreateCampaignDtoType = z.infer<typeof createCampaignSchema>;
export class CreateCampaignDto extends createZodDto(createCampaignSchema) {}

// Update Campaign DTO
export const updateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').optional(),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  banner: z.string().optional(),
  location: z.string().optional(),
  limitDonation: z.number().int().nonnegative().optional(),
});

export type UpdateCampaignDtoType = z.infer<typeof updateCampaignSchema>;
export class UpdateCampaignDto extends createZodDto(updateCampaignSchema) {}

// Campaign Response DTO
export const campaignResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(CampaignStatus),
  banner: z.string().nullable(),
  location: z.string().nullable(),
  limitDonation: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CampaignResponseDtoType = z.infer<typeof campaignResponseSchema>;
export class CampaignResponseDto extends createZodDto(campaignResponseSchema) {}

// Campaign List Query DTO
export const campaignListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.nativeEnum(CampaignStatus).optional(),
  search: z.string().optional(),
});

export type CampaignListQueryDtoType = z.infer<typeof campaignListQuerySchema>;
export class CampaignListQueryDto extends createZodDto(
  campaignListQuerySchema,
) {}

// Campaign Donation Requests Query DTO
export const campaignDonationRequestsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.nativeEnum(CampaignDonationStatus).optional(),
});

export type CampaignDonationRequestsQueryDtoType = z.infer<
  typeof campaignDonationRequestsQuerySchema
>;
export class CampaignDonationRequestsQueryDto extends createZodDto(
  campaignDonationRequestsQuerySchema,
) {}
