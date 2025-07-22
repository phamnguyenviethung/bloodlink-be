import { BloodComponentType } from "@/database/entities/Blood.entity";
import { Campaign } from "@/database/entities/campaign.entity";
import { BloodUnit } from "@/database/entities/inventory.entity";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { StatisticsResponseDto } from "./dtos/statistics.dto";

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly em: EntityManager) {}

  async getSystemStatistics(): Promise<StatisticsResponseDto> {
    try {
      this.logger.log('Fetching system statistics...');

      // Get total number of campaigns
      const totalCampaigns = await this.em.count(Campaign);

      // Get total whole blood donated (volume and count)
      const wholeBloodUnits = await this.em.find(BloodUnit, {
        bloodComponentType: BloodComponentType.WHOLE_BLOOD,
      });

      const totalBloodDonated = wholeBloodUnits.reduce(
        (total, unit) => total + unit.bloodVolume,
        0,
      );

      const totalBloodUnits = wholeBloodUnits.length;

      this.logger.log(
        `Statistics fetched - Campaigns: ${totalCampaigns}, Blood Units: ${totalBloodUnits}, Total Volume: ${totalBloodDonated}ml`,
      );

      return {
        totalCampaigns,
        totalBloodDonated,
        totalBloodUnits,
      };
    } catch (error) {
      this.logger.error('Error fetching system statistics:', error);
      throw error;
    }
  }
}
