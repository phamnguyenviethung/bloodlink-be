import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const customerProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomerProfileDtoType = z.infer<typeof customerProfileSchema>;

export class CustomerProfileDto extends createZodDto(customerProfileSchema) {}
