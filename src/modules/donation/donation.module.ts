import { Module } from '@nestjs/common';
import { DonationService } from './services/donation.service';
import { DonationController } from './controllers/donation.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RolesModule } from '@/share/modules/roles.module';
import { EmailModule } from '@/modules/email/email.module';
import { ReminderService } from './services/reminder.service';
import { ReminderController } from './controllers/reminder.controller';

@Module({
  imports: [RolesModule, EmailModule],
  controllers: [DonationController, CampaignController, ReminderController],
  providers: [DonationService, CampaignService, ReminderService],
  exports: [DonationService, CampaignService, ReminderService],
})
export class DonationModule {}
