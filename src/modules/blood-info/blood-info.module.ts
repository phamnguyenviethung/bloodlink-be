import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BloodInfoController } from './blood-info.controller';
import { BloodInfoService } from './blood-info.service';
import {
  BloodType,
  BloodTypeInfo,
  BloodCompatibility,
} from '../../database/entities/Blood.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([BloodType, BloodTypeInfo, BloodCompatibility]),
  ],
  controllers: [BloodInfoController],
  providers: [BloodInfoService],
  exports: [BloodInfoService],
})
export class BloodInfoModule {}
