import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StaffRole } from '@/database/entities/Account.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';

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
  bloodType: z
    .object({
      group: z.nativeEnum(BloodGroup),
      rh: z.nativeEnum(BloodRh),
    })
    .optional()
    .nullable(),
});

export type CustomerProfileDtoType = z.infer<typeof customerProfileSchema>;

export class CustomerProfileDto extends createZodDto(customerProfileSchema) {}

export const updateCustomerProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  wardCode: z.string().optional(),
  districtCode: z.string().optional(),
  provinceCode: z.string().optional(),
  wardName: z.string().optional(),
  districtName: z.string().optional(),
  provinceName: z.string().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  bloodRh: z.nativeEnum(BloodRh).optional(),
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

export const staffProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nonempty(),
  role: z.nativeEnum(StaffRole),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StaffProfileDtoType = z.infer<typeof staffProfileSchema>;

export class StaffProfileDto extends createZodDto(staffProfileSchema) {}

export const updateStaffProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(StaffRole).optional(),
});

export type UpdateStaffProfileDtoType = z.infer<
  typeof updateStaffProfileSchema
>;

export class UpdateStaffProfileDto extends createZodDto(
  updateStaffProfileSchema,
) {}

export const adminProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AdminProfileDtoType = z.infer<typeof adminProfileSchema>;

export class AdminProfileDto extends createZodDto(adminProfileSchema) {}

export const updateAdminProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type UpdateAdminProfileDtoType = z.infer<
  typeof updateAdminProfileSchema
>;

export class UpdateAdminProfileDto extends createZodDto(
  updateAdminProfileSchema,
) {}
