import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const findCustomersByLocationSchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  bloodRh: z.nativeEnum(BloodRh),
  radius: z.number().positive().describe('Search radius in kilometers'),
  latitude: z.string().describe('Latitude of the center point'),
  longitude: z.string().describe('Longitude of the center point'),
  includeAddress: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include address information in results'),
});

export class FindCustomersByLocationDto extends createZodDto(
  findCustomersByLocationSchema,
) {}

export type FindCustomersByLocationDtoType = z.infer<
  typeof findCustomersByLocationSchema
>;
