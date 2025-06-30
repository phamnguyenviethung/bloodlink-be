import {
  Hospital,
  Account,
  AccountRole,
} from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient } from '@clerk/backend';
import { wrap, Transactional } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IHospitalService } from '../interfaces';
import { UpdateHospitalProfileDtoType } from '../dtos/profile';
import { RegisterHospitalDtoType } from '../dtos/hospital';

@Injectable()
export class HospitalSerivce implements IHospitalService {
  private readonly logger = new Logger(HospitalSerivce.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.CLIENT)
    private readonly clerkClient: ClerkClient,
  ) {}

  async getMe(hospitalId: string): Promise<Hospital> {
    const hospital = await this.em.findOne(
      Hospital,
      { id: hospitalId },
      {
        populate: ['account'],
      },
    );
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    return hospital;
  }

  async updateHospital(
    hospitalId: string,
    data: UpdateHospitalProfileDtoType,
  ): Promise<Hospital> {
    const hospital = await this.em.findOne(
      Hospital,
      {
        id: hospitalId,
      },
      { populate: ['account'] },
    );
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    wrap(hospital).assign(data);
    await this.em.flush();

    try {
      await this.clerkClient.users.updateUser(hospital.account.id, {
        firstName: hospital.name,
        lastName: hospital.name,
      });
    } catch (error) {
      this.logger.error(
        `Error updating hospital ${hospital.account.id} in clerk`,
      );
      this.logger.error(error);
    }

    return hospital;
  }

  /**
   * Register a new hospital account (Admin only)
   * This method will:
   * 1. Check if the email already exists
   * 2. Create an invitation in Clerk
   * 3. Create a hospital account in the database
   */
  @Transactional()
  async registerHospital(data: RegisterHospitalDtoType): Promise<Hospital> {
    const existingAccount = await this.em.findOne(Account, {
      email: data.email,
    });
    if (existingAccount) {
      throw new BadRequestException(
        `Account with email ${data.email} already exists`,
      );
    }

    try {
      await this.clerkClient.users.createUser({
        emailAddress: [data.email],
        firstName: data.name,
        lastName: data.name,
        publicMetadata: { role: AccountRole.HOSPITAL },
        password: '12345678',
      });

      this.logger.log(`Hospital account created for ${data.email}`);
    } catch (error) {
      this.logger.error(`Error creating hospital account`, error);
      throw new BadRequestException('Failed to create hospital account');
    }

    const account = this.em.create(Account, {
      email: data.email,
      role: AccountRole.HOSPITAL,
    });

    const hospital = this.em.create(Hospital, {
      account,
      name: data.name,
      phone: data.phone,
      longitude: data.longitude,
      latitude: data.latitude,
      wardCode: data.wardCode,
      districtCode: data.districtCode,
      provinceCode: data.provinceCode,
      wardName: data.wardName,
      districtName: data.districtName,
      provinceName: data.provinceName,
    });

    await this.em.persistAndFlush([account, hospital]);

    this.logger.log(`Hospital account created for ${data.email}`);

    return hospital;
  }
}
