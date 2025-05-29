import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AccountRole } from '@/database/entities/Account.entity';
import { Invitation } from '@clerk/backend/dist/api/resources/Invitation';
import { ApiProperty } from '@nestjs/swagger';
export const inviteSchmea = z.object({
  email: z.string().email().nonempty(),
  role: z.enum([AccountRole.HOSPITAL, AccountRole.STAFF]),
});

export type InviteReqDtoType = z.infer<typeof inviteSchmea>;

export class InviteReqDto extends createZodDto(inviteSchmea) {}

export const getInvitationsSchema = z.object({
  limit: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val >= 10 && val <= 500, {
      message: 'Limit must be between 10 and 500',
    })
    .default('10')
    .optional(),
  offset: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val >= 0, {
      message: 'Offset must be greater than 0',
    })
    .default('0')
    .optional(),
  status: z.enum(['pending', 'accepted', 'revoked']).optional(),
  role: z.enum([AccountRole.HOSPITAL, AccountRole.STAFF]),
});

export type GetInvitationReqDtoType = z.infer<typeof getInvitationsSchema>;

export class GetInvitationReqDto extends createZodDto(getInvitationsSchema) {}

export class GetInvitationResDto {
  @ApiProperty({
    type: [Object],
  })
  data: Invitation[];
  @ApiProperty({
    type: Number,
  })
  totalCount: number;
}
