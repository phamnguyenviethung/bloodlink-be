import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CampaignStatus } from '@/database/entities/campaign.entity';

// Create Campaign DTO
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(CampaignStatus).optional(),
  banner: z.string().optional(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CampaignResponseDtoType = z.infer<typeof campaignResponseSchema>;
export class CampaignResponseDto extends createZodDto(campaignResponseSchema) {}

// Campaign List Query DTO
export const campaignListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  status: z.nativeEnum(CampaignStatus).optional(),
  search: z.string().optional(),
});

export type CampaignListQueryDtoType = z.infer<typeof campaignListQuerySchema>;
export class CampaignListQueryDto extends createZodDto(
  campaignListQuerySchema,
) {}
