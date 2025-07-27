import { CampaignDonationStatus } from '@/database/entities/campaign.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create donation request
export const createDonationRequestSchema = z.object({
  campaignId: z.string(),
  appointmentDate: z
    .string()
    .or(z.date())
    .optional()
    .describe(
      "Must be on the exact same day as the campaign's blood collection date (time can differ)",
    ),
  note: z.string().optional(),
  volumeMl: z
    .number()
    .int()
    .positive()
    .optional()
    .default(250)
    .describe('Desired blood donation volume in milliliters'),
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
  logs: z
    .array(
      z.object({
        id: z.string(),
        status: z.nativeEnum(CampaignDonationStatus),
        note: z.string().optional(),
        staff: z
          .object({
            id: z.string(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
          })
          .optional(),
        createdAt: z.date(),
      }),
    )
    .optional(),
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
  appointmentDate: z
    .string()
    .or(z.date())
    .optional()
    .describe(
      "Must be on the exact same day as the campaign's blood collection date (time can differ)",
    ),
  note: z.string().optional(),
  volumeMl: z
    .number()
    .min(200)
    .max(500)
    .optional()
    .describe('Blood volume in milliliters'),
});

export type UpdateDonationRequestStatusDtoType = z.infer<
  typeof updateDonationRequestStatusSchema
>;

export class UpdateDonationRequestStatusDto extends createZodDto(
  updateDonationRequestStatusSchema,
) {}

// List query
export const donationRequestListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  status: z.nativeEnum(CampaignDonationStatus).optional(),
  campaignId: z.string().optional(),
  donorId: z.string().optional(),
});

export type DonationRequestListQueryDtoType = z.infer<
  typeof donationRequestListQuerySchema
>;

export class DonationRequestListQueryDto extends createZodDto(
  donationRequestListQuerySchema,
) {}
