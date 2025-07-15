import { Customer } from '@/database/entities/Account.entity';
import {
  BloodType,
  BloodGroup,
  BloodRh,
} from '@/database/entities/Blood.entity';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateCustomerProfileDtoType,
  FindCustomersByBloodTypeDtoType,
} from '../dtos';
import { ICustomerService } from '../interfaces';
import { ClerkClient } from '@clerk/backend';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import * as geolib from 'geolib';

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
    } // Extract blood type data
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

  async findCustomersByBloodTypeWithinRadius(
    customerId: string,
    params: FindCustomersByBloodTypeDtoType,
  ): Promise<{ customers: Customer[]; count: number }> {
    const { bloodGroup, bloodRh, radius } = params;

    // Ensure radius is a number
    const radiusValue =
      typeof radius === 'string' ? parseFloat(radius) : radius;

    if (isNaN(radiusValue)) {
      throw new BadRequestException('Invalid radius value');
    }

    // Get current user's location
    const currentCustomer = await this.em.findOne(
      Customer,
      { id: customerId },
      { populate: ['account', 'bloodType'] },
    );

    if (!currentCustomer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Check if the user has location data
    if (!currentCustomer.latitude || !currentCustomer.longitude) {
      throw new BadRequestException(
        'Your profile does not have location data. Please update your profile with your location first.',
      );
    }

    const latitude = currentCustomer.latitude;
    const longitude = currentCustomer.longitude;

    // Convert string values to enum values
    const bloodGroupEnum = bloodGroup as unknown as BloodGroup;
    const bloodRhEnum = bloodRh as unknown as BloodRh;

    // Find the blood type entity
    const bloodType = await this.em.findOne(BloodType, {
      group: bloodGroupEnum,
      rh: bloodRhEnum,
    });

    if (!bloodType) {
      return { customers: [], count: 0 };
    }

    // Get all customers with the specified blood type
    const customersWithBloodType = await this.em.find(
      Customer,
      { bloodType },
      { populate: ['account', 'bloodType'] },
    );

    // Filter customers by distance
    const sourcePosition = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const customersWithinRadius = customersWithBloodType.filter((customer) => {
      // Skip current user and customers without location data
      if (
        customer.id === customerId ||
        !customer.latitude ||
        !customer.longitude
      ) {
        return false;
      }

      const customerPosition = {
        latitude: parseFloat(customer.latitude),
        longitude: parseFloat(customer.longitude),
      };

      // Calculate distance in meters and convert to kilometers
      const distanceInMeters = geolib.getDistance(
        sourcePosition,
        customerPosition,
      );
      const distanceInKm = distanceInMeters / 1000;

      return distanceInKm <= radiusValue;
    });

    return {
      customers: customersWithinRadius,
      count: customersWithinRadius.length,
    };
  }
}
