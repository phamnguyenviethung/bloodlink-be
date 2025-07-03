import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DonationResultTemplateItemType } from '@/database/entities/campaign.entity';

// DTO for template item option
export const templateItemOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
});

export type TemplateItemOptionDtoType = z.infer<
  typeof templateItemOptionSchema
>;
export class TemplateItemOptionDto extends createZodDto(
  templateItemOptionSchema,
) {}

// DTO for template item
export const templateItemSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(DonationResultTemplateItemType),
  label: z.string().min(1, 'Label is required'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  minLength: z.number().int().optional(),
  maxLength: z.number().int().optional(),
  isRequired: z.boolean().default(true),
  pattern: z.string().optional(),
  options: z.array(templateItemOptionSchema).optional(),
});

export type TemplateItemDtoType = z.infer<typeof templateItemSchema>;
export class TemplateItemDto extends createZodDto(templateItemSchema) {}

// Create DTO
export const createDonationResultTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  active: z.boolean().default(true),
  items: z.array(templateItemSchema),
});

export type CreateDonationResultTemplateDtoType = z.infer<
  typeof createDonationResultTemplateSchema
>;
export class CreateDonationResultTemplateDto extends createZodDto(
  createDonationResultTemplateSchema,
) {}

// Update DTO
export const updateDonationResultTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  items: z.array(templateItemSchema).optional(),
});

export type UpdateDonationResultTemplateDtoType = z.infer<
  typeof updateDonationResultTemplateSchema
>;
export class UpdateDonationResultTemplateDto extends createZodDto(
  updateDonationResultTemplateSchema,
) {}

// Response DTO
export const donationResultTemplateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
  updatedBy: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.nativeEnum(DonationResultTemplateItemType),
      label: z.string(),
      description: z.string().nullable(),
      placeholder: z.string().nullable(),
      defaultValue: z.string().nullable(),
      sortOrder: z.number(),
      minValue: z.number().nullable(),
      maxValue: z.number().nullable(),
      minLength: z.number().nullable(),
      maxLength: z.number().nullable(),
      isRequired: z.boolean(),
      pattern: z.string().nullable(),
      options: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
          }),
        )
        .nullable(),
    }),
  ),
});

export type DonationResultTemplateResponseDtoType = z.infer<
  typeof donationResultTemplateResponseSchema
>;
export class DonationResultTemplateResponseDto extends createZodDto(
  donationResultTemplateResponseSchema,
) {}

// Query DTO
export const donationResultTemplateQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  active: z
    .string()
    .optional()
    .transform((val) =>
      val === 'true' ? true : val === 'false' ? false : undefined,
    ),
  search: z.string().optional(),
});

export type DonationResultTemplateQueryDtoType = z.infer<
  typeof donationResultTemplateQuerySchema
>;
export class DonationResultTemplateQueryDto extends createZodDto(
  donationResultTemplateQuerySchema,
) {}
