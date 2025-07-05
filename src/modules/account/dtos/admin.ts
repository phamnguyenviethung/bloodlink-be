import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerAdminSchema = z.object({
  email: z.string().email().nonempty().describe('Email của quản trị viên'),
  firstName: z.string().min(2).describe('Tên của quản trị viên'),
  lastName: z.string().min(2).describe('Họ của quản trị viên'),
});

export type RegisterAdminDtoType = z.infer<typeof registerAdminSchema>;

export class RegisterAdminDto extends createZodDto(registerAdminSchema) {}
