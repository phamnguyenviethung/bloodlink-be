import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create/Update donation result schema
export const updateDonationResultSchema = z.object({
  bloodTestResults: z
    .record(z.any())
    .optional()
    .describe('JSON object containing blood test results'),
  notes: z.string().optional().describe('Additional notes about the results'),
});

export type UpdateDonationResultDtoType = z.infer<
  typeof updateDonationResultSchema
>;

export class UpdateDonationResultDto extends createZodDto(
  updateDonationResultSchema,
) {}

// Donation result response schema
export const donationResultResponseSchema = z.object({
  id: z.string(),
  campaignDonation: z.object({
    id: z.string(),
    currentStatus: z.string(),
    donor: z
      .object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
      .optional(),
  }),
  bloodTestResults: z.record(z.any()).optional(),
  resultDate: z.date().optional(),
  notes: z.string().optional(),
  processedBy: z
    .object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DonationResultResponseDtoType = z.infer<
  typeof donationResultResponseSchema
>;

export class DonationResultResponseDto extends createZodDto(
  donationResultResponseSchema,
) {}
