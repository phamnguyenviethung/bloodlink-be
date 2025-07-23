import {
  DonationReminder,
  ReminderType,
  CampaignDonation,
  CampaignDonationStatus,
} from '@/database/entities/campaign.entity';

import { EntityManager, Transactional } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Create a before-donation reminder when appointment is confirmed
   */
  @Transactional()
  async createBeforeDonationReminder(
    campaignDonation: CampaignDonation,
  ): Promise<DonationReminder> {
    if (
      campaignDonation.currentStatus !==
        CampaignDonationStatus.APPOINTMENT_CONFIRMED ||
      !campaignDonation.appointmentDate
    ) {
      this.logger.warn(
        `Cannot create before-donation reminder: donation ${campaignDonation.id} is not confirmed or has no appointment date`,
      );
      throw new Error('Donation must have confirmed appointment date');
    }

    // Create reminder with health preparation tips
    const reminder = this.em.create(DonationReminder, {
      donor: campaignDonation.donor,
      message:
        'Chuẩn bị cho buổi hiến máu sắp tới: Hãy đảm bảo ngủ đủ giấc, uống nhiều nước, ăn bữa ăn đầy đủ trước khi đến và tránh các hoạt động gắng sức. Mang theo CMND/CCCD và đến sớm 15 phút.',
      type: ReminderType.BEFORE_DONATION,
      metadata: {
        appointmentDate: campaignDonation.appointmentDate,
        campaignName: campaignDonation.campaign.name,
        location: campaignDonation.campaign.location || 'Địa điểm hiến máu',
      },
      campaignDonation,
    });

    await this.em.persistAndFlush(reminder);
    this.logger.log(
      `Created before-donation reminder for donor ${campaignDonation.donor.id}`,
    );

    return reminder;
  }

  /**
   * Create an after-donation reminder for health monitoring
   */
  @Transactional()
  async createAfterDonationReminder(
    campaignDonation: CampaignDonation,
  ): Promise<DonationReminder> {
    if (campaignDonation.currentStatus !== CampaignDonationStatus.COMPLETED) {
      this.logger.warn(
        `Cannot create after-donation reminder: donation ${campaignDonation.id} is not completed`,
      );
      throw new Error('Donation must be completed');
    }

    // Create reminder with post-donation care tips
    const reminder = this.em.create(DonationReminder, {
      donor: campaignDonation.donor,
      message:
        'Cảm ơn bạn đã hiến máu! Hãy nhớ: Uống nhiều nước, nghỉ ngơi đầy đủ, tránh hoạt động gắng sức trong 24 giờ, không hút thuốc trong 2 giờ, không uống rượu bia trong 24 giờ. Nếu thấy chóng mặt hoặc chảy máu tại vết tiêm, hãy liên hệ ngay với chúng tôi.',
      type: ReminderType.AFTER_DONATION,
      metadata: {
        donationDate: new Date(),
        nextEligibleDate: this.calculateNextEligibleDate(),
      },
      campaignDonation,
    });

    await this.em.persistAndFlush(reminder);
    this.logger.log(
      `Created after-donation reminder for donor ${campaignDonation.donor.id}`,
    );

    return reminder;
  }

  /**
   * Get all reminders for a donor with filtering options
   */
  async getDonorReminders(
    donorId: string,
    options?: {
      page?: number;
      limit?: number;
      filter?: 'all' | 'before_donation' | 'after_donation';
    },
  ): Promise<{ items: DonationReminder[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = { donor: { id: donorId } };

    // Filter by reminder type
    if (options?.filter === 'before_donation') {
      where.type = ReminderType.BEFORE_DONATION;
    } else if (options?.filter === 'after_donation') {
      where.type = ReminderType.AFTER_DONATION;
    }

    const [items, total] = await this.em.findAndCount(DonationReminder, where, {
      populate: ['donor', 'campaignDonation', 'campaignDonation.campaign'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  /**
   * Calculate next eligible donation date (3 months from now)
   */
  private calculateNextEligibleDate(): Date {
    const nextEligibleDate = new Date();
    nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
    return nextEligibleDate;
  }
}
