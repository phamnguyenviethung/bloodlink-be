import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const locationResSchema = z.object({
  isError: z.boolean(),
  message: z.string(),
  result: z.union([z.array(z.any()), z.record(z.any())]).nullable(),
});

export type LocationResDtoType = z.infer<typeof locationResSchema>;
export class LocationResDto extends createZodDto(locationResSchema) {}
