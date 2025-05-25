import {
  Account,
  AccountRole,
  Customer,
} from '@/database/entities/Account.entity';
import { EntityManager, MikroORM, Transactional } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CustomerProfileDtoType } from './dtos/customer.dto';
import { ClerkWebhookPayload, ICustomerService } from './interfaces';

@Injectable()
export class CustomerService implements ICustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  @Transactional()
  async synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(`Syncing customer ${data.data.id}`);

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

    this.logger.log(`Customer ${data.data.id} synced`);
  }

  private generateOrderCode(): string {
    const prefix = 'NT';
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${random}`;
  }

  async getMe(customerId: string): Promise<CustomerProfileDtoType> {
    const customer = await this.em.findOne(
      Customer,
      { id: customerId },
      { populate: ['account'] },
    );

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return customer;
  }
}
