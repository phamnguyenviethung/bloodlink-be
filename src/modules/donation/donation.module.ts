import { Module } from '@nestjs/common';
import { DonationService } from './services/donation.service';
import { DonationController } from './controllers/donation.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RolesModule } from '@/share/modules/roles.module';
import { EmailModule } from '@/modules/email/email.module';
import { ReminderService } from './services/reminder.service';
import { ReminderController } from './controllers/reminder.controller';
import { StatsService } from './services/stats.service';
import { StatsController } from './controllers/stats.controller';

@Module({
  imports: [RolesModule, EmailModule],
  controllers: [
    DonationController,
    CampaignController,
    ReminderController,
    StatsController,
  ],
  providers: [DonationService, CampaignService, ReminderService, StatsService],
  exports: [DonationService, CampaignService, ReminderService, StatsService],
})
export class DonationModule {}
