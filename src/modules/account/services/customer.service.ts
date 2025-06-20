import { Customer } from '@/database/entities/Account.entity';
import { BloodType } from '@/database/entities/Blood.entity';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateCustomerProfileDtoType } from '../dtos';
import { ICustomerService } from '../interfaces';
import { ClerkClient } from '@clerk/backend';
import { ClerkClientType } from '@/share/providers/clerk.provider';

@Injectable()
export class CustomerService implements ICustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.CLIENT)
    private readonly clerkClient: ClerkClient,
  ) {}

  async getMe(customerId: string): Promise<any> {
    const customer = await this.em.findOne(
      Customer,
      { id: customerId },
      {
        populate: ['account', 'bloodType'],
      },
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
    const customer = await this.em.findOne(
      Customer,
      {
        id: customerId,
      },
      { populate: ['account', 'bloodType'] },
    );
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }    // Extract blood type data
    const { bloodGroup, bloodRh, ...profileData } = data;

    // Update profile data (including gender, dateOfBirth, citizenId)
    wrap(customer).assign(profileData);

    // Update blood type if provided
    if (bloodGroup && bloodRh) {
      const bloodType = await this.em.findOne(BloodType, {
        group: bloodGroup,
        rh: bloodRh,
      });

      if (!bloodType) {
        // Create new blood type if it doesn't exist
        const newBloodType = this.em.create(BloodType, {
          group: bloodGroup,
          rh: bloodRh,
        });
        customer.bloodType = newBloodType;
      } else {
        customer.bloodType = bloodType;
      }
    }

    await this.em.flush();

    try {
      await this.clerkClient.users.updateUser(customer.account.id, {
        firstName: customer.firstName,
        lastName: customer.lastName,
      });
    } catch (error) {
      this.logger.error(
        `Error updating customer ${customer.account.id} in clerk`,
      );
      this.logger.error(error);
    }

    return customer;
  }
}
