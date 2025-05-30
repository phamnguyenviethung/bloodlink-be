import { ClerkWebhookPayload } from '@/modules/account/interfaces';

export interface IAuthService {
  syncAdminFromClerkWebhook(data: ClerkWebhookPayload): Promise<void>;
  synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void>;
}
