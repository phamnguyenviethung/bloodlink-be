import { Module } from '@nestjs/common';
import { DonationService } from './services/donation.service';
import { DonationController } from './controllers/donation.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RolesModule } from '@/share/modules/roles.module';
import { DonationResultTemplateService } from './services/donation-result-template.service';
import { DonationResultTemplateController } from './controllers/donation-result-template.controller';
import { EmailModule } from '@/modules/email/email.module';
import { ReminderService } from './services/reminder.service';
import { ReminderController } from './controllers/reminder.controller';

@Module({
  imports: [RolesModule, EmailModule],
  controllers: [
    DonationController,
    CampaignController,
    DonationResultTemplateController,
    ReminderController,
  ],
  providers: [
    DonationService,
    CampaignService,
    DonationResultTemplateService,
    ReminderService,
  ],
  exports: [
    DonationService,
    CampaignService,
    DonationResultTemplateService,
    ReminderService,
  ],
})
export class DonationModule {}
