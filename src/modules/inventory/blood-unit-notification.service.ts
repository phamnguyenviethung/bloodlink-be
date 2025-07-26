import { BloodComponentType } from '@/database/entities/Blood.entity';
import { BloodUnit } from '@/database/entities/inventory.entity';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { ThankYouDonorEmailData } from '../email/interfaces/thankYouDonorEmailData.interface';

@Injectable()
export class BloodUnitNotificationService {
  private readonly logger = new Logger(BloodUnitNotificationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
  ) {}

  private getBloodComponentDisplayName(component: BloodComponentType): string {
    const componentNames = {
      [BloodComponentType.WHOLE_BLOOD]: 'Máu toàn phần',
      [BloodComponentType.RED_CELLS]: 'Hồng cầu',
      [BloodComponentType.PLASMA]: 'Huyết tương',
      [BloodComponentType.PLATELETS]: 'Tiểu cầu',
    };
    return componentNames[component] || component;
  }

  private formatDonationDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  }

  async sendThankYouEmailForBloodUnit(bloodUnitId: string): Promise<void> {
    try {
      // Get blood unit with related data
      const bloodUnit = await this.em.findOne(
        BloodUnit,
        { id: bloodUnitId },
        {
          populate: ['member', 'member.account', 'bloodType'],
        },
      );

      if (!bloodUnit) {
        this.logger.error(`Blood unit with ID ${bloodUnitId} not found`);
        return;
      }

      if (!bloodUnit.member?.account?.email) {
        this.logger.error(
          `No email found for donor of blood unit ${bloodUnitId}`,
        );
        return;
      }

      // Prepare email data
      const donorName =
        bloodUnit.member.firstName && bloodUnit.member.lastName
          ? `${bloodUnit.member.firstName} ${bloodUnit.member.lastName}`
          : bloodUnit.member.account.email.split('@')[0]; // Fallback to email username

      const emailData: ThankYouDonorEmailData = {
        donorName,
        bloodGroup: bloodUnit.bloodType.group,
        bloodRh: bloodUnit.bloodType.rh,
        bloodComponent: this.getBloodComponentDisplayName(
          bloodUnit.bloodComponentType,
        ),
        bloodVolume: bloodUnit.bloodVolume,
        donationDate: this.formatDonationDate(bloodUnit.createdAt),
      };

      // Send email
      await this.emailService.sendThankYouDonorEmail(
        bloodUnit.member.account.email,
        emailData,
      );

      this.logger.log(
        `Thank you email sent successfully to donor ${bloodUnit.member.account.email} for blood unit ${bloodUnitId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send thank you email for blood unit ${bloodUnitId}:`,
        error,
      );
      throw error;
    }
  }

  async sendThankYouEmailsForMultipleBloodUnits(
    bloodUnitIds: string[],
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const bloodUnitId of bloodUnitIds) {
      try {
        await this.sendThankYouEmailForBloodUnit(bloodUnitId);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Blood unit ${bloodUnitId}: ${errorMessage}`);
      }
    }

    this.logger.log(
      `Bulk thank you email operation completed: ${results.success} success, ${results.failed} failed`,
    );

    return results;
  }

  async sendThankYouEmailToAllDonors(): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Get all blood units that haven't been used to send thank you emails yet
      // You might want to add a flag to track this
      const bloodUnits = await this.em.find(BloodUnit, {});

      const bloodUnitIds = bloodUnits.map((unit) => unit.id);

      return await this.sendThankYouEmailsForMultipleBloodUnits(bloodUnitIds);
    } catch (error) {
      this.logger.error('Failed to get blood units for bulk email:', error);
      throw error;
    }
  }
}
