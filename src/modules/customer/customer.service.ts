import { Customer } from '@/database/entities/Account.entity';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CustomerProfileDtoType,
  UpdateCustomerProfileDtoType,
} from './dtos/customer.dto';
import { ICustomerService } from './interfaces';

@Injectable()
export class CustomerService implements ICustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

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

  async updateCustomer(
    customerId: string,
    data: UpdateCustomerProfileDtoType,
  ): Promise<Customer> {
    const customer = await this.em.findOne(Customer, { id: customerId });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // await this.em.assign(customer, data);
    await this.em.flush();

    return customer;
  }
}
