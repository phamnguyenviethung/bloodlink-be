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

// Create option DTO
export const createTemplateItemOptionSchema = templateItemOptionSchema.omit({
  id: true,
});
export type CreateTemplateItemOptionDtoType = z.infer<
  typeof createTemplateItemOptionSchema
>;
export class CreateTemplateItemOptionDto extends createZodDto(
  createTemplateItemOptionSchema,
) {}

// Update option DTO
export const updateTemplateItemOptionSchema = templateItemOptionSchema
  .partial()
  .omit({ id: true });
export type UpdateTemplateItemOptionDtoType = z.infer<
  typeof updateTemplateItemOptionSchema
>;
export class UpdateTemplateItemOptionDto extends createZodDto(
  updateTemplateItemOptionSchema,
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

// Create item DTO
export const createTemplateItemSchema = templateItemSchema
  .omit({ id: true })
  .refine(
    (data) => {
      // Validate that SELECT and RADIO types have options
      if (
        (data.type === DonationResultTemplateItemType.SELECT ||
          data.type === DonationResultTemplateItemType.RADIO) &&
        (!data.options || data.options.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'SELECT and RADIO fields must have at least one option',
      path: ['options'],
    },
  )
  .refine(
    (data) => {
      // Validate that NUMBER type has valid min/max values if both are provided
      if (
        data.type === DonationResultTemplateItemType.NUMBER &&
        data.minValue !== undefined &&
        data.maxValue !== undefined &&
        data.minValue > data.maxValue
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'minValue must be less than or equal to maxValue',
      path: ['minValue'],
    },
  )
  .refine(
    (data) => {
      // Validate that TEXT and TEXTAREA types have valid minLength/maxLength if both are provided
      if (
        (data.type === DonationResultTemplateItemType.TEXT ||
          data.type === DonationResultTemplateItemType.TEXTAREA) &&
        data.minLength !== undefined &&
        data.maxLength !== undefined &&
        data.minLength > data.maxLength
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'minLength must be less than or equal to maxLength',
      path: ['minLength'],
    },
  );

export type CreateTemplateItemDtoType = z.infer<
  typeof createTemplateItemSchema
>;
export class CreateTemplateItemDto extends createZodDto(
  createTemplateItemSchema,
) {}

// Update item DTO
export const updateTemplateItemSchema = templateItemSchema
  .partial()
  .omit({ id: true })
  .refine(
    (data) => {
      // Validate that SELECT and RADIO types have options if type is provided
      if (
        data.type &&
        (data.type === DonationResultTemplateItemType.SELECT ||
          data.type === DonationResultTemplateItemType.RADIO) &&
        data.options !== undefined &&
        data.options.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'SELECT and RADIO fields must have at least one option',
      path: ['options'],
    },
  )
  .refine(
    (data) => {
      // Validate that NUMBER type has valid min/max values if both are provided
      if (
        data.minValue !== undefined &&
        data.maxValue !== undefined &&
        data.minValue > data.maxValue
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'minValue must be less than or equal to maxValue',
      path: ['minValue'],
    },
  )
  .refine(
    (data) => {
      // Validate that TEXT and TEXTAREA types have valid minLength/maxLength if both are provided
      if (
        data.minLength !== undefined &&
        data.maxLength !== undefined &&
        data.minLength > data.maxLength
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'minLength must be less than or equal to maxLength',
      path: ['minLength'],
    },
  );

export type UpdateTemplateItemDtoType = z.infer<
  typeof updateTemplateItemSchema
>;
export class UpdateTemplateItemDto extends createZodDto(
  updateTemplateItemSchema,
) {}

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

// Item Response DTO
export const templateItemResponseSchema = z.object({
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
  template: z.object({
    id: z.string(),
    name: z.string(),
  }),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      }),
    )
    .nullable(),
});

export type TemplateItemResponseDtoType = z.infer<
  typeof templateItemResponseSchema
>;
export class TemplateItemResponseDto extends createZodDto(
  templateItemResponseSchema,
) {}

// Option Response DTO
export const templateItemOptionResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  item: z.object({
    id: z.string(),
    label: z.string(),
  }),
});

export type TemplateItemOptionResponseDtoType = z.infer<
  typeof templateItemOptionResponseSchema
>;
export class TemplateItemOptionResponseDto extends createZodDto(
  templateItemOptionResponseSchema,
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
