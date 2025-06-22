import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const deleteCustomerAccountSchema = z.object({
  email: z.string(),
});

export type DeleteCustomerAccountReqDtoType = z.infer<
  typeof deleteCustomerAccountSchema
>;

export class DeleteCustomerAccountReqDto extends createZodDto(
  deleteCustomerAccountSchema,
) {}

export const syncAccountDataFromClerkSchema = z.object({
  email: z.string(),
});

export type SyncAccountDataFromClerkReqDtoType = z.infer<
  typeof syncAccountDataFromClerkSchema
>;

export class SyncAccountDataFromClerkReqDto extends createZodDto(
  syncAccountDataFromClerkSchema,
) {}
