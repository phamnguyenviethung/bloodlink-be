import {
  Staff,
  Account,
  AccountRole,
} from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient, User } from '@clerk/backend';
import { wrap, Transactional } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateStaffProfileDtoType, RegisterStaffDtoType } from '../dtos';
import { IStaffService } from '../interfaces';

@Injectable()
export class StaffService implements IStaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.ADMIN)
    private readonly clerkClient: ClerkClient,
  ) {}

  async getMe(staffId: string): Promise<Staff> {
    const staff = await this.em.findOne(
      Staff,
      { id: staffId },
      {
        populate: ['account'],
      },
    );
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${staffId} not found`);
    }

    return staff;
  }

  async updateStaff(
    staffId: string,
    data: UpdateStaffProfileDtoType,
  ): Promise<Staff> {
    const staff = await this.em.findOne(
      Staff,
      {
        id: staffId,
      },
      { populate: ['account'] },
    );
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${staffId} not found`);
    }

    wrap(staff).assign(data);
    await this.em.flush();

    try {
      await this.clerkClient.users.updateUser(staff.account.id, {
        firstName: staff.firstName,
        lastName: staff.lastName,
      });
    } catch (error) {
      this.logger.error(`Error updating staff ${staff.account.id} in clerk`);
      this.logger.error(error);
    }

    return staff;
  }

  /**
   * Register a new staff account (Admin only)
   * This method will:
   * 1. Check if the email already exists
   * 2. Create a staff account in Clerk
   * 3. Create a staff account in the database
   */
  @Transactional()
  async registerStaff(data: RegisterStaffDtoType): Promise<Staff> {
    const existingAccount = await this.em.findOne(Account, {
      email: data.email,
    });
    if (existingAccount) {
      throw new BadRequestException(
        `Account with email ${data.email} already exists`,
      );
    }

    let clerkUser: User;
    try {
      clerkUser = await this.clerkClient.users.createUser({
        emailAddress: [data.email],
        firstName: data.firstName,
        lastName: data.lastName,
        publicMetadata: { role: AccountRole.STAFF },
        password: '12345678',
      });

      this.logger.log(
        `Staff account created for ${data.email} with clerkId: ${clerkUser.id}`,
      );
    } catch (error) {
      this.logger.error(`Error creating staff account`, error);
      throw new BadRequestException('Failed to create staff account');
    }

    const account = this.em.create(Account, {
      id: clerkUser.id,
      email: data.email,
      role: AccountRole.STAFF,
    });

    const staff = this.em.create(Staff, {
      account,
      id: clerkUser.id,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });

    await this.em.persistAndFlush([account, staff]);

    this.logger.log(`Staff account created for ${data.email}`);

    return staff;
  }
}
