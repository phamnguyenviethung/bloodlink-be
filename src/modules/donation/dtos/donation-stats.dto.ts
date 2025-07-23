import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Base date range filter schema
export const dateRangeFilterSchema = z.object({
  startDate: z
    .string()
    .optional()
    .describe('Start date for filtering (format: YYYY-MM-DD)'),
  endDate: z
    .string()
    .optional()
    .describe('End date for filtering (format: YYYY-MM-DD)'),
});

export type DateRangeFilterDtoType = z.infer<typeof dateRangeFilterSchema>;

export class DateRangeFilterDto extends createZodDto(dateRangeFilterSchema) {
  @ApiProperty({
    description: 'Start date for filtering (format: YYYY-MM-DD)',
    required: false,
    example: '2023-01-01',
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (format: YYYY-MM-DD)',
    required: false,
    example: '2023-12-31',
  })
  endDate?: string;
}

// Response schemas for different statistics

// Overall donation statistics
export const overallDonationStatsSchema = z.object({
  totalDonations: z.number().describe('Total number of donation requests'),
  completedDonations: z.number().describe('Number of completed donations'),
  pendingDonations: z.number().describe('Number of pending donation requests'),
  cancelledDonations: z.number().describe('Number of cancelled donations'),
  rejectedDonations: z.number().describe('Number of rejected donations'),
  totalBloodVolume: z.number().describe('Total blood volume collected (ml)'),
  averageBloodVolume: z
    .number()
    .describe('Average blood volume per donation (ml)'),
  donationCompletionRate: z
    .number()
    .describe('Percentage of donations that were completed'),
  uniqueDonors: z.number().describe('Number of unique donors'),
});

export type OverallDonationStatsDtoType = z.infer<
  typeof overallDonationStatsSchema
>;

export class OverallDonationStatsDto extends createZodDto(
  overallDonationStatsSchema,
) {}

// Blood type distribution statistics
export const bloodTypeDistributionSchema = z.object({
  bloodTypes: z.array(
    z.object({
      bloodType: z.string().describe('Blood type (e.g., "A+", "O-")'),
      count: z.number().describe('Number of donations with this blood type'),
      percentage: z.number().describe('Percentage of total donations'),
      volumeMl: z
        .number()
        .describe('Total volume collected for this blood type (ml)'),
    }),
  ),
});

export type BloodTypeDistributionDtoType = z.infer<
  typeof bloodTypeDistributionSchema
>;

export class BloodTypeDistributionDto extends createZodDto(
  bloodTypeDistributionSchema,
) {}

// Monthly statistics
export const monthlyStatsSchema = z.object({
  months: z.array(
    z.object({
      month: z.string().describe('Month (format: YYYY-MM)'),
      totalDonations: z.number().describe('Total donations in this month'),
      completedDonations: z
        .number()
        .describe('Completed donations in this month'),
      totalVolumeMl: z
        .number()
        .describe('Total blood volume collected in this month (ml)'),
    }),
  ),
});

export type MonthlyStatsDtoType = z.infer<typeof monthlyStatsSchema>;

export class MonthlyStatsDto extends createZodDto(monthlyStatsSchema) {}

// Campaign statistics
export const campaignStatsSchema = z.object({
  campaigns: z.array(
    z.object({
      id: z.string().describe('Campaign ID'),
      name: z.string().describe('Campaign name'),
      totalDonations: z
        .number()
        .describe('Total donation requests for this campaign'),
      completedDonations: z
        .number()
        .describe('Completed donations for this campaign'),
      totalVolumeMl: z
        .number()
        .describe('Total blood volume collected in this campaign (ml)'),
      completionRate: z.number().describe('Percentage of completed donations'),
    }),
  ),
});

export type CampaignStatsDtoType = z.infer<typeof campaignStatsSchema>;

export class CampaignStatsDto extends createZodDto(campaignStatsSchema) {}

// Donor statistics
export const donorStatsSchema = z.object({
  topDonors: z.array(
    z.object({
      donorId: z.string().describe('Donor ID'),
      firstName: z.string().nullable().describe('Donor first name'),
      lastName: z.string().nullable().describe('Donor last name'),
      donationCount: z.number().describe('Number of completed donations'),
      totalVolumeMl: z.number().describe('Total blood volume donated (ml)'),
      lastDonationDate: z.string().nullable().describe('Date of last donation'),
    }),
  ),
  newDonors: z.number().describe('Number of new donors in the period'),
  returningDonors: z
    .number()
    .describe('Number of returning donors in the period'),
});

export type DonorStatsDtoType = z.infer<typeof donorStatsSchema>;

export class DonorStatsDto extends createZodDto(donorStatsSchema) {}

// Dashboard summary statistics
export const dashboardSummarySchema = z.object({
  totalDonations: z.number().describe('Total number of donation requests'),
  completedDonations: z.number().describe('Number of completed donations'),
  totalBloodVolume: z.number().describe('Total blood volume collected (ml)'),
  uniqueDonors: z.number().describe('Number of unique donors'),
  recentCampaigns: z
    .array(
      z.object({
        id: z.string().describe('Campaign ID'),
        name: z.string().describe('Campaign name'),
        completedDonations: z.number().describe('Completed donations'),
        totalVolumeMl: z.number().describe('Total blood volume collected (ml)'),
      }),
    )
    .max(5)
    .describe('5 most recent campaigns'),
  bloodTypeDistribution: z.array(
    z.object({
      bloodType: z.string().describe('Blood type'),
      percentage: z.number().describe('Percentage of total donations'),
    }),
  ),
  monthlyTrend: z
    .array(
      z.object({
        month: z.string().describe('Month (format: YYYY-MM)'),
        donations: z.number().describe('Number of donations'),
      }),
    )
    .max(6)
    .describe('Donation trend for the last 6 months'),
});

export type DashboardSummaryDtoType = z.infer<typeof dashboardSummarySchema>;

export class DashboardSummaryDto extends createZodDto(dashboardSummarySchema) {}
