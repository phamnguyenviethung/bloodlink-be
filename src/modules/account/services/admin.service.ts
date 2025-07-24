import {
  Account,
  AccountRole,
  Admin,
} from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient, User } from '@clerk/backend';
import { Transactional, wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { RegisterAdminDtoType, UpdateAdminProfileDtoType } from '../dtos';
import { IAdminService } from '../interfaces';

@Injectable()
export class AdminService implements IAdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.ADMIN)
    private readonly clerkClient: ClerkClient,
  ) {}

  async getMe(adminId: string): Promise<Admin> {
    const admin = await this.em.findOne(
      Admin,
      { id: adminId },
      {
        populate: ['account'],
      },
    );
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    return admin;
  }

  async updateAdmin(
    adminId: string,
    data: UpdateAdminProfileDtoType,
  ): Promise<Admin> {
    const admin = await this.em.findOne(
      Admin,
      {
        id: adminId,
      },
      { populate: ['account'] },
    );
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    wrap(admin).assign(data);
    await this.em.flush();

    try {
      await this.clerkClient.users.updateUser(admin.account.id, {
        firstName: admin.firstName,
        lastName: admin.lastName,
      });
    } catch (error) {
      this.logger.error(`Error updating admin ${admin.account.id} in clerk`);
      this.logger.error(error);
    }

    return admin;
  }

  async updateAvatar(adminId: string, avatarUrl: string): Promise<Admin> {
    const admin = await this.em.findOne(Admin, { id: adminId });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    admin.avatar = avatarUrl;
    await this.em.flush();

    return admin;
  }

  /**
   * Register a new admin account (Admin only)
   * This method will:
   * 1. Check if the email already exists
   * 2. Create an admin account in Clerk
   * 3. Create an admin account in the database
   */
  @Transactional()
  async registerAdmin(data: RegisterAdminDtoType): Promise<Admin> {
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
        publicMetadata: { role: AccountRole.ADMIN },
        password: '12345678',
      });

      this.logger.log(
        `Admin account created for ${data.email} with clerkId: ${clerkUser.id}`,
      );
    } catch (error) {
      this.logger.error(`Error creating admin account`, error);
      throw new BadRequestException('Failed to create admin account');
    }

    const account = this.em.create(Account, {
      id: clerkUser.id,
      email: data.email,
      role: AccountRole.ADMIN,
    });

    const admin = this.em.create(Admin, {
      account,
      id: clerkUser.id,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await this.em.persistAndFlush([account, admin]);

    this.logger.log(`Admin account created for ${data.email}`);

    return admin;
  }
}
