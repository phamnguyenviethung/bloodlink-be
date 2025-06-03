import { Staff } from '@/database/entities/account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient } from '@clerk/backend';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateStaffProfileDtoType } from '../dtos';
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
}
