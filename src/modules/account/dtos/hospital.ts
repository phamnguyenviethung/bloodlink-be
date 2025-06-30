import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerHospitalSchema = z.object({
  email: z.string().email().nonempty().describe('Email của bệnh viện'),
  name: z.string().min(3).describe('Tên của bệnh viện'),
  phone: z.string().optional().describe('Số điện thoại của bệnh viện'),
  longitude: z.string().optional().describe('Kinh độ'),
  latitude: z.string().optional().describe('Vĩ độ'),
  wardCode: z.string().optional().describe('Mã phường/xã'),
  districtCode: z.string().optional().describe('Mã quận/huyện'),
  provinceCode: z.string().optional().describe('Mã tỉnh/thành'),
  wardName: z.string().optional().describe('Tên phường/xã'),
  districtName: z.string().optional().describe('Tên quận/huyện'),
  provinceName: z.string().optional().describe('Tên tỉnh/thành'),
});

export type RegisterHospitalDtoType = z.infer<typeof registerHospitalSchema>;

export class RegisterHospitalDto extends createZodDto(registerHospitalSchema) {}

export const hospitalProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().nonempty(),
  phone: z.string().nullable(),
  longitude: z.string().nullable(),
  latitude: z.string().nullable(),
  wardCode: z.string().nullable(),
  districtCode: z.string().nullable(),
  provinceCode: z.string().nullable(),
  wardName: z.string().nullable(),
  districtName: z.string().nullable(),
  provinceName: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type HospitalProfileDtoType = z.infer<typeof hospitalProfileSchema>;

export class HospitalProfileDto extends createZodDto(hospitalProfileSchema) {}
