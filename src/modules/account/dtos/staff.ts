import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StaffRole } from '@/database/entities/Account.entity';

export const registerStaffSchema = z.object({
  email: z.string().email().nonempty().describe('Email của nhân viên'),
  firstName: z.string().min(2).describe('Tên của nhân viên'),
  lastName: z.string().min(2).describe('Họ của nhân viên'),
  role: z
    .nativeEnum(StaffRole)
    .optional()
    .default(StaffRole.DOCTOR)
    .describe('Vai trò của nhân viên'),
});

export type RegisterStaffDtoType = z.infer<typeof registerStaffSchema>;

export class RegisterStaffDto extends createZodDto(registerStaffSchema) {}
