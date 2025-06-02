import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const customerProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date(),
  phone: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  ward_code: z.string().optional(),
  district_code: z.string().optional(),
  province_code: z.string().optional(),
});

export type CustomerProfileDtoType = z.infer<typeof customerProfileSchema>;

export class CustomerProfileDto extends createZodDto(customerProfileSchema) {}

export const updateCustomerProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  ward_code: z.string().optional(),
  district_code: z.string().optional(),
  province_code: z.string().optional(),
  ward_name: z.string().optional(),
  district_name: z.string().optional(),
  province_name: z.string().optional(),
});

export type UpdateCustomerProfileDtoType = z.infer<
  typeof updateCustomerProfileSchema
>;
export class UpdateCustomerProfileDto extends createZodDto(
  updateCustomerProfileSchema,
) {}

export const updateHospitalProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  ward_code: z.string().optional(),
  district_code: z.string().optional(),
  province_code: z.string().optional(),
  ward_name: z.string().optional(),
  district_name: z.string().optional(),
  province_name: z.string().optional(),
});

export type UpdateHospitalProfileDtoType = z.infer<
  typeof updateHospitalProfileSchema
>;

export class UpdateHospitalProfileDto extends createZodDto(
  updateHospitalProfileSchema,
) {}
