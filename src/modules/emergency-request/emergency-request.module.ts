import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';
import { EmergencyRequestController } from './emergency-request.controller';
import { EmergencyRequestService } from './emergency-request.service';

@Module({
  imports: [InventoryModule],
  controllers: [EmergencyRequestController],
  providers: [EmergencyRequestService],
  exports: [EmergencyRequestService],
})
export class EmergencyRequestModule {}
