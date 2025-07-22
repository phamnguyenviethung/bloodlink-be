import { Campaign } from "@/database/entities/campaign.entity";
import { BloodUnit } from "@/database/entities/inventory.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";

@Module({
  imports: [MikroOrmModule.forFeature([Campaign, BloodUnit])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
