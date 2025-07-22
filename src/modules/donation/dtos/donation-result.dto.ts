import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { DonationResultStatus } from '@/database/entities/campaign.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create/Update donation result schema
export const updateDonationResultSchema = z.object({
  volumeMl: z.number().min(0).describe('Blood volume in milliliters'),
  bloodType: z
    .string()
    .describe('Blood type string representation (e.g., "A+")'),
  bloodGroup: z.nativeEnum(BloodGroup).describe('Blood group (A, B, AB, O)'),
  bloodRh: z.nativeEnum(BloodRh).describe('Blood Rh factor (+ or -)'),
  notes: z.string().optional().describe('Additional notes about the results'),
  rejectReason: z
    .string()
    .optional()
    .describe('Reason for rejection if status is REJECTED'),
  status: z
    .nativeEnum(DonationResultStatus)
    .describe('Status of the donation result'),
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
  volumeMl: z.number().describe('Blood volume in milliliters'),
  bloodType: z
    .string()
    .describe('Blood type string representation (e.g., "A+")'),
  bloodGroup: z.nativeEnum(BloodGroup).describe('Blood group (A, B, AB, O)'),
  bloodRh: z.nativeEnum(BloodRh).describe('Blood Rh factor (+ or -)'),
  notes: z.string().optional(),
  rejectReason: z.string().optional(),
  status: z.nativeEnum(DonationResultStatus),
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
