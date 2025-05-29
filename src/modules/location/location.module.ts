import { Module } from '@nestjs/common';
import { LocationService } from './services/location.service';
import { LocationController } from './location.controller';
import { VietnamProvinceService } from './services/vietnamProvince.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [LocationController],
  providers: [LocationService, VietnamProvinceService],
  exports: [VietnamProvinceService, LocationService],
})
export class LocationModule {}
