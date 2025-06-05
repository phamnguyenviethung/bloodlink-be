import { Admin } from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient } from '@clerk/backend';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateAdminProfileDtoType } from '../dtos';
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
}
