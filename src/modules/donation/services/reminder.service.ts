import { Customer } from '@/database/entities/Account.entity';
import { DonationReminder } from '@/database/entities/campaign.entity';

import { EntityManager, Transactional } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Create a donation eligibility reminder for a donor
   */
  @Transactional()
  async createEligibilityReminder(donor: Customer): Promise<DonationReminder> {
    // Standard waiting period is 3 months (90 days) between whole blood donations
    const nextEligibleDate = new Date();
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

    // Create a reminder for 1 day after they become eligible
    const reminderDate = new Date(nextEligibleDate);
    reminderDate.setDate(reminderDate.getDate() + 1);

    const reminder = this.em.create(DonationReminder, {
      donor,
      scheduledDate: reminderDate,
      message:
        'You are now eligible to donate blood again! Please consider scheduling your next donation to help save lives.',
      metadata: {
        lastDonationDate: donor.lastDonationDate,
        eligibleDate: nextEligibleDate,
      },
    });

    await this.em.persistAndFlush(reminder);
    this.logger.log(
      `Created eligibility reminder for donor ${donor.id} scheduled for ${reminderDate}`,
    );

    return reminder;
  }

  async getDonorReminders(
    donorId: string,
    options?: {
      page?: number;
      limit?: number;
      filter?: 'all' | 'due' | 'upcoming';
    },
  ): Promise<{ items: DonationReminder[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = { donor: { id: donorId } };
    const now = new Date();
    if (options?.filter === 'due') {
      where.scheduledDate = { $lte: now };
    } else if (options?.filter === 'upcoming') {
      where.scheduledDate = { $gt: now };
    }

    const [items, total] = await this.em.findAndCount(DonationReminder, where, {
      populate: ['donor', 'campaignDonation'],
      limit,
      offset,
      orderBy: { scheduledDate: 'DESC' },
    });

    return { items, total };
  }
}
