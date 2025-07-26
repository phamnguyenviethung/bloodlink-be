import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { BloodUnitNotificationService } from './blood-unit-notification.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [EmailModule],
  controllers: [InventoryController],
  providers: [InventoryService, BloodUnitNotificationService],
  exports: [InventoryService, BloodUnitNotificationService],
})
export class InventoryModule {}
