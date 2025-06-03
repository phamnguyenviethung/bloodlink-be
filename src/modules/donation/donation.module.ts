import { Module } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RolesModule } from '@/share/modules/roles.module';

@Module({
  imports: [RolesModule],
  controllers: [DonationController, CampaignController],
  providers: [DonationService, CampaignService],
  exports: [DonationService, CampaignService],
})
export class DonationModule {}
