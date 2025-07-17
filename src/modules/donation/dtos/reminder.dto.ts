import { ReminderStatus } from '@/database/entities/campaign.entity';
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
  status: z.nativeEnum(ReminderStatus),
  scheduledDate: z.date(),
  sentDate: z.date().optional().nullable(),
  message: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  campaignDonation: z
    .object({
      id: z.string(),
      currentStatus: z.string(),
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
  scheduledDate: z.string().or(z.date()),
  message: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  campaignDonationId: z.string().optional(),
});

export class CreateReminderDto extends createZodDto(createReminderSchema) {}
export type CreateReminderDtoType = z.infer<typeof createReminderSchema>;

// Update Reminder DTO
export const updateReminderSchema = z.object({
  status: z.nativeEnum(ReminderStatus).optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  message: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export class UpdateReminderDto extends createZodDto(updateReminderSchema) {}
export type UpdateReminderDtoType = z.infer<typeof updateReminderSchema>;
