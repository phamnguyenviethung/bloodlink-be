import { ReminderType } from '@/database/entities/campaign.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Response DTO
export const reminderResponseSchema = z.object({
  id: z.string(),
  donor: z.object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
  message: z.string(),
  type: z.nativeEnum(ReminderType),
  metadata: z.record(z.any()),
  campaignDonation: z
    .object({
      id: z.string(),
      currentStatus: z.string(),
      campaign: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional(),
    })
    .optional()
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const reminderListResponseSchema = z.object({
  items: z.array(reminderResponseSchema),
  total: z.number(),
});

export class ReminderResponseDto extends createZodDto(reminderResponseSchema) {}
export class ReminderListResponseDto extends createZodDto(
  reminderListResponseSchema,
) {}

// Create Reminder DTO
export const createReminderSchema = z.object({
  donorId: z.string(),
  message: z.string(),
  type: z.nativeEnum(ReminderType),
  metadata: z.record(z.any()),
  campaignDonationId: z.string().optional(),
});

export class CreateReminderDto extends createZodDto(createReminderSchema) {}
export type CreateReminderDtoType = z.infer<typeof createReminderSchema>;

// Update Reminder DTO
export const updateReminderSchema = z.object({
  message: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export class UpdateReminderDto extends createZodDto(updateReminderSchema) {}
export type UpdateReminderDtoType = z.infer<typeof updateReminderSchema>;
