import { ClerkWebhookPayload } from '@/modules/customer/interfaces';

export interface IAuthService {
  syncAdminFromClerkWebhook(data: ClerkWebhookPayload): Promise<void>;
  synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void>;
}
