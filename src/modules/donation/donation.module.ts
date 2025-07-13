import { Module } from '@nestjs/common';
import { DonationService } from './services/donation.service';
import { DonationController } from './controllers/donation.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RolesModule } from '@/share/modules/roles.module';
import { DonationResultTemplateService } from './services/donation-result-template.service';
import { DonationResultTemplateController } from './controllers/donation-result-template.controller';
import { EmailModule } from '@/modules/email/email.module';

@Module({
  imports: [RolesModule, EmailModule],
  controllers: [
    DonationController,
    CampaignController,
    DonationResultTemplateController,
  ],
  providers: [DonationService, CampaignService, DonationResultTemplateService],
  exports: [DonationService, CampaignService, DonationResultTemplateService],
})
export class DonationModule {}
