import { Customer } from '@/database/entities/Account.entity';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CustomerProfileDtoType } from './dtos/customer.dto';
import { ICustomerService } from './interfaces';

@Injectable()
export class CustomerService implements ICustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

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
