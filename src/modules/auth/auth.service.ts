import {
  Account,
  AccountRole,
  Admin,
  Customer,
} from '@/database/entities/Account.entity';
import { EntityManager, Transactional } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { ClerkWebhookPayload } from '../customer/interfaces';
import { IAuthService } from './interfaces';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly em: EntityManager) {}

  @Transactional()
  async syncAdminFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(
      `Syncing admin ${data.data.email_addresses[0].email_address}`,
    );

    const account = await this.em.upsert(Account, {
      id: data.data.id,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      email: data.data.email_addresses[0].email_address,
      role: AccountRole.ADMIN,
    });

    await this.em.upsert(Admin, {
      id: data.data.id,
      account,
    });

    this.logger.log(
      `Admin ${data.data.email_addresses[0].email_address} synced`,
    );
  }

  @Transactional()
  async synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(
      `Syncing customer ${data.data.email_addresses[0].email_address}`,
    );

    const account = await this.em.upsert(Account, {
      id: data.data.id,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      email: data.data.email_addresses[0].email_address,
      role: AccountRole.USER,
    });

    await this.em.upsert(Customer, {
      id: data.data.id,
      account,
    });

    this.logger.log(
      `Customer ${data.data.email_addresses[0].email_address} synced`,
    );
  }
}
