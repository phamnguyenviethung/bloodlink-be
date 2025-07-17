import { Customer } from '@/database/entities/Account.entity';
import {
  DonationReminder,
  ReminderStatus,
} from '@/database/entities/campaign.entity';

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

    // Create the reminder entity
    const reminder = this.em.create(DonationReminder, {
      donor,
      status: ReminderStatus.PENDING,
      scheduledDate: reminderDate,
      message:
        'You are now eligible to donate blood again. Consider scheduling your next donation!',
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

  /**
   * Get pending reminders that are due to be sent
   */
  async getPendingReminders(): Promise<DonationReminder[]> {
    const now = new Date();

    // Find all pending reminders that are due to be sent
    const pendingReminders = await this.em.find(
      DonationReminder,
      {
        status: ReminderStatus.PENDING,
        scheduledDate: { $lte: now },
      },
      {
        populate: ['donor', 'donor.account'],
      },
    );

    this.logger.log(
      `Found ${pendingReminders.length} pending reminders to process`,
    );

    return pendingReminders;
  }

  /**
   * Get all reminders for a donor
   */
  async getDonorReminders(
    donorId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: ReminderStatus;
    },
  ): Promise<{ items: DonationReminder[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = { donor: { id: donorId } };

    if (options?.status) {
      where.status = options.status;
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
