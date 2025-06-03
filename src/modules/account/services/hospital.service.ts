import { Hospital } from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { ClerkClient } from '@clerk/backend';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IHospitalService } from '../interfaces';
import { UpdateHospitalProfileDtoType } from './../dtos/profile';

@Injectable()
export class HospitalSerivce implements IHospitalService {
  private readonly logger = new Logger(HospitalSerivce.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.ADMIN)
    private readonly clerkClient: ClerkClient,
  ) {}

  async getMe(hoispitalId: string): Promise<Hospital> {
    const hospital = await this.em.findOne(
      Hospital,
      { id: hoispitalId },
      {
        populate: ['account'],
      },
    );
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hoispitalId} not found`);
    }

    return hospital;
  }

  async updateHospital(
    hoispitalId: string,
    data: UpdateHospitalProfileDtoType,
  ): Promise<Hospital> {
    const hospital = await this.em.findOne(
      Hospital,
      {
        id: hoispitalId,
      },
      { populate: ['account'] },
    );
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hoispitalId} not found`);
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
}
